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
import { extractAuthContext, checkPermission, hasMinimumRole, Role } from './rbac';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-northeast-1' });
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.MAIN_TABLE || 'resources';

interface Resource {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

interface AuditLog {
  pk: string;
  sk: string;
  action: string;
  userId: string;
  role: string;
  details: Record<string, unknown>;
  timestamp: number;
}

const createAuditLog = async (
  action: string,
  userId: string,
  role: Role,
  details: Record<string, unknown>
): Promise<void> => {
  const auditLog: AuditLog = {
    pk: 'AUDIT',
    sk: `${Date.now()}-${randomUUID()}`,
    action,
    userId,
    role,
    details,
    timestamp: Date.now(),
  };

  try {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: auditLog,
      })
    );
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};

const errorResponse = (statusCode: number, message: string): APIGatewayProxyResult => {
  return {
    statusCode,
    body: JSON.stringify({ error: message }),
    headers: { 'Content-Type': 'application/json' },
  };
};

const successResponse = (statusCode: number, data: unknown): APIGatewayProxyResult => {
  return {
    statusCode,
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  };
};

const getResources = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const authContext = extractAuthContext(event);

    if (!checkPermission(authContext.role, ['admin', 'operator', 'viewer'])) {
      return errorResponse(403, 'Forbidden');
    }

    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'attribute_not_exists(pk) OR pk <> :auditPk',
        ExpressionAttributeValues: {
          ':auditPk': 'AUDIT',
        },
      })
    );

    const resources = (result.Items || []).filter((item) => item.pk !== 'AUDIT');

    return successResponse(200, {
      items: resources,
      count: resources.length,
    });
  } catch (error) {
    console.error('Error in getResources:', error);
    return errorResponse(500, 'Internal Server Error');
  }
};

const getResourceById = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const authContext = extractAuthContext(event);

    if (!checkPermission(authContext.role, ['admin', 'operator', 'viewer'])) {
      return errorResponse(403, 'Forbidden');
    }

    const resourceId = event.pathParameters?.id;
    if (!resourceId) {
      return errorResponse(400, 'Missing resource ID');
    }

    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { id: resourceId },
      })
    );

    if (!result.Item) {
      return errorResponse(404, 'Resource not found');
    }

    return successResponse(200, result.Item);
  } catch (error) {
    console.error('Error in getResourceById:', error);
    return errorResponse(500, 'Internal Server Error');
  }
};

const createResource = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const authContext = extractAuthContext(event);

    if (!hasMinimumRole(authContext.role, 'operator')) {
      return errorResponse(403, 'Forbidden');
    }

    const body = event.body ? JSON.parse(event.body) : {};

    if (!body.name || typeof body.name !== 'string') {
      return errorResponse(400, 'Invalid or missing name field');
    }

    const resource: Resource = {
      id: randomUUID(),
      name: body.name,
      description: body.description || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: authContext.userId,
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: resource,
      })
    );

    await createAuditLog('CREATE', authContext.userId, authContext.role, {
      resourceId: resource.id,
      name: resource.name,
    });

    return successResponse(201, resource);
  } catch (error) {
    console.error('Error in createResource:', error);
    return errorResponse(500, 'Internal Server Error');
  }
};

const updateResource = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const authContext = extractAuthContext(event);

    if (!hasMinimumRole(authContext.role, 'operator')) {
      return errorResponse(403, 'Forbidden');
    }

    const resourceId = event.pathParameters?.id;
    if (!resourceId) {
      return errorResponse(400, 'Missing resource ID');
    }

    const body = event.body ? JSON.parse(event.body) : {};

    const getResult = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { id: resourceId },
      })
    );

    if (!getResult.Item) {
      return errorResponse(404, 'Resource not found');
    }

    const updateData: Record<string, unknown> = {};
    if (body.name) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    updateData.updatedAt = Date.now();

    const updateExpression = Object.keys(updateData)
      .map((key) => `${key} = :${key}`)
      .join(', ');

    const expressionAttributeValues: Record<string, unknown> = {};
    Object.entries(updateData).forEach(([key, value]) => {
      expressionAttributeValues[`:${key}`] = value;
    });

    await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id: resourceId },
        UpdateExpression: `SET ${updateExpression}`,
        ExpressionAttributeValues: expressionAttributeValues,
      })
    );

    await createAuditLog('UPDATE', authContext.userId, authContext.role, {
      resourceId,
      changes: updateData,
    });

    const updatedResult = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { id: resourceId },
      })
    );

    return successResponse(200, updatedResult.Item);
  } catch (error) {
    console.error('Error in updateResource:', error);
    return errorResponse(500, 'Internal Server Error');
  }
};

const deleteResource = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const authContext = extractAuthContext(event);

    if (!hasMinimumRole(authContext.role, 'admin')) {
      return errorResponse(403, 'Forbidden');
    }

    const resourceId = event.pathParameters?.id;
    if (!resourceId) {
      return errorResponse(400, 'Missing resource ID');
    }

    const getResult = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { id: resourceId },
      })
    );

    if (!getResult.Item) {
      return errorResponse(404, 'Resource not found');
    }

    await docClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { id: resourceId },
      })
    );

    await createAuditLog('DELETE', authContext.userId, authContext.role, {
      resourceId,
    });

    return successResponse(204, null);
  } catch (error) {
    console.error('Error in deleteResource:', error);
    return errorResponse(500, 'Internal Server Error');
  }
};

const bulkImportResources = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const authContext = extractAuthContext(event);

    if (!hasMinimumRole(authContext.role, 'operator')) {
      return errorResponse(403, 'Forbidden');
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const items = body.items || [];

    if (!Array.isArray(items)) {
      return errorResponse(400, 'Invalid items format');
    }

    if (items.length === 0) {
      return errorResponse(400, 'No items to import');
    }

    const now = Date.now();
    const processedItems = items.map((item: Record<string, unknown>) => ({
      ...item,
      id: item.id || randomUUID(),
      createdAt: item.createdAt || now,
      updatedAt: item.updatedAt || now,
      createdBy: authContext.userId,
    }));

    const batchSize = 25;
    let imported = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < processedItems.length; i += batchSize) {
      const batch = processedItems.slice(i, i + batchSize);
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
        failed += batch.length;
        errors.push(`Batch ${Math.floor(i / batchSize) + 1} failed: ${String(batchError)}`);
      }
    }

    await createAuditLog('BULK_IMPORT', authContext.userId, authContext.role, {
      imported,
      failed,
      total: processedItems.length,
    });

    return successResponse(200, {
      imported,
      failed,
      errors,
    });
  } catch (error) {
    console.error('Error in bulkImportResources:', error);
    return errorResponse(500, 'Internal Server Error');
  }
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const httpMethod = event.httpMethod;
  const path = event.path;

  try {
    if (httpMethod === 'GET' && path === '/resources') {
      return await getResources(event);
    }

    if (httpMethod === 'GET' && path.match(/^\/resources\/[^/]+$/)) {
      return await getResourceById(event);
    }

    if (httpMethod === 'POST' && path === '/resources') {
      return await createResource(event);
    }

    if (httpMethod === 'PUT' && path.match(/^\/resources\/[^/]+$/)) {
      return await updateResource(event);
    }

    if (httpMethod === 'DELETE' && path.match(/^\/resources\/[^/]+$/)) {
      return await deleteResource(event);
    }

    if (httpMethod === 'POST' && path === '/api/resources/bulk') {
      return await bulkImportResources(event);
    }

    return errorResponse(404, 'Not Found');
  } catch (error) {
    console.error('Unhandled error:', error);
    return errorResponse(500, 'Internal Server Error');
  }
};