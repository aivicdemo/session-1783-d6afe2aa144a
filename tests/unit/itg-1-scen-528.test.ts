import { issueDataCollectionInstruction } from '../../src/logic/it-2';

describe('Family Member Meal Evaluation Data Collection and Management', () => {
  // SCEN-528: [edge] データ収集指示発行機能 - ユーザーセグメントが空の場合でもデータ抽出範囲が確定される
  test('should confirm data extraction range even when user segment is empty', () => {
    const startDate = new Date('2024-01-01T00:00:00Z');
    const endDate = new Date('2024-01-31T23:59:59Z');
    const emptySegments: string[] = [];

    const result = issueDataCollectionInstruction({
      userSegments: emptySegments,
      extractionStartDate: startDate,
      extractionEndDate: endDate,
    });

    expect(result.issuanceStatus).toBe('confirmed');
    expect(result.extractionStartDate).toEqual(startDate);
    expect(result.extractionEndDate).toEqual(endDate);
    expect(result.dataCollectionStarted).toBe(true);
    expect(result.errorMessage).toBeNull();
  });
});