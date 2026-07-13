import { analyzeSegmentDifferentiationEffect } from '../../src/logic/it-1';

describe('月次食費実績の超過要因分析機能', () => {
  // SCEN-382
  test('セグメント分類基準が未定義の場合にエラーが返される', () => {
    const input = {
      userId: 'user_001',
      analysisMonth: '2024-01',
      segmentCriteria: undefined,
      menuGenerationSuccessRate: 0.85,
      cookingTimeReduction: 12.5,
      userSatisfactionScore: 78,
    };

    expect(() => {
      analyzeSegmentDifferentiationEffect(input);
    }).toThrow(/セグメント分類基準/);
  });
});