import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  BatchWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';
import {
  extractRBACContext,
  requirePermission,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  RBACContext,
} from './rbac';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.MAIN_TABLE || 'resources';

interface AuditLog {
  pk: string;
  sk: string;
  action: string;
  userId: string;
  timestamp: string;
  details: Record<string, unknown>;
}

async function createAuditLog(
  action: string,
  context: RBACContext,
  details: Record<string, unknown>
): Promise<void> {
  const auditLog: AuditLog = {
    pk: 'AUDIT',
    sk: `${context.timestamp}#${randomUUID()}`,
    action,
    userId: context.userId,
    timestamp: context.timestamp,
    details,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: auditLog,
    })
  );
}

function validateResourceItem(item: Record<string, unknown>): void {
  if (!item || typeof item !== 'object') {
    throw new ValidationError('Item must be a valid object');
  }
}

async function getResources(): Promise<APIGatewayProxyResult> {
  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'attribute_not_exists(pk) OR pk <> :auditPk',
        ExpressionAttributeValues: {
          ':auditPk': 'AUDIT',
        },
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: result.Items || [],
        count: result.Count || 0,
      }),
    };
  } catch (error) {
    console.error('Error fetching resources:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}

async function getResourceById(id: string): Promise<APIGatewayProxyResult> {
  try {
    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Resource ID is required' }),
      };
    }

    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { pk: id },
      })
    );

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Resource not found' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.Item),
    };
  } catch (error) {
    console.error('Error fetching resource:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}

async function createResource(
  item: Record<string, unknown>,
  context: RBACContext
): Promise<APIGatewayProxyResult> {
  try {
    requirePermission(context.role, ['admin', 'operator']);
    validateResourceItem(item);

    const id = randomUUID();
    const now = new Date().toISOString();
    const resource = {
      pk: id,
      ...item,
      createdAt: now,
      updatedAt: now,
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: resource,
      })
    );

    await createAuditLog('CREATE', context, { id, resource });

    return {
      statusCode: 201,
      body: JSON.stringify(resource),
    };
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: error.message }),
      };
    }
    if (error instanceof ValidationError) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: error.message }),
      };
    }
    console.error('Error creating resource:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}

async function updateResource(
  id: string,
  updates: Record<string, unknown>,
  context: RBACContext
): Promise<APIGatewayProxyResult> {
  try {
    requirePermission(context.role, ['admin', 'operator']);

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Resource ID is required' }),
      };
    }

    const existing = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { pk: id },
      })
    );

    if (!existing.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Resource not found' }),
      };
    }

    const now = new Date().toISOString();
    const updateExpressionParts: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, unknown> = {};

    Object.entries(updates).forEach(([key, value], index) => {
      const attrName = `#attr${index}`;
      const attrValue = `:val${index}`;
      updateExpressionParts.push(`${attrName} = ${attrValue}`);
      expressionAttributeNames[attrName] = key;
      expressionAttributeValues[attrValue] = value;
    });

    updateExpressionParts.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = now;

    await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { pk: id },
        UpdateExpression: `SET ${updateExpressionParts.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      })
    );

    await createAuditLog('UPDATE', context, { id, updates });

    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { pk: id },
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify(result.Item),
    };
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: error.message }),
      };
    }
    console.error('Error updating resource:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}

async function deleteResource(
  id: string,
  context: RBACContext
): Promise<APIGatewayProxyResult> {
  try {
    requirePermission(context.role, ['admin']);

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Resource ID is required' }),
      };
    }

    const existing = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { pk: id },
      })
    );

    if (!existing.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Resource not found' }),
      };
    }

    await docClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { pk: id },
      })
    );

    await createAuditLog('DELETE', context, { id });

    return {
      statusCode: 204,
      body: '',
    };
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: error.message }),
      };
    }
    console.error('Error deleting resource:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}

async function bulkImportResources(
  items: Record<string, unknown>[],
  context: RBACContext
): Promise<APIGatewayProxyResult> {
  try {
    requirePermission(context.role, ['admin', 'operator']);

    if (!Array.isArray(items) || items.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Items must be a non-empty array' }),
      };
    }

    const now = new Date().toISOString();
    const processedItems = items.map((item) => ({
      ...item,
      pk: randomUUID(),
      createdAt: now,
      updatedAt: now,
    }));

    const errors: string[] = [];
    let imported = 0;
    let failed = 0;

    for (let i = 0; i < processedItems.length; i += 25) {
      const batch = processedItems.slice(i, i + 25);
      const requestItems = batch.map((item) => ({
        PutRequest: {
          Item: item,
        },
      }));

      try {
        await docClient.send(
          new BatchWriteCommand({
            RequestItems: {
              [TABLE_NAME]: requestItems,
            },
          })
        );
        imported += batch.length;
      } catch (batchError) {
        const errorMsg = `Batch ${Math.floor(i / 25) + 1} failed: ${batchError instanceof Error ? batchError.message : 'Unknown error'}`;
        errors.push(errorMsg);
        failed += batch.length;
      }
    }

    await createAuditLog('BULK_IMPORT', context, {
      totalItems: items.length,
      imported,
      failed,
      errors,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        imported,
        failed,
        errors,
      }),
    };
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: error.message }),
      };
    }
    if (error instanceof ValidationError) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: error.message }),
      };
    }
    console.error('Error bulk importing resources:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const context = extractRBACContext(event);
    const method = event.httpMethod;
    const path = event.path;
    const body = event.body ? JSON.parse(event.body) : {};
    const pathParameters = event.pathParameters || {};

    if (method === 'GET' && path === '/resources') {
      return await getResources();
    }

    if (method === 'GET' && path.match(/^\/resources\/[^/]+$/)) {
      const id = pathParameters.id || path.split('/').pop();
      return await getResourceById(id);
    }

    if (method === 'POST' && path === '/resources') {
      return await createResource(body, context);
    }

    if (method === 'PUT' && path.match(/^\/resources\/[^/]+$/)) {
      const id = pathParameters.id || path.split('/').pop();
      return await updateResource(id, body, context);
    }

    if (method === 'DELETE' && path.match(/^\/resources\/[^/]+$/)) {
      const id = pathParameters.id || path.split('/').pop();
      return await deleteResource(id, context);
    }

    if (method === 'POST' && path === '/api/0/bulk') {
      return await bulkImportResources(body.items || [], context);
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Not found' }),
    };
  } catch (error) {
    console.error('Unhandled error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}