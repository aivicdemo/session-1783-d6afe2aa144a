import { detectAnomalousNutritionData } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  test('SCEN-427: 食事評価データ異常値検出機能 - すべてのデータが異常値である場合、空のデータセットが出力される', () => {
    // 入力: すべてのレコードが異常値判定基準を超えるデータセット
    const anomalousDataSet = [
      {
        id: 'eval_001',
        dishId: 'dish_100',
        familyMemberId: 'member_1',
        satisfactionScore: 6, // 範囲外（1-5を超過）
        completionRate: 150, // 範囲外（0-100を超過）
        calorieContent: -500, // 負数（異常値）
        timestamp: new Date('2024-01-15T19:00:00Z'),
      },
      {
        id: 'eval_002',
        dishId: 'dish_101',
        familyMemberId: 'member_2',
        satisfactionScore: 0, // 範囲外（1未満）
        completionRate: -10, // 負数（異常値）
        calorieContent: 9999, // 極端に高い
        timestamp: new Date('2024-01-15T19:30:00Z'),
      },
      {
        id: 'eval_003',
        dishId: 'dish_102',
        familyMemberId: 'member_3',
        satisfactionScore: 10, // 範囲外（5を超過）
        completionRate: 200, // 範囲外（100を超過）
        calorieContent: -1000, // 負数（異常値）
        timestamp: new Date('2024-01-15T20:00:00Z'),
      },
    ];

    // 実行: 異常値検出処理
    const result = detectAnomalousNutritionData(anomalousDataSet);

    // 検証: すべてのデータが異常値として検出され、出力データセットが空であることを確認
    expect(result).toEqual([]);
    expect(result.length).toBe(0);
  });
});