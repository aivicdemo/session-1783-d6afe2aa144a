import { calculatePriorityScoreWithInventory } from '../../src/logic/it-7-2-1';

const fetchMock = require('jest-fetch-mock');

describe('旬食材・割引商品の優先度スコアリング機能 - エラーハンドリング', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  // SCEN-581
  test('流通業者の在庫データAPI連携失敗時にエラーハンドリングが正常に発動し、ユーザーフレンドリーなエラーメッセージと詳細ログが生成される', async () => {
    const menus = [
      {
        menuId: 'menu_001',
        dishes: [
          {
            dishId: 'dish_001',
            ingredients: [
              { ingredientId: 'ing_001', name: 'トマト', quantity: 2, unit: '個' },
              { ingredientId: 'ing_002', name: 'キュウリ', quantity: 1, unit: '本' }
            ]
          }
        ]
      }
    ];

    const inventoryRequestPayload = {
      distributor_id: 'dist_001',
      ingredients: ['ing_001', 'ing_002'],
      timestamp: new Date('2024-12-15T10:00:00Z').toISOString()
    };

    const expectedUserMessage = '在庫データの取得に失敗しました。しばらくしてからもう一度お試しください。';
    const expectedErrorLog = {
      error_code: 'INVENTORY_API_FAILURE',
      http_status: 500,
      distributor_id: 'dist_001',
      timestamp: expect.any(String),
      message: expect.stringContaining('在庫データAPI')
    };

    // Case 1: HTTP 500エラーでの失敗
    fetchMock.mockResponseOnce(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    );

    const result_case1 = await calculatePriorityScoreWithInventory(menus, inventoryRequestPayload);

    expect(result_case1).toEqual({
      success: false,
      userMessage: expectedUserMessage,
      errorLog: expect.objectContaining({
        error_code: 'INVENTORY_API_FAILURE',
        http_status: 500,
        distributor_id: 'dist_001'
      }),
      fallbackMode: true,
      fallbackMenus: expect.arrayContaining([
        expect.objectContaining({
          menuId: 'menu_001',
          priorityScore: null,
          scoreCalculationStatus: 'PENDING_INVENTORY_DATA'
        })
      ])
    });

    expect(result_case1.errorLog.message).toMatch(/在庫データAPI/);
    expect(result_case1.success).toBe(false);
    expect(result_case1.fallbackMode).toBe(true);

    // Case 2: ネットワークタイムアウトエラーでの失敗
    fetchMock.resetMocks();
    fetchMock.mockRejectOnce(new Error('Network timeout after 5000ms'));

    const result_case2 = await calculatePriorityScoreWithInventory(menus, inventoryRequestPayload);

    expect(result_case2).toEqual({
      success: false,
      userMessage: expectedUserMessage,
      errorLog: expect.objectContaining({
        error_code: 'INVENTORY_API_TIMEOUT',
        distributor_id: 'dist_001'
      }),
      fallbackMode: true,
      fallbackMenus: expect.arrayContaining([
        expect.objectContaining({
          menuId: 'menu_001',
          priorityScore: null,
          scoreCalculationStatus: 'PENDING_INVENTORY_DATA'
        })
      ])
    });

    expect(result_case2.errorLog.message).toMatch(/タイムアウト/);
    expect(result_case2.success).toBe(false);
    expect(result_case2.fallbackMode).toBe(true);

    // Case 3: HTTP 404エラー（リソースが見つからない）での失敗
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(
      JSON.stringify({ error: 'Distributor not found' }),
      { status: 404 }
    );

    const result_case3 = await calculatePriorityScoreWithInventory(menus, inventoryRequestPayload);

    expect(result_case3).toEqual({
      success: false,
      userMessage: expectedUserMessage,
      errorLog: expect.objectContaining({
        error_code: 'INVENTORY_API_FAILURE',
        http_status: 404,
        distributor_id: 'dist_001'
      }),
      fallbackMode: true,
      fallbackMenus: expect.arrayContaining([
        expect.objectContaining({
          menuId: 'menu_001',
          priorityScore: null,
          scoreCalculationStatus: 'PENDING_INVENTORY_DATA'
        })
      ])
    });

    expect(result_case3.success).toBe(false);
    expect(result_case3.fallbackMode).toBe(true);

    // Case 4: ネットワークエラー（接続拒否）での失敗
    fetchMock.resetMocks();
    fetchMock.mockRejectOnce(new Error('Network connection refused'));

    const result_case4 = await calculatePriorityScoreWithInventory(menus, inventoryRequestPayload);

    expect(result_case4).toEqual({
      success: false,
      userMessage: expectedUserMessage,
      errorLog: expect.objectContaining({
        error_code: 'INVENTORY_API_NETWORK_ERROR',
        distributor_id: 'dist_001'
      }),
      fallbackMode: true,
      fallbackMenus: expect.arrayContaining([
        expect.objectContaining({
          menuId: 'menu_001',
          priorityScore: null,
          scoreCalculationStatus: 'PENDING_INVENTORY_DATA'
        })
      ])
    });

    expect(result_case4.errorLog.message).toMatch(/ネットワーク/);
    expect(result_case4.success).toBe(false);
    expect(result_case4.fallbackMode).toBe(true);

    // Verify error logs contain required fields
    expect(result_case1.errorLog).toHaveProperty('error_code');
    expect(result_case1.errorLog).toHaveProperty('distributor_id', 'dist_001');
    expect(result_case1.errorLog).toHaveProperty('timestamp');
    expect(result_case1.errorLog).toHaveProperty('message');

    // Verify fallback menus maintain original structure
    expect(result_case1.fallbackMenus[0]).toHaveProperty('menuId', 'menu_001');
    expect(result_case1.fallbackMenus[0]).toHaveProperty('priorityScore', null);
    expect(result_case1.fallbackMenus[0]).toHaveProperty('scoreCalculationStatus', 'PENDING_INVENTORY_DATA');

    // Verify system remains in stable state (returns structured response)
    expect(result_case1).toHaveProperty('success');
    expect(result_case1).toHaveProperty('userMessage');
    expect(result_case1).toHaveProperty('errorLog');
    expect(result_case1).toHaveProperty('fallbackMode');
    expect(result_case1).toHaveProperty('fallbackMenus');
  });
});