import { classifyMenuRejectionReason } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類機能', () => {
  // SCEN-830
  test('複数のカテゴリに該当する曖昧な却下理由に対して、確度スコアが最も高いカテゴリが選択される', () => {
    // 複数のカテゴリに該当する曖昧な却下修正理由を準備
    const ambiguousReason =
      'パフォーマンスと互換性の両方に関連する理由で却下した。調理時間も長く、アレルギー対応も不十分だった';

    // 1回目の分類処理を実行し、各カテゴリに対する確度スコアを取得
    const firstResult = classifyMenuRejectionReason(ambiguousReason);

    // 分類結果の構造を検証
    expect(firstResult).toHaveProperty('selectedCategory');
    expect(firstResult).toHaveProperty('confidenceScores');
    expect(firstResult).toHaveProperty('selectedConfidenceScore');

    // confidenceScores が複数のカテゴリを含むことを検証
    expect(Object.keys(firstResult.confidenceScores).length).toBeGreaterThanOrEqual(2);

    // 各確度スコアが 0.0 ～ 1.0 の範囲内であることを検証
    Object.values(firstResult.confidenceScores).forEach((score) => {
      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0.0);
      expect(score).toBeLessThanOrEqual(1.0);
    });

    // 選択されたカテゴリの確度スコアが最高値であることを検証
    const maxConfidenceScore = Math.max(...Object.values(firstResult.confidenceScores));
    expect(firstResult.selectedConfidenceScore).toBe(maxConfidenceScore);

    // 選択されたカテゴリが確度スコア最高値を持つカテゴリであることを検証
    const categoryWithMaxScore = Object.entries(firstResult.confidenceScores).find(
      ([, score]) => score === maxConfidenceScore,
    )?.[0];
    expect(firstResult.selectedCategory).toBe(categoryWithMaxScore);

    // 同じ却下理由で複数回分類を実行し、結果の一貫性を確認
    const secondResult = classifyMenuRejectionReason(ambiguousReason);
    const thirdResult = classifyMenuRejectionReason(ambiguousReason);

    // 複数実行時も同じカテゴリが一貫して選択されることを検証
    expect(secondResult.selectedCategory).toBe(firstResult.selectedCategory);
    expect(thirdResult.selectedCategory).toBe(firstResult.selectedCategory);

    // 複数実行時も確度スコアが一貫していることを検証
    expect(secondResult.selectedConfidenceScore).toBe(firstResult.selectedConfidenceScore);
    expect(thirdResult.selectedConfidenceScore).toBe(firstResult.selectedConfidenceScore);

    // 全実行で選択されたカテゴリが確度スコア最高値であることを再検証
    const secondMaxScore = Math.max(...Object.values(secondResult.confidenceScores));
    const thirdMaxScore = Math.max(...Object.values(thirdResult.confidenceScores));

    expect(secondResult.selectedConfidenceScore).toBe(secondMaxScore);
    expect(thirdResult.selectedConfidenceScore).toBe(thirdMaxScore);

    // 選択されたカテゴリが予期された値（複数候補から最高スコアを持つもの）であることを確認
    expect(typeof firstResult.selectedCategory).toBe('string');
    expect(firstResult.selectedCategory.length).toBeGreaterThan(0);
  });
});