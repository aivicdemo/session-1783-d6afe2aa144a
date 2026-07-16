import { classifyRejectionReason } from '../../src/logic/it-8-1-2-1';

describe('献立却下理由の自動分類機能', () => {
  // SCEN-291
  test('却下理由テキストが事前定義カテゴリに正しく自動分類される', () => {
    // ハッピーパス: 予算関連の却下理由
    const budgetResult = classifyRejectionReason('食材費が予算を超えてしまう');
    expect(budgetResult.category).toBe('予算不足');
    expect(budgetResult.confidence).toBeGreaterThanOrEqual(0);
    expect(budgetResult.confidence).toBeLessThanOrEqual(100);
    expect(typeof budgetResult.confidence).toBe('number');

    // ハッピーパス: 技術関連の却下理由
    const techResult = classifyRejectionReason('調理時間が制限時間を超える');
    expect(techResult.category).toBe('技術的課題');
    expect(techResult.confidence).toBeGreaterThanOrEqual(0);
    expect(techResult.confidence).toBeLessThanOrEqual(100);

    // ハッピーパス: 優先度関連の却下理由
    const priorityResult = classifyRejectionReason('他の献立を優先したい');
    expect(priorityResult.category).toBe('優先度低');
    expect(priorityResult.confidence).toBeGreaterThanOrEqual(0);
    expect(priorityResult.confidence).toBeLessThanOrEqual(100);

    // ハッピーパス: その他カテゴリ
    const otherResult = classifyRejectionReason('好みが合わない');
    expect(otherResult.category).toBe('その他');
    expect(otherResult.confidence).toBeGreaterThanOrEqual(0);
    expect(otherResult.confidence).toBeLessThanOrEqual(100);

    // 境界値: 空文字列
    const emptyResult = classifyRejectionReason('');
    expect(emptyResult.category).toBe('その他');
    expect(emptyResult.confidence).toBeGreaterThanOrEqual(0);
    expect(emptyResult.confidence).toBeLessThanOrEqual(100);

    // 境界値: 特殊文字を含む
    const specialCharResult = classifyRejectionReason('!!!@@##予算$$%%^^&&');
    expect(emptyResult.category).toBe('その他');
    expect(specialCharResult.confidence).toBeGreaterThanOrEqual(0);
    expect(specialCharResult.confidence).toBeLessThanOrEqual(100);

    // 境界値: 極端に長いテキスト
    const longText = 'これは非常に長い却下理由です。'.repeat(100);
    const longResult = classifyRejectionReason(longText);
    expect(typeof longResult.category).toBe('string');
    expect(longResult.confidence).toBeGreaterThanOrEqual(0);
    expect(longResult.confidence).toBeLessThanOrEqual(100);

    // ハッピーパス: 複合的なキーワード（予算と技術）
    const complexResult = classifyRejectionReason('食材が高すぎて調理時間も長い');
    expect(['予算不足', '技術的課題', 'その他']).toContain(complexResult.category);
    expect(complexResult.confidence).toBeGreaterThanOrEqual(0);
    expect(complexResult.confidence).toBeLessThanOrEqual(100);

    // ハッピーパス: 数値を含むテキスト
    const numericResult = classifyRejectionReason('1000円の予算を超過している');
    expect(numericResult.category).toBe('予算不足');
    expect(numericResult.confidence).toBeGreaterThanOrEqual(0);
    expect(numericResult.confidence).toBeLessThanOrEqual(100);

    // 境界値: 1文字のみ
    const singleCharResult = classifyRejectionReason('予');
    expect(singleCharResult.category).toBe('その他');
    expect(singleCharResult.confidence).toBeGreaterThanOrEqual(0);
    expect(singleCharResult.confidence).toBeLessThanOrEqual(100);

    // ハッピーパス: 複数の予算関連キーワード
    const multipleBudgetResult = classifyRejectionReason('高い、費用がかかる、お金がない');
    expect(multipleBudgetResult.category).toBe('予算不足');
    expect(multipleBudgetResult.confidence).toBeGreaterThanOrEqual(0);
    expect(multipleBudgetResult.confidence).toBeLessThanOrEqual(100);

    // ハッピーパス: 技術関連の複数キーワード
    const multiTechResult = classifyRejectionReason('時間が足りない、複雑すぎる、手間がかかる');
    expect(multiTechResult.category).toBe('技術的課題');
    expect(multiTechResult.confidence).toBeGreaterThanOrEqual(0);
    expect(multiTechResult.confidence).toBeLessThanOrEqual(100);
  });
});