import { approvePurchaseTrendAndReflectProposal } from '../../src/logic/it-1-br-3-2-1';

describe('Season and Weekday Purchase Trend Approval and Reflection', () => {
  // SCEN-436: [edge] 季節変動・曜日別購買傾向の承認判定 - 買い物提案ロジックへの反映方針が複数候補の境界値で正しく決定される
  test('should correctly determine approval judgment and reflect shopping proposal logic across boundary value cases', () => {
    // テストデータ: 季節変動係数が0.95～1.05の範囲にある複数の商品カテゴリ
    const baselineSeasonalCoeff = 1.0;
    const baselineWeekdayCoeff = 1.0;

    // 境界値①: 季節係数0.95（下限値）と曜日係数0.90（下限値）の組み合わせ
    const boundary1Input = {
      seasonalCoefficient: 0.95,
      weekdayCoefficient: 0.90,
      baselineSeasonalCoeff: baselineSeasonalCoeff,
      baselineWeekdayCoeff: baselineWeekdayCoeff,
      productCategories: [
        { categoryId: 'cat_001', categoryName: 'vegetables', basePrice: 1000 },
        { categoryId: 'cat_002', categoryName: 'fruits', basePrice: 1500 },
      ],
      proposalCandidates: [
        { proposalId: 'prop_001', recommendedAmount: 5000, priority: 1 },
        { proposalId: 'prop_002', recommendedAmount: 3000, priority: 2 },
      ],
    };

    const result1 = approvePurchaseTrendAndReflectProposal(boundary1Input);

    // 季節係数0.95、曜日係数0.90の場合、両者が基準値以下のため、保守的な提案が選択される
    expect(result1.approvalJudgment).toBe('approved_conservative');
    expect(result1.reflectedProposalId).toBe('prop_002');
    expect(result1.seasonalAdjustmentFactor).toBeCloseTo(0.95, 2);
    expect(result1.weekdayAdjustmentFactor).toBeCloseTo(0.90, 2);

    // 境界値②: 季節係数1.05（上限値）と曜日係数1.10（上限値）の組み合わせ
    const boundary2Input = {
      seasonalCoefficient: 1.05,
      weekdayCoefficient: 1.10,
      baselineSeasonalCoeff: baselineSeasonalCoeff,
      baselineWeekdayCoeff: baselineWeekdayCoeff,
      productCategories: [
        { categoryId: 'cat_001', categoryName: 'vegetables', basePrice: 1000 },
        { categoryId: 'cat_002', categoryName: 'fruits', basePrice: 1500 },
      ],
      proposalCandidates: [
        { proposalId: 'prop_001', recommendedAmount: 5000, priority: 1 },
        { proposalId: 'prop_002', recommendedAmount: 3000, priority: 2 },
      ],
    };

    const result2 = approvePurchaseTrendAndReflectProposal(boundary2Input);

    // 季節係数1.05、曜日係数1.10の場合、両者が基準値以上のため、積極的な提案が選択される
    expect(result2.approvalJudgment).toBe('approved_aggressive');
    expect(result2.reflectedProposalId).toBe('prop_001');
    expect(result2.seasonalAdjustmentFactor).toBeCloseTo(1.05, 2);
    expect(result2.weekdayAdjustmentFactor).toBeCloseTo(1.10, 2);

    // 境界値③: 季節係数0.99と曜日係数1.01の微細な変動ケース
    const boundary3Input = {
      seasonalCoefficient: 0.99,
      weekdayCoefficient: 1.01,
      baselineSeasonalCoeff: baselineSeasonalCoeff,
      baselineWeekdayCoeff: baselineWeekdayCoeff,
      productCategories: [
        { categoryId: 'cat_001', categoryName: 'vegetables', basePrice: 1000 },
        { categoryId: 'cat_002', categoryName: 'fruits', basePrice: 1500 },
      ],
      proposalCandidates: [
        { proposalId: 'prop_001', recommendedAmount: 5000, priority: 1 },
        { proposalId: 'prop_002', recommendedAmount: 3000, priority: 2 },
      ],
    };

    const result3 = approvePurchaseTrendAndReflectProposal(boundary3Input);

    // 季節係数0.99（微減）と曜日係数1.01（微増）の場合、バランス型の提案が選択される
    expect(result3.approvalJudgment).toBe('approved_balanced');
    expect(result3.reflectedProposalId).toBe('prop_001');
    expect(result3.seasonalAdjustmentFactor).toBeCloseTo(0.99, 2);
    expect(result3.weekdayAdjustmentFactor).toBeCloseTo(1.01, 2);

    // 複数候補提案の優先度決定方式の検証
    const multiProposalInput = {
      seasonalCoefficient: 1.02,
      weekdayCoefficient: 1.05,
      baselineSeasonalCoeff: baselineSeasonalCoeff,
      baselineWeekdayCoeff: baselineWeekdayCoeff,
      productCategories: [
        { categoryId: 'cat_001', categoryName: 'vegetables', basePrice: 1000 },
        { categoryId: 'cat_002', categoryName: 'fruits', basePrice: 1500 },
        { categoryId: 'cat_003', categoryName: 'dairy', basePrice: 800 },
      ],
      proposalCandidates: [
        { proposalId: 'prop_a01', recommendedAmount: 7000, priority: 1 },
        { proposalId: 'prop_a02', recommendedAmount: 5500, priority: 2 },
        { proposalId: 'prop_a03', recommendedAmount: 4000, priority: 3 },
      ],
    };

    const resultMulti = approvePurchaseTrendAndReflectProposal(multiProposalInput);

    // 季節係数1.02、曜日係数1.05の場合、最高優先度の提案が選択される
    expect(resultMulti.approvalJudgment).toBe('approved_aggressive');
    expect(resultMulti.reflectedProposalId).toBe('prop_a01');
    expect(resultMulti.proposalRanking).toEqual(['prop_a01', 'prop_a02', 'prop_a03']);
    expect(resultMulti.seasonalAdjustmentFactor).toBeCloseTo(1.02, 2);
    expect(resultMulti.weekdayAdjustmentFactor).toBeCloseTo(1.05, 2);

    // 提案内容の一貫性検証：同じ係数組み合わせで複数回実行した場合、同じ結果を返す
    const consistency1 = approvePurchaseTrendAndReflectProposal(boundary1Input);
    const consistency2 = approvePurchaseTrendAndReflectProposal(boundary1Input);

    expect(consistency1.reflectedProposalId).toBe(consistency2.reflectedProposalId);
    expect(consistency1.approvalJudgment).toBe(consistency2.approvalJudgment);
    expect(consistency1.seasonalAdjustmentFactor).toBeCloseTo(consistency2.seasonalAdjustmentFactor, 2);
    expect(consistency1.weekdayAdjustmentFactor).toBeCloseTo(consistency2.weekdayAdjustmentFactor, 2);
  });
});