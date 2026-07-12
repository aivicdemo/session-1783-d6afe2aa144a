import { calculatePriorityScore } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-633
  test('改善提案の優先度スコア算出 - 優先度スコア算出エラー: 評価項目のいずれかが不足している場合にエラーが発生する', () => {
    // 正常系: すべての評価項目が入力されている場合
    const validProposal = {
      proposalId: 'prop_001',
      feasibility: 80,
      effectDegree: 75,
      cost: 65,
      userSatisfaction: 85,
    };
    const validResult = calculatePriorityScore(validProposal);
    expect(validResult).toBe(76); // (80+75+65+85)/4 = 76.25 → 76

    // エラー系: feasibility が未入力
    const missingFeasibility = {
      proposalId: 'prop_002',
      feasibility: undefined,
      effectDegree: 75,
      cost: 65,
      userSatisfaction: 85,
    };
    expect(() => calculatePriorityScore(missingFeasibility)).toThrow(/評価項目/);

    // エラー系: effectDegree が未入力
    const missingEffectDegree = {
      proposalId: 'prop_003',
      feasibility: 80,
      effectDegree: undefined,
      cost: 65,
      userSatisfaction: 85,
    };
    expect(() => calculatePriorityScore(missingEffectDegree)).toThrow(/評価項目/);

    // エラー系: cost が未入力
    const missingCost = {
      proposalId: 'prop_004',
      feasibility: 80,
      effectDegree: 75,
      cost: undefined,
      userSatisfaction: 85,
    };
    expect(() => calculatePriorityScore(missingCost)).toThrow(/評価項目/);

    // エラー系: userSatisfaction が未入力
    const missingUserSatisfaction = {
      proposalId: 'prop_005',
      feasibility: 80,
      effectDegree: 75,
      cost: 65,
      userSatisfaction: undefined,
    };
    expect(() => calculatePriorityScore(missingUserSatisfaction)).toThrow(/評価項目/);

    // エラー系: 複数の評価項目が未入力
    const multipleMissing = {
      proposalId: 'prop_006',
      feasibility: undefined,
      effectDegree: undefined,
      cost: 65,
      userSatisfaction: 85,
    };
    expect(() => calculatePriorityScore(multipleMissing)).toThrow(/評価項目/);

    // エラー系: すべての評価項目が未入力
    const allMissing = {
      proposalId: 'prop_007',
      feasibility: undefined,
      effectDegree: undefined,
      cost: undefined,
      userSatisfaction: undefined,
    };
    expect(() => calculatePriorityScore(allMissing)).toThrow(/評価項目/);

    // エラー系: null が渡される場合
    const nullProposal = {
      proposalId: 'prop_008',
      feasibility: null,
      effectDegree: 75,
      cost: 65,
      userSatisfaction: 85,
    };
    expect(() => calculatePriorityScore(nullProposal)).toThrow(/評価項目/);

    // 境界値: 評価項目が0（有効な値）の場合は成功
    const zeroValues = {
      proposalId: 'prop_009',
      feasibility: 0,
      effectDegree: 0,
      cost: 0,
      userSatisfaction: 0,
    };
    const zeroResult = calculatePriorityScore(zeroValues);
    expect(zeroResult).toBe(0); // (0+0+0+0)/4 = 0

    // 境界値: 評価項目が100（最大値）の場合は成功
    const maxValues = {
      proposalId: 'prop_010',
      feasibility: 100,
      effectDegree: 100,
      cost: 100,
      userSatisfaction: 100,
    };
    const maxResult = calculatePriorityScore(maxValues);
    expect(maxResult).toBe(100); // (100+100+100+100)/4 = 100
  });
});