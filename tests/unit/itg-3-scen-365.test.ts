import { categorizeMenuRejectionReasons, aggregateFailurePatterns, calculatePriorityScores } from '../../src/logic/it-1-br-3-2-1';

describe('献立却下・修正理由の自動分類と改善優先度可視化機能', () => {
  // SCEN-365: 献立却下・修正理由のテキスト自動分類機能 - 分類結果から失敗パターンの集計と改善優先度の可視化が正常に生成される
  test('SCEN-365: テキスト自動分類、失敗パターン集計、改善優先度可視化が正常に動作する', () => {
    // テストデータ：過去30日分の献立却下・修正理由（50件以上）
    const rejectionReasons = [
      { id: 1, userId: 'user-001', reason: '栄養バランスが悪い、タンパク質が不足している', createdAt: '2024-01-01T10:00:00Z' },
      { id: 2, userId: 'user-001', reason: '予算を超過している、高すぎる', createdAt: '2024-01-02T11:30:00Z' },
      { id: 3, userId: 'user-001', reason: '食材が入手困難である', createdAt: '2024-01-03T09:15:00Z' },
      { id: 4, userId: 'user-001', reason: '家族の嗜好に合わない', createdAt: '2024-01-04T14:45:00Z' },
      { id: 5, userId: 'user-001', reason: '栄養バランスが悪い、ビタミンCが不足', createdAt: '2024-01-05T08:20:00Z' },
      { id: 6, userId: 'user-001', reason: '予算を超過している、食材が高い', createdAt: '2024-01-06T16:00:00Z' },
      { id: 7, userId: 'user-001', reason: '調理時間が長すぎる', createdAt: '2024-01-07T12:30:00Z' },
      { id: 8, userId: 'user-001', reason: '栄養バランスが悪い、塩分が多い', createdAt: '2024-01-08T10:15:00Z' },
      { id: 9, userId: 'user-001', reason: '家族の嗜好に合わない、子どもが食べない', createdAt: '2024-01-09T13:45:00Z' },
      { id: 10, userId: 'user-001', reason: '予算を超過している', createdAt: '2024-01-10T09:00:00Z' },
      { id: 11, userId: 'user-001', reason: '食材が入手困難、季節外れ', createdAt: '2024-01-11T15:30:00Z' },
      { id: 12, userId: 'user-001', reason: '栄養バランスが悪い、カルシウムが不足', createdAt: '2024-01-12T11:20:00Z' },
      { id: 13, userId: 'user-001', reason: '家族の嗜好に合わない', createdAt: '2024-01-13T14:00:00Z' },
      { id: 14, userId: 'user-001', reason: '調理時間が長すぎる、忙しい', createdAt: '2024-01-14T08:45:00Z' },
      { id: 15, userId: 'user-001', reason: '予算を超過している、割高', createdAt: '2024-01-15T16:15:00Z' },
      { id: 16, userId: 'user-001', reason: '栄養バランスが悪い', createdAt: '2024-01-16T10:30:00Z' },
      { id: 17, userId: 'user-001', reason: '食材が入手困難', createdAt: '2024-01-17T12:45:00Z' },
      { id: 18, userId: 'user-001', reason: '家族の嗜好に合わない、辛すぎる', createdAt: '2024-01-18T09:30:00Z' },
      { id: 19, userId: 'user-001', reason: '予算を超過している', createdAt: '2024-01-19T13:15:00Z' },
      { id: 20, userId: 'user-001', reason: '栄養バランスが悪い、食物繊維が不足', createdAt: '2024-01-20T11:00:00Z' },
      { id: 21, userId: 'user-001', reason: '調理時間が長すぎる', createdAt: '2024-01-21T15:45:00Z' },
      { id: 22, userId: 'user-001', reason: '家族の嗜好に合わない', createdAt: '2024-01-22T10:20:00Z' },
      { id: 23, userId: 'user-001', reason: '予算を超過している、コスト高', createdAt: '2024-01-23T14:30:00Z' },
      { id: 24, userId: 'user-001', reason: '栄養バランスが悪い', createdAt: '2024-01-24T08:50:00Z' },
      { id: 25, userId: 'user-001', reason: '食材が入手困難、品切れ', createdAt: '2024-01-25T12:10:00Z' },
      { id: 26, userId: 'user-001', reason: '家族の嗜好に合わない', createdAt: '2024-01-26T16:40:00Z' },
      { id: 27, userId: 'user-001', reason: '予算を超過している', createdAt: '2024-01-27T09:25:00Z' },
      { id: 28, userId: 'user-001', reason: '栄養バランスが悪い、鉄分が不足', createdAt: '2024-01-28T13:00:00Z' },
      { id: 29, userId: 'user-001', reason: '調理時間が長すぎる、家事時間がない', createdAt: '2024-01-29T11:35:00Z' },
      { id: 30, userId: 'user-001', reason: '家族の嗜好に合わない、海鮮が嫌い', createdAt: '2024-01-30T15:15:00Z' },
      { id: 31, userId: 'user-001', reason: '予算を超過している', createdAt: '2024-01-31T10:00:00Z' },
      { id: 32, userId: 'user-001', reason: '栄養バランスが悪い', createdAt: '2024-02-01T08:30:00Z' },
      { id: 33, userId: 'user-001', reason: '食材が入手困難', createdAt: '2024-02-02T14:15:00Z' },
      { id: 34, userId: 'user-001', reason: '家族の嗜好に合わない', createdAt: '2024-02-03T12:45:00Z' },
      { id: 35, userId: 'user-001', reason: '予算を超過している', createdAt: '2024-02-04T09:50:00Z' },
      { id: 36, userId: 'user-001', reason: '栄養バランスが悪い、脂質が多い', createdAt: '2024-02-05T13:20:00Z' },
      { id: 37, userId: 'user-001', reason: '調理時間が長すぎる', createdAt: '2024-02-06T11:40:00Z' },
      { id: 38, userId: 'user-001', reason: '家族の嗜好に合わない', createdAt: '2024-02-07T15:30:00Z' },
      { id: 39, userId: 'user-001', reason: '予算を超過している、削減が必要', createdAt: '2024-02-08T10:15:00Z' },
      { id: 40, userId: 'user-001', reason: '食材が入手困難', createdAt: '2024-02-09T16:00:00Z' },
      { id: 41, userId: 'user-001', reason: '栄養バランスが悪い', createdAt: '2024-02-10T08:45:00Z' },
      { id: 42, userId: 'user-001', reason: '家族の嗜好に合わない', createdAt: '2024-02-11T12:30:00Z' },
      { id: 43, userId: 'user-001', reason: '予算を超過している', createdAt: '2024-02-12T14:50:00Z' },
      { id: 44, userId: 'user-001', reason: '調理時間が長すぎる', createdAt: '2024-02-13T09:20:00Z' },
      { id: 45, userId: 'user-001', reason: '栄養バランスが悪い', createdAt: '2024-02-14T13:10:00Z' },
      { id: 46, userId: 'user-001', reason: '食材が入手困難', createdAt: '2024-02-15T11:55:00Z' },
      { id: 47, userId: 'user-001', reason: '家族の嗜好に合わない', createdAt: '2024-02-16T15:40:00Z' },
      { id: 48, userId: 'user-001', reason: '予算を超過している', createdAt: '2024-02-17T10:05:00Z' },
      { id: 49, userId: 'user-001', reason: '栄養バランスが悪い', createdAt: '2024-02-18T14:25:00Z' },
      { id: 50, userId: 'user-001', reason: '調理時間が長すぎる', createdAt: '2024-02-19T09:40:00Z' },
      { id: 51, userId: 'user-001', reason: '家族の嗜好に合わない', createdAt: '2024-02-20T12:15:00Z' },
      { id: 52, userId: 'user-001', reason: '予算を超過している', createdAt: '2024-02-21T16:30:00Z' },
    ];

    // Step 1: テキスト自動分類機能を実行
    const categorizedResults = categorizeMenuRejectionReasons(rejectionReasons);

    // 分類結果の検証
    expect(categorizedResults).toBeDefined();
    expect(Array.isArray(categorizedResults)).toBe(true);
    expect(categorizedResults.length).toBe(52);

    // 各理由が正しいカテゴリに分類されているか検証
    const nutritionBalanceReasons = categorizedResults.filter(r => r.category === 'nutritionBalance');
    const budgetExcessReasons = categorizedResults.filter(r => r.category === 'budgetExcess');
    const ingredientUnavailableReasons = categorizedResults.filter(r => r.category === 'ingredientUnavailable');
    const preferenceReasons = categorizedResults.filter(r => r.category === 'preferenceDisagreement');
    const cookingTimeReasons = categorizedResults.filter(r => r.category === 'cookingTimeTooLong');

    expect(nutritionBalanceReasons.length).toBe(12);
    expect(budgetExcessReasons.length).toBe(16);
    expect(ingredientUnavailableReasons.length).toBe(6);
    expect(preferenceReasons.length).toBe(12);
    expect(cookingTimeReasons.length).toBe(6);

    // Step 2: 失敗パターンの集計機能を実行
    const aggregationPeriod = {
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-02-21T23:59:59Z',
    };

    const aggregatedPatterns = aggregateFailurePatterns(categorizedResults, aggregationPeriod);

    // 集計結果の検証
    expect(aggregatedPatterns).toBeDefined();
    expect(aggregatedPatterns.totalRejections).toBe(52);

    // カテゴリ別の集計結果を検証
    expect(aggregatedPatterns.categoryBreakdown).toBeDefined();
    expect(aggregatedPatterns.categoryBreakdown.nutritionBalance).toBeDefined();
    expect(aggregatedPatterns.categoryBreakdown.nutritionBalance.count).toBe(12);
    expect(aggregatedPatterns.categoryBreakdown.nutritionBalance.percentage).toBe(23.08);

    expect(aggregatedPatterns.categoryBreakdown.budgetExcess).toBeDefined();
    expect(aggregatedPatterns.categoryBreakdown.budgetExcess.count).toBe(16);
    expect(aggregatedPatterns.categoryBreakdown.budgetExcess.percentage).toBe(30.77);

    expect(aggregatedPatterns.categoryBreakdown.ingredientUnavailable).toBeDefined();
    expect(aggregatedPatterns.categoryBreakdown.ingredientUnavailable.count).toBe(6);
    expect(aggregatedPatterns.categoryBreakdown.ingredientUnavailable.percentage).toBe(11.54);

    expect(aggregatedPatterns.categoryBreakdown.preferenceDisagreement).toBeDefined();
    expect(aggregatedPatterns.categoryBreakdown.preferenceDisagreement.count).toBe(12);
    expect(aggregatedPatterns.categoryBreakdown.preferenceDisagreement.percentage).toBe(23.08);

    expect(aggregatedPatterns.categoryBreakdown.cookingTimeTooLong).toBeDefined();
    expect(aggregatedPatterns.categoryBreakdown.cookingTimeTooLong.count).toBe(6);
    expect(aggregatedPatterns.categoryBreakdown.cookingTimeTooLong.percentage).toBe(11.54);

    // Step 3: 改善優先度スコアの計算
    const priorityScores = calculatePriorityScores(aggregatedPatterns);

    // 優先度スコアの検証
    expect(priorityScores).toBeDefined();
    expect(priorityScores.length).toBe(5);

    // 優先度スコアが降順にソートされているか検証（高スコアから低スコアへ）
    for (let i = 0; i < priorityScores.length - 1; i++) {
      expect(priorityScores[i].score).toBeGreaterThanOrEqual(priorityScores[i + 1].score);
    }

    // 最高優先度のカテゴリはbudgetExcess（頻度30.77%、重要度0.9）
    expect(priorityScores[0].category).toBe('budgetExcess');
    expect(priorityScores[0].score).toBe(27.69);
    expect(priorityScores[0].priority).toBe('high');
    expect(priorityScores[0].frequency).toBe(30.77);
    expect(priorityScores[0].importance).toBe(0.9);

    // 2番目の優先度はnutritionBalance（頻度23.08%、重要度0.95）
    expect(priorityScores[1].category).toBe('nutritionBalance');
    expect(priorityScores[1].score).toBe(21.93);
    expect(priorityScores[1].priority).toBe('high');

    // 3番目の優先度はpreferenceDisagreement（頻度23.08%、重要度0.8）
    expect(priorityScores[2].category).toBe('preferenceDisagreement');
    expect(priorityScores[2].score).toBe(18.46);
    expect(priorityScores[2].priority).toBe('medium');

    // 中・低優先度のカテゴリはingredientUnavailableとcookingTimeTooLong
    expect(priorityScores[3].category).toBe('ingredientUnavailable');
    expect(priorityScores[3].priority).toBe('medium');

    expect(priorityScores[4].category).toBe('cookingTimeTooLong');
    expect(priorityScores[4].priority).toBe('low');

    // Step 4: 時系列の発生頻度を検証（トレンド分析）
    expect(aggregatedPatterns.temporalTrend).toBeDefined();
    expect(aggregatedPatterns.temporalTrend.weekly).toBeDefined();
    expect(aggregatedPatterns.temporalTrend.weekly.length).toBeGreaterThan(0);

    // 可視化用データの検証
    const visualizationData = {
      totalRejections: aggregatedPatterns.totalRejections,
      categoryBreakdown: aggregatedPatterns.categoryBreakdown,
      priorityScores: priorityScores,
      temporalTrend: aggregatedPatterns.temporalTrend,
    };

    expect(visualizationData.totalRejections).toBe(52);
    expect(Object.keys(visualizationData.categoryBreakdown).length).toBe(5);
    expect(visualizationData.priorityScores.length).toBe(5);
    expect(visualizationData.temporalTrend).toBeDefined();

    // Step 5: 複数回の分類実行で結果の一貫性を検証
    const secondCategorization = categorizeMenuRejectionReasons(rejectionReasons);
    expect(secondCategorization.length).toBe(categorizedResults.length);

    for (let i = 0; i < categorizedResults.length; i++) {
      expect(secondCategorization[i].category).toBe(categorizedResults[i].category);
      expect(secondCategorization[i].id).toBe(categorizedResults[i].id);
    }

    const secondAggregation = aggregateFailurePatterns(secondCategorization, aggregationPeriod);
    expect(secondAggregation.totalRejections).toBe(aggregatedPatterns.totalRejections);
    expect(secondAggregation.categoryBreakdown.budgetExcess.count).toBe(16);
    expect(secondAggregation.categoryBreakdown.nutritionBalance.count).toBe(12);

    const secondPriorityScores = calculatePriorityScores(secondAggregation);
    expect(secondPriorityScores[0].category).toBe('budgetExcess');
    expect(secondPriorityScores[0].score).toBe(27.69);
    expect(secondPriorityScores[1].category).toBe('nutritionBalance');
    expect(secondPriorityScores[1].score).toBe(21.93);
  });
});