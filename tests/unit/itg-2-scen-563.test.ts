import { filterAbnormalNutritionData } from '../../src/logic/it-1-br-2-1-1-1';

describe('異常値・欠損値自動フィルタリング機能 - 全データが異常値である境界条件', () => {
  // SCEN-563
  test('全データが異常値である場合、正常データ0件と判定され、ログが記録される', () => {
    // Arrange: 全件が異常値（負の値と上限超過）のデータセット
    const abnormalDataset = [
      {
        userId: 'user_001',
        date: '2024-01-15',
        nutrientId: 'protein',
        value: -10.5, // 負の値（異常）
        unit: 'g',
        timestamp: '2024-01-15T10:00:00Z',
      },
      {
        userId: 'user_001',
        date: '2024-01-15',
        nutrientId: 'carbohydrate',
        value: 99999.9, // 上限超過（異常）
        unit: 'g',
        timestamp: '2024-01-15T10:30:00Z',
      },
      {
        userId: 'user_001',
        date: '2024-01-15',
        nutrientId: 'fat',
        value: -50.0, // 負の値（異常）
        unit: 'g',
        timestamp: '2024-01-15T11:00:00Z',
      },
      {
        userId: 'user_001',
        date: '2024-01-15',
        nutrientId: 'calcium',
        value: 50000.0, // 上限超過（異常）
        unit: 'mg',
        timestamp: '2024-01-15T11:30:00Z',
      },
    ];

    // Act: フィルタリング機能を実行
    const result = filterAbnormalNutritionData(abnormalDataset);

    // Assert: 正常データ0件と判定されることを検証
    expect(result.normalDataCount).toBe(0);
    expect(result.abnormalDataCount).toBe(4);
    expect(result.totalInputCount).toBe(4);
    expect(result.hasValidData).toBe(false);

    // Assert: 画面表示メッセージを検証
    expect(result.displayMessage).toBe('正常データなし');

    // Assert: システムログメッセージを検証
    expect(result.systemLog).toMatch(/異常値フィルタリング実行：入力データ件数=4件、正常データ件数=0件、全データが異常値と判定/);

    // Assert: フィルタリング後の正常データリストが空であることを検証
    expect(result.filteredNormalData).toEqual([]);

    // Assert: 異常値と判定されたデータがすべて記録されていることを検証
    expect(result.filteredAbnormalData).toHaveLength(4);
    expect(result.filteredAbnormalData.map((d: any) => d.value)).toEqual([-10.5, 99999.9, -50.0, 50000.0]);

    // Assert: ステータスコードとタイムスタンプを検証
    expect(result.status).toBe('completed_with_no_valid_data');
    expect(result.executedAt).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/);
  });
});