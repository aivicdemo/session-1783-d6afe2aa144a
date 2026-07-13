import { analyzeDeviationAndGenerateProposal } from '../../src/logic/it-1-br-3-2-1';

describe('購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  // SCEN-371: [error] 需要予測精度の乖離分析と改善提案生成機能 - 実績データが存在しないまたは不完全なとき、エラーログが記録される
  test('実績データが存在しないまたは不完全なとき、エラーログが記録される', () => {
    const mockLogs: Array<{ level: string; message: string }> = [];
    const originalError = console.error;
    console.error = jest.fn((msg: string) => {
      mockLogs.push({ level: 'error', message: msg });
    });

    // テストケース 1: 実績データが完全に存在しない場合
    const emptyPredictionData = {
      forecastedDemand: [
        { category: '野菜', week: 1, forecastQty: 100 },
        { category: '肉類', week: 1, forecastQty: 50 }
      ],
      actualDemand: [] // 実績データなし
    };

    const result1 = analyzeDeviationAndGenerateProposal(emptyPredictionData);

    expect(result1).toEqual({
      success: false,
      errorCode: 'NO_ACTUAL_DEMAND_DATA',
      deviation: null,
      proposals: []
    });

    expect(mockLogs.length).toBeGreaterThan(0);
    expect(mockLogs[0].level).toBe('error');
    expect(mockLogs[0].message).toMatch(/実績データ|不足|存在しない/);

    mockLogs.length = 0;

    // テストケース 2: 実績データが部分的に欠落している場合
    const incompletePredictionData = {
      forecastedDemand: [
        { category: '野菜', week: 1, forecastQty: 100 },
        { category: '肉類', week: 1, forecastQty: 50 },
        { category: '乳製品', week: 1, forecastQty: 30 }
      ],
      actualDemand: [
        { category: '野菜', week: 1, actualQty: 95 }
        // 肉類と乳製品のデータが欠落
      ]
    };

    const result2 = analyzeDeviationAndGenerateProposal(incompletePredictionData);

    expect(result2).toEqual({
      success: false,
      errorCode: 'INCOMPLETE_ACTUAL_DEMAND_DATA',
      deviation: null,
      proposals: []
    });

    expect(mockLogs.length).toBeGreaterThan(0);
    expect(mockLogs[0].level).toBe('error');
    expect(mockLogs[0].message).toMatch(/不完全|欠落|部分的/);

    console.error = originalError;
  });
});