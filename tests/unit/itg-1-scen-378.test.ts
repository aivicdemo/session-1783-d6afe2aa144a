import { classifyMealRejectionReason } from '../../src/logic/it-1-br-1783670064270-1-1-1';

describe('献立却下理由の自動カテゴリ分類機能', () => {
  // SCEN-378
  test('事前定義カテゴリに該当しない曖昧なテキストが「その他」カテゴリに分類される', () => {
    const ambiguousReason = 'なんか違う気がする';

    const result = classifyMealRejectionReason({
      rejectionReasonText: ambiguousReason,
    });

    expect(result).toEqual({
      category: 'その他',
      confidence: expect.any(Number),
      rejectionReasonText: ambiguousReason,
      timestamp: expect.any(String),
      isAmbiguous: true,
    });

    expect(result.category).toBe('その他');
    expect(result.isAmbiguous).toBe(true);
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(100);
    expect(typeof result.timestamp).toBe('string');
  });
});