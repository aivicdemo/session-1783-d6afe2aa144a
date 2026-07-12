import { detectAndFilterAnomalousEvaluationData } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-426
  test('複数家族成員のデータ中、1件のみ異常値を含む場合、異常値を除外して正常データのみが次工程に引き渡される', () => {
    // テストデータ: 5名の家族成員の食事評価データ
    // 1番目: 正常
    // 2番目: 正常
    // 3番目: 異常値を含む（栄養価が負値）
    // 4番目: 正常
    // 5番目: 正常
    const inputEvaluationData = [
      {
        familyMemberId: 1,
        satisfactionScore: 4,
        completionDegree: 90,
        nutritionValue: 450,
        timestamp: new Date('2024-01-15T12:00:00Z'),
      },
      {
        familyMemberId: 2,
        satisfactionScore: 5,
        completionDegree: 100,
        nutritionValue: 520,
        timestamp: new Date('2024-01-15T12:15:00Z'),
      },
      {
        familyMemberId: 3,
        satisfactionScore: 2,
        completionDegree: 30,
        nutritionValue: -150,
        timestamp: new Date('2024-01-15T12:30:00Z'),
      },
      {
        familyMemberId: 4,
        satisfactionScore: 4,
        completionDegree: 85,
        nutritionValue: 480,
        timestamp: new Date('2024-01-15T12:45:00Z'),
      },
      {
        familyMemberId: 5,
        satisfactionScore: 3,
        completionDegree: 75,
        nutritionValue: 420,
        timestamp: new Date('2024-01-15T13:00:00Z'),
      },
    ];

    const result = detectAndFilterAnomalousEvaluationData(inputEvaluationData);

    // 正常データが4件であることを確認
    expect(result.validData).toHaveLength(4);

    // 異常データが1件であることを確認
    expect(result.anomalousData).toHaveLength(1);

    // 正常データに含まれるべき家族成員IDを確認
    const validMemberIds = result.validData.map((d) => d.familyMemberId);
    expect(validMemberIds).toEqual([1, 2, 4, 5]);

    // 異常データに含まれるべき家族成員IDを確認
    const anomalousMemberIds = result.anomalousData.map((d) => d.familyMemberId);
    expect(anomalousMemberIds).toEqual([3]);

    // 異常データの栄養価が負値であることを確認
    expect(result.anomalousData[0].nutritionValue).toBe(-150);

    // 正常データの栄養価がすべて正の値であることを確認
    result.validData.forEach((data) => {
      expect(data.nutritionValue).toBeGreaterThan(0);
    });

    // ログが記録されていることを確認
    expect(result.detectionLog).toBeDefined();
    expect(result.detectionLog.length).toBeGreaterThan(0);

    // ログに異常値を含むデータについての情報が含まれていることを確認
    expect(result.detectionLog).toContain(
      expect.stringContaining('familyMemberId: 3')
    );

    // 次工程へ引き渡すデータが正常データのみであることを確認
    expect(result.nextProcessData).toEqual(result.validData);
    expect(result.nextProcessData).toHaveLength(4);
  });
});