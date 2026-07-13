import { evaluateNutritionImprovementProposal } from '../../src/logic/it-1-br-2-1-2-1';

describe('栄養基準ロジック改善案の複合評価機能', () => {
  // SCEN-584: [normal] 栄養士による改善案検証評価 - 栄養基準ロジック改善案の評価スコアが複数の基準値を超える場合に複合評価される
  test('複数の評価基準すべてで基準値を超えるスコアが入力された場合、複合評価が正しく計算されて総合スコアが表示される', () => {
    const input = {
      proposalId: 'PROP-2024-001',
      nutritionistId: 'NUTR-12345',
      evaluationCriteria: [
        {
          criteriaName: '栄養バランス',
          standardValue: 80,
          inputScore: 90,
          weight: 0.4,
        },
        {
          criteriaName: 'コスト効率',
          standardValue: 70,
          inputScore: 85,
          weight: 0.35,
        },
        {
          criteriaName: '実行可能性',
          standardValue: 75,
          inputScore: 88,
          weight: 0.25,
        },
      ],
      evaluationTimestamp: new Date('2024-02-15T10:30:00Z'),
    };

    const result = evaluateNutritionImprovementProposal(input);

    // 各基準が基準値を超えていることを検証
    expect(result.criteriaResults[0]).toEqual({
      criteriaName: '栄養バランス',
      standardValue: 80,
      inputScore: 90,
      exceedanceAmount: 10,
      exceedancePercentage: 12.5,
      meetsStandard: true,
    });

    expect(result.criteriaResults[1]).toEqual({
      criteriaName: 'コスト効率',
      standardValue: 70,
      inputScore: 85,
      exceedanceAmount: 15,
      exceedancePercentage: 21.43,
      meetsStandard: true,
    });

    expect(result.criteriaResults[2]).toEqual({
      criteriaName: '実行可能性',
      standardValue: 75,
      inputScore: 88,
      exceedanceAmount: 13,
      exceedancePercentage: 17.33,
      meetsStandard: true,
    });

    // 複合評価スコアの検証
    // 計算式: (90 * 0.4) + (85 * 0.35) + (88 * 0.25) = 36 + 29.75 + 22 = 87.75
    expect(result.compositeEvaluationScore).toBe(87.75);

    // 複合評価結果の詳細情報を検証
    expect(result.compositeEvaluationResult).toEqual({
      totalScore: 87.75,
      recommendationLevel: '高推奨',
      allCriteriaMeetStandard: true,
      averageExceedancePercentage: 16.99,
    });

    // 評価履歴情報の検証
    expect(result.evaluationRecord).toEqual({
      proposalId: 'PROP-2024-001',
      nutritionistId: 'NUTR-12345',
      evaluationStatus: '完了',
      evaluationTimestamp: new Date('2024-02-15T10:30:00Z'),
      totalScore: 87.75,
      recommendationLevel: '高推奨',
    });

    // 保存状態の検証
    expect(result.saveStatus).toBe('成功');
    expect(result.saveTimestamp).toBeDefined();
    expect(result.recordedInHistory).toBe(true);
  });
});