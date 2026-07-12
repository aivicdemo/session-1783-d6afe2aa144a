import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  DynamoDBClient,
  BatchWriteItemCommand,
  BatchWriteItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';
import {
  extractAuthContext,
  requirePermission,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from './rbac';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-northeast-1' });
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.MAIN_TABLE || 'FoodExpenseManagement';

interface AuditLog {
  pk: string;
  sk: string;
  action: string;
  userId: string;
  timestamp: number;
  details: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

interface User {
  id: string;
  email: string;
  passwordHash: string;
  username: string;
  familySize?: number;
  allergies?: string;
  dietaryRestrictions?: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

interface MonthlyBudget {
  id: string;
  userId: string;
  yearMonth: string;
  budgetAmount: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

interface ExpenseRecord {
  id: string;
  userId: string;
  yearMonth: string;
  expenseDate: number;
  category: string;
  item: string;
  amount: number;
  storeName?: string;
  memo?: string;
  createdAt: number;
  updatedAt: number;
}

interface PurchaseRecord {
  id: string;
  userId: string;
  purchaseDate: number;
  productName: string;
  category: string;
  purchaseAmount: number;
  quantity?: number;
  unitPrice?: number;
  purchaseStore?: string;
  memo?: string;
  createdAt: number;
  updatedAt: number;
}

interface Ingredient {
  id: string;
  userId: string;
  ingredientName: string;
  category: string;
  unit: string;
  averageUnitPrice?: number;
  storageMethod?: string;
  shelfLifeDays?: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

interface Distributor {
  id: string;
  distributorName: string;
  distributorType: string;
  description?: string;
  address?: string;
  phoneNumber?: string;
  website?: string;
  isAvailable: boolean;
  createdAt: number;
  updatedAt: number;
}

interface Supermarket {
  id: string;
  supermarketName: string;
  distributorId: string;
  address?: string;
  phoneNumber?: string;
  businessHours?: string;
  pointRewardRate?: number;
  discountInfo?: string;
  isAvailable: boolean;
  createdAt: number;
  updatedAt: number;
}

interface Inventory {
  id: string;
  userId: string;
  ingredientId: string;
  currentQuantity: number;
  unit: string;
  expiryDate?: number;
  storageLocation?: string;
  purchaseDate: number;
  purchaseRecordId?: string;
  lastUpdatedAt: number;
  createdAt: number;
  updatedAt: number;
}

interface PriceData {
  id: string;
  ingredientId: string;
  distributorId: string;
  supermarketId?: string;
  price: number;
  unit: string;
  effectiveStartDate: number;
  effectiveEndDate?: number;
  discountRate?: number;
  discountPrice?: number;
  discountStartDate?: number;
  discountEndDate?: number;
  inventoryStatus?: string;
  createdAt: number;
  updatedAt: number;
  createdBy?: string;
}

interface OverageAnalysis {
  id: string;
  userId: string;
  monthlyBudgetId: string;
  analysisYearMonth: string;
  ingredientCategory: string;
  budgetAmount: number;
  actualAmount: number;
  overageAmount: number;
  overageRate: number;
  mainReason: string;
  reasonDetails?: string;
  purchaseCount: number;
  averageUnitPrice: number;
  improvementMeasures?: string;
  createdAt: number;
  updatedAt: number;
  createdBy?: string;
}

interface ReductionAnalysis {
  id: string;
  userId: string;
  measureName: string;
  measureDescription?: string;
  implementationStartDate: number;
  implementationEndDate?: number;
  preImplementationTotal: number;
  postImplementationTotal: number;
  reductionAmount: number;
  reductionRate: number;
  comparisonPeriodDays: number;
  measureStatus: string;
  createdAt: number;
  updatedAt: number;
  createdBy?: string;
}

type TableType =
  | User
  | MonthlyBudget
  | ExpenseRecord
  | PurchaseRecord
  | Ingredient
  | Distributor
  | Supermarket
  | Inventory
  | PriceData
  | OverageAnalysis
  | ReductionAnalysis;

const TABLE_INDICES: Record<number, { name: string; pkField: string; skField?: string }> = {
  0: { name: 'User', pkField: 'id' },
  1: { name: 'MonthlyBudget', pkField: 'id' },
  2: { name: 'ExpenseRecord', pkField: 'id' },
  3: { name: 'PurchaseRecord', pkField: 'id' },
  4: { name: 'Ingredient', pkField: 'id' },
  5: { name: 'Distributor', pkField: 'id' },
  6: { name: 'Supermarket', pkField: 'id' },
  7: { name: 'Inventory', pkField: 'id' },
  8: { name: 'PriceData', pkField: 'id' },
  9: { name: 'OverageAnalysis', pkField: 'id' },
  10: { name: 'ReductionAnalysis', pkField: 'id' },
};

async function writeAuditLog(
  action: string,
  userId: string,
  details: Record<string, unknown>
): Promise<void> {
  const auditLog: AuditLog = {
    pk: 'AUDIT',
    sk: `${Date.now()}#${randomUUID()}`,
    action,
    userId,
    timestamp: Date.now(),
    details,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: auditLog,
    })
  );
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateYearMonth(yearMonth: string): boolean {
  const yearMonthRegex = /^\d{4}-\d{2}$/;
  return yearMonthRegex.test(yearMonth);
}

function validateRequiredFields(item: Record<string, unknown>, requiredFields: string[]): void {
  for (const field of requiredFields) {
    if (item[field] === undefined || item[field] === null || item[field] === '') {
      throw new ValidationError(`Missing required field: ${field}`);
    }
  }
}

async function handleGetResources(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const authContext = extractAuthContext(event);
  requirePermission(authContext.role, 'user:read');

  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'attribute_exists(id)',
        Limit: 100,
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        resources: result.Items || [],
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

async function handleBulkImport(
  event: APIGatewayProxyEvent,
  tableIndex: number
): Promise<APIGatewayProxyResult> {
  const authContext = extractAuthContext(event);
  requirePermission(authContext.role, 'bulk:write');

  const tableConfig = TABLE_INDICES[tableIndex];
  if (!tableConfig) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid table index' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const items: Record<string, unknown>[] = body.items || [];

    if (!Array.isArray(items) || items.length === 0) {
      throw new ValidationError('Items must be a non-empty array');
    }

    const now = Date.now();
    const enrichedItems = items.map((item) => ({
      ...item,
      id: (item.id as string) || randomUUID(),
      createdAt: (item.createdAt as number) || now,
      updatedAt: (item.updatedAt as number) || now,
    }));

    const chunks: Record<string, unknown>[][] = [];
    for (let i = 0; i < enrichedItems.length; i += 25) {
      chunks.push(enrichedItems.slice(i, i + 25));
    }

    let imported = 0;
    const errors: string[] = [];

    for (const chunk of chunks) {
      const requestItems: BatchWriteItemCommandInput['RequestItems'] = {
        [TABLE_NAME]: chunk.map((item) => ({
          PutRequest: {
            Item: item as Record<string, unknown>,
          },
        })),
      };

      try {
        await client.send(new BatchWriteItemCommand({ RequestItems: requestItems }));
        imported += chunk.length;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Batch write failed: ${errorMsg}`);
      }
    }

    await writeAuditLog('BULK_IMPORT', authContext.userId, {
      tableIndex,
      tableName: tableConfig.name,
      itemCount: enrichedItems.length,
      imported,
      failed: enrichedItems.length - imported,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        imported,
        failed: enrichedItems.length - imported,
        errors,
      }),
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Bulk import error:', error);
    return {
      statusCode: error instanceof ValidationError ? 400 : 500,
      body: JSON.stringify({ error: errorMsg }),
    };
  }
}

async function handleCreateUser(
  event: APIGatewayProxyEvent,
  authContext: any
): Promise<APIGatewayProxyResult> {
  requirePermission(authContext.role, 'user:write');

  try {
    const body = JSON.parse(event.body || '{}');
    validateRequiredFields(body, ['email', 'passwordHash', 'username']);

    if (!validateEmail(body.email)) {
      throw new ValidationError('Invalid email format');
    }

    const user: User = {
      id: randomUUID(),
      email: body.email,
      passwordHash: body.passwordHash,
      username: body.username,
      familySize: body.familySize,
      allergies: body.allergies,
      dietaryRestrictions: body.dietaryRestrictions,
      isActive: body.isActive !== false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: user,
      })
    );

    await writeAuditLog('CREATE_USER', authContext.userId, { userId: user.id });

    return {
      statusCode: 201,
      body: JSON.stringify(user),
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Create user error:', error);
    return {
      statusCode: error instanceof ValidationError ? 400 : 500,
      body: JSON.stringify({ error: errorMsg }),
    };
  }
}

async function handleGetUser(
  event: APIGatewayProxyEvent,
  authContext: any
): Promise<APIGatewayProxyResult> {
  requirePermission(authContext.role, 'user:read');

  try {
    const userId = event.pathParameters?.id;
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { id: userId },
      })
    );

    if (!result.Item) {
      throw new NotFoundError('User not found');
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.Item),
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Get user error:', error);
    return {
      statusCode: error instanceof NotFoundError ? 404 : 400,
      body: JSON.stringify({ error: errorMsg }),
    };
  }
}

async function handleUpdateUser(
  event: APIGatewayProxyEvent,
  authContext: any
): Promise<APIGatewayProxyResult> {
  requirePermission(authContext.role, 'user:write');

  try {
    const userId = event.pathParameters?.id;
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    const body = JSON.parse(event.body || '{}');

    if (body.email && !validateEmail(body.email)) {
      throw new ValidationError('Invalid email format');
    }

    const updateExpression = Object.keys(body)
      .filter((key) => key !== 'id' && key !== 'createdAt')
      .map((key) => `${key} = :${key}`)
      .join(', ');

    const expressionAttributeValues: Record<string, unknown> = {};
    Object.entries(body).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'createdAt') {
        expressionAttributeValues[`:${key}`] = value;
      }
    });
    expressionAttributeValues[':updatedAt'] = Date.now();

    const result = await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id: userId },
        UpdateExpression: `${updateExpression}, updatedAt = :updatedAt`,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      })
    );

    await writeAuditLog('UPDATE_USER', authContext.userId, { userId });

    return {
      statusCode: 200,
      body: JSON.stringify(result.Attributes),
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Update user error:', error);
    return {
      statusCode: error instanceof ValidationError ? 400 : 500,
      body: JSON.stringify({ error: errorMsg }),
    };
  }
}

async function handleDeleteUser(
  event: APIGatewayProxyEvent,
  authContext: any
): Promise<APIGatewayProxyResult> {
  requirePermission(authContext.role, 'user:delete');

  try {
    const userId = event.pathParameters?.id;
    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    await docClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { id: userId },
      })
    );

    await writeAuditLog('DELETE_USER', authContext.userId, { userId });

    return {
      statusCode: 204,
      body: '',
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Delete user error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMsg }),
    };
  }
}

async function handleCreateBudget(
  event: APIGatewayProxyEvent,
  authContext: any
): Promise<APIGatewayProxyResult> {
  requirePermission(authContext.role, 'budget:write');

  try {
    const body = JSON.parse(event.body || '{}');
    validateRequiredFields(body, ['userId', 'yearMonth', 'budgetAmount']);

    if (!validateYearMonth(body.yearMonth)) {
      throw new ValidationError('Invalid yearMonth format (YYYY-MM)');
    }

    if (body.budgetAmount <= 0) {
      throw new ValidationError('Budget amount must be positive');
    }

    const budget: MonthlyBudget = {
      id: randomUUID(),
      userId: body.userId,
      yearMonth: body.yearMonth,
      budgetAmount: body.budgetAmount,
      notes: body.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: authContext.userId,
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: budget,
      })
    );

    await writeAuditLog('CREATE_BUDGET', authContext.userId, { budgetId: budget.id });

    return {
      statusCode: 201,
      body: JSON.stringify(budget),
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Create budget error:', error);
    return {
      statusCode: error instanceof ValidationError ? 400 : 500,
      body: JSON.stringify({ error: errorMsg }),
    };
  }
}

async function handleCreateExpense(
  event: APIGatewayProxyEvent,
  authContext: any
): Promise<APIGatewayProxyResult> {
  requirePermission(authContext.role, 'expense:write');

  try {
    const body = JSON.parse(event.body || '{}');
    validateRequiredFields(body, ['userId', 'yearMonth', 'expenseDate', 'category', 'item', 'amount']);

    if (!validateYearMonth(body.yearMonth)) {
      throw new ValidationError('Invalid yearMonth format (YYYY-MM)');
    }

    if (body.amount <= 0) {
      throw new ValidationError('Amount must be positive');
    }

    const expense: ExpenseRecord = {
      id: randomUUID(),
      userId: body.userId,
      yearMonth: body.yearMonth,
      expenseDate: body.expenseDate,
      category: body.category,
      item: body.item,
      amount: body.amount,
      storeName: body.storeName,
      memo: body.memo,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: expense,
      })
    );

    await writeAuditLog('CREATE_EXPENSE', authContext.userId, { expenseId: expense.id });

    return {
      statusCode: 201,
      body: JSON.stringify(expense),
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Create expense error:', error);
    return {
      statusCode: error instanceof ValidationError ? 400 : 500,
      body: JSON.stringify({ error: errorMsg }),
    };
  }
}

async function handleCreatePurchase(
  event: APIGatewayProxyEvent,
  authContext: any
): Promise<APIGatewayProxyResult> {
  requirePermission(authContext.role, 'purchase:write');

  try {
    const body = JSON.parse(event.body || '{}');
    validateRequiredFields(body, ['userId', 'purchaseDate', 'productName', 'category', 'purchaseAmount']);

    if (body.purchaseAmount <= 0) {
      throw new ValidationError('Purchase amount must be positive');
    }

    const purchase: PurchaseRecord = {
      id: randomUUID(),
      userId: body.userId,
      purchaseDate: body.purchaseDate,
      productName: body.productName,
      category: body.category,
      purchaseAmount: body.purchaseAmount,
      quantity: body.quantity,
      unitPrice: body.unitPrice,
      purchaseStore: body.purchaseStore,
      memo: body.memo,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: purchase,
      })
    );

    await writeAuditLog('CREATE_PURCHASE', authContext.userId, { purchaseId: purchase.id });

    return {
      statusCode: 201,
      body: JSON.stringify(purchase),
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Create purchase error:', error);
    return {
      statusCode: error instanceof ValidationError ? 400 : 500,
      body: JSON.stringify({ error: errorMsg }),
    };
  }
}

async function handleCreateIngredient(
  event: APIGatewayProxyEvent,
  authContext: any
): Promise<APIGatewayProxyResult> {
  requirePermission(authContext.role, 'ingredient:write');

  try {
    const body = JSON.parse(event.body || '{}');
    validateRequiredFields(body, ['userId', 'ingredientName', 'category', 'unit']);

    const ingredient: Ingredient = {
      id: randomUUID(),
      userId: body.userId,
      ingredientName: body.ingredientName,
      category: body.category,
      unit: body.unit,
      averageUnitPrice: body.averageUnitPrice,
      storageMethod: body.storageMethod,
      shelfLifeDays: body.shelfLifeDays,
      notes: body.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: ingredient,
      })
    );

    await writeAuditLog('CREATE_INGREDIENT', authContext.userId, { ingredientId: ingredient.id });

    return {
      statusCode: 201,
      body: JSON.stringify(ingredient),
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Create ingredient error:', error);
    return {
      statusCode: error instanceof ValidationError ? 400 : 500,
      body: JSON.stringify({ error: errorMsg }),
    };
  }
}

async function handleCreateDistributor(
  event: APIGatewayProxyEvent,
  authContext: any
): Promise<APIGatewayProxyResult> {
  requirePermission(authContext.role, 'distributor:write');

  try {
    const body = JSON.parse(event.body || '{}');
    validateRequiredFields(body, ['distributorName', 'distributorType']);

    const distributor: Distributor = {
      id: randomUUID(),
      distributorName: body.distributorName,
      distributorType: body.distributorType,
      description: body.description,
      address: body.address,
      phoneNumber: body.phoneNumber,
      website: body.website,
      isAvailable: body.isAvailable !== false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: distributor,
      })
    );

    await writeAuditLog('CREATE_DISTRIBUTOR', authContext.userId, { distributorId: distributor.id });

    return {
      statusCode: 201,
      body: JSON.stringify(distributor),
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Create distributor error:', error);
    return {
      statusCode: error instanceof ValidationError ? 400 : 500,
      body: JSON.stringify({ error: errorMsg }),
    };
  }
}

async function handleCreateSupermarket(
  event: APIGatewayProxyEvent,
  authContext: any
): Promise<APIGatewayProxyResult> {
  requirePermission(authContext.role, 'supermarket:write');

  try {
    const body = JSON.parse(event.body || '{}');
    validateRequiredFields(body, ['supermarketName', 'distributorId']);

    const supermarket: Supermarket = {
      id: randomUUID(),
      supermarketName: body.supermarketName,
      distributorId: body.distributorId,
      address: body.address,
      phoneNumber: body.phoneNumber,
      businessHours: body.businessHours,
      pointRewardRate: body.pointRewardRate,
      discountInfo: body.discountInfo,
      isAvailable: body.isAvailable !== false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: supermarket,
      })
    );

    await writeAuditLog('CREATE_SUPERMARKET', authContext.userId, { supermarketId: supermarket.id });

    return {
      statusCode: 201,
      body: JSON.stringify(supermarket),
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Create supermarket error:', error);
    return {
      statusCode: error instanceof ValidationError ? 400 : 500,
      body: JSON.stringify({ error: errorMsg }),
    };
  }
}

async function handleCreateInventory(
  event: APIGatewayProxyEvent,
  authContext: any
): Promise<APIGatewayProxyResult> {
  requirePermission(authContext.role, 'inventory:write');

  try {
    const body = JSON.parse(event.body || '{}');
    validateRequiredFields(body, ['userId', 'ingredientId', 'currentQuantity', 'unit', 'purchaseDate']);

    if (body.currentQuantity < 0) {
      throw new ValidationError('Current quantity cannot be negative');
    }

    const inventory: Inventory = {
      id: randomUUID(),
      userId: body.userId,
      ingredientId: body.ingredientId,
      currentQuantity: body.currentQuantity,
      unit: body.unit,
      expiryDate: body.expiryDate,
      storageLocation: body.storageLocation,
      purchaseDate: body.purchaseDate,
      purchaseRecordId: body.purchaseRecordId,
      lastUpdatedAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: inventory,
      })
    );

    await writeAuditLog('CREATE_INVENTORY', authContext.userId, { inventoryId: inventory.id });

    return {
      statusCode: 201,
      body: JSON.stringify(inventory),
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Create inventory error:', error);
    return {
      statusCode: error instanceof ValidationError ? 400 : 500,
      body: JSON.stringify({ error: errorMsg }),
    };
  }
}

async function handleCreatePriceData(
  event: APIGatewayProxyEvent,
  authContext: any
): Promise<APIGatewayProxyResult> {
  requirePermission(authContext.role, 'price:write');

  try {
    const body = JSON.parse(event.body || '{}');
    validateRequiredFields(body, ['ingredientId', 'distributorId', 'price', 'unit', 'effectiveStartDate']);

    if (body.price <= 0) {
      throw new ValidationError('Price must be positive');
    }

    const priceData: PriceData = {
      id: randomUUID(),
      ingredientId: body.ingredientId,
      distributorId: body.distributorId,
      supermarketId: body.supermarketId,
      price: body.price,
      unit: body.unit,
      effectiveStartDate: body.effectiveStartDate,
      effectiveEndDate: body.effectiveEndDate,
      discountRate: body.discountRate,
      discountPrice: body.discountPrice,
      discountStartDate: body.discountStartDate,
      discountEndDate: body.discountEndDate,
      inventoryStatus: body.inventoryStatus,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: authContext.userId,
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: priceData,
      })
    );

    await writeAuditLog('CREATE_PRICE_DATA', authContext.userId, { priceDataId: priceData.id });

    return {
      statusCode: 201,
      body: JSON.stringify(priceData),
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Create price data error:', error);
    return {
      statusCode: error instanceof ValidationError ? 400 : 500,
      body: JSON.stringify({ error: errorMsg }),
    };
  }
}

async function handleCreateOverageAnalysis(
  event: APIGatewayProxyEvent,
  authContext: any
): Promise<APIGatewayProxyResult> {
  requirePermission(authContext.role, 'analysis:write');

  try {
    const body = JSON.parse(event.body || '{}');
    validateRequiredFields(body, [
      'userId',
      'monthlyBudgetId',
      'analysisYearMonth',
      'ingredientCategory',
      'budgetAmount',
      'actualAmount',
      'mainReason',
      'purchaseCount',
      'averageUnitPrice',
    ]);

    if (!validateYearMonth(body.analysisYearMonth)) {
      throw new ValidationError('Invalid analysisYearMonth format (YYYY-MM)');
    }

    const overageAmount = body.actualAmount - body.budgetAmount;
    const overageRate = body.budgetAmount > 0 ? (overageAmount / body.budgetAmount) * 100 : 0;

    const analysis: OverageAnalysis = {
      id: randomUUID(),
      userId: body.userId,
      monthlyBudgetId: body.monthlyBudgetId,
      analysisYearMonth: body.analysisYearMonth,
      ingredientCategory: body.ingredientCategory,
      budgetAmount: body.budgetAmount,
      actualAmount: body.actualAmount,
      overageAmount,
      overageRate: Math.round(overageRate * 10) / 10,
      mainReason: body.mainReason,
      reasonDetails: body.reasonDetails,
      purchaseCount: body.purchaseCount,
      averageUnitPrice: body.averageUnitPrice,
      improvementMeasures: body.improvementMeasures,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: authContext.userId,
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: analysis,
      })
    );

    await writeAuditLog('CREATE_OVERAGE_ANALYSIS', authContext.userId, { analysisId: analysis.id });

    return {
      statusCode: 201,
      body: JSON.stringify(analysis),
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Create overage analysis error:', error);
    return {
      statusCode: error instanceof ValidationError ? 400 : 500,
      body: JSON.stringify({ error: errorMsg }),
    };
  }
}

async function handleCreateReductionAnalysis(
  event: APIGatewayProxyEvent,
  authContext: any
): Promise<APIGatewayProxyResult> {
  requirePermission(authContext.role, 'reduction:write');

  try {
    const body = JSON.parse(event.body || '{}');
    validateRequiredFields(body, [
      'userId',
      'measureName',
      'implementationStartDate',
      'preImplementationTotal',
      'postImplementationTotal',
      'comparisonPeriodDays',
      'measureStatus',
    ]);

    const reductionAmount = body.preImplementationTotal - body.postImplementationTotal;
    const reductionRate =
      body.preImplementationTotal > 0 ? (reductionAmount / body.preImplementationTotal) * 100 : 0;

    const analysis: ReductionAnalysis = {
      id: randomUUID(),
      userId: body.userId,
      measureName: body.measureName,
      measureDescription: body.measureDescription,
      implementationStartDate: body.implementationStartDate,
      implementationEndDate: body.implementationEndDate,
      preImplementationTotal: body.preImplementationTotal,
      postImplementationTotal: body.postImplementationTotal,
      reductionAmount,
      reductionRate: Math.round(reductionRate * 10) / 10,
      comparisonPeriodDays: body.comparisonPeriodDays,
      measureStatus: body.measureStatus,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: authContext.userId,
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: analysis,
      })
    );

    await writeAuditLog('CREATE_REDUCTION_ANALYSIS', authContext.userId, { analysisId: analysis.id });

    return {
      statusCode: 201,
      body: JSON.stringify(analysis),
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Create reduction analysis error:', error);
    return {
      statusCode: error instanceof ValidationError ? 400 : 500,
      body: JSON.stringify({ error: errorMsg }),
    };
  }
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Event:', JSON.stringify(event));

  try {
    const authContext = extractAuthContext(event);
    const path = event.path || '';
    const method = event.httpMethod || 'GET';

    // GET /resources
    if (path === '/resources' && method === 'GET') {
      return await handleGetResources(event);
    }

    // POST /api/{tableIndex}/bulk
    const bulkMatch = path.match(/^\/api\/(\d+)\/bulk$/);
    if (bulkMatch && method === 'POST') {
      const tableIndex = parseInt(bulkMatch[1], 10);
      return await handleBulkImport(event, tableIndex);
    }

    // User endpoints
    if (path === '/api/users' && method === 'POST') {
      return await handleCreateUser(event, authContext);
    }
    if (path.match(/^\/api\/users\/[^/]+$/) && method === 'GET') {
      return await handleGetUser(event, authContext);
    }
    if (path.match(/^\/api\/users\/[^/]+$/) && method === 'PUT') {
      return await handleUpdateUser(event, authContext);
    }
    if (path.match(/^\/api\/users\/[^/]+$/) && method === 'DELETE') {
      return await handleDeleteUser(event, authContext);
    }

    // Budget endpoints
    if (path === '/api/budgets' && method === 'POST') {
      return await handleCreateBudget(event, authContext);
    }

    // Expense endpoints
    if (path === '/api/expenses' && method === 'POST') {
      return await handleCreateExpense(event, authContext);
    }

    // Purchase endpoints
    if (path === '/api/purchases' && method === 'POST') {
      return await handleCreatePurchase(event, authContext);
    }

    // Ingredient endpoints
    if (path === '/api/ingredients' && method === 'POST') {
      return await handleCreateIngredient(event, authContext);
    }

    // Distributor endpoints
    if (path === '/api/distributors' && method === 'POST') {
      return await handleCreateDistributor(event, authContext);
    }

    // Supermarket endpoints
    if (path === '/api/supermarkets' && method === 'POST') {
      return await handleCreateSupermarket(event, authContext);
    }

    // Inventory endpoints
    if (path === '/api/inventory' && method === 'POST') {
      return await handleCreateInventory(event, authContext);
    }

    // Price data endpoints
    if (path === '/api/prices' && method === 'POST') {
      return await handleCreatePriceData(event, authContext);
    }

    // Overage analysis endpoints
    if (path === '/api/analysis/overage' && method === 'POST') {
      return await handleCreateOverageAnalysis(event, authContext);
    }

    // Reduction analysis endpoints
    if (path === '/api/analysis/reduction' && method === 'POST') {
      return await handleCreateReductionAnalysis(event, authContext);
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Not found' }),
    };
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: error.message }),
      };
    }

    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Handler error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMsg }),
    };
  }
};