import { calculateSeasonalPatternScore } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズムの改善前後効果比較 - 旬食材・割引商品優先度スコア計算', () => {
  // SCEN-834: [error] 旬食材・割引商品優先度スコア計算 - 季節パターンルールが未定義の状態で献立生成を実行した場合、エラーが発生して献立提案が中止される
  test('季節パターンルールが未定義の場合、エラーメッセージが発生して献立提案プロセスが中止される', () => {
    const input = {
      seasonalPatternRules: [],
      discountThreshold: 20,
      ingredientDate: new Date('2024-01-15T10:00:00Z'),
      ingredientCategory: 'vegetable',
      currentInventoryLevel: 15,
    };

    expect(() => calculateSeasonalPatternScore(input)).toThrow(/季節パターンルール/);
  });
});