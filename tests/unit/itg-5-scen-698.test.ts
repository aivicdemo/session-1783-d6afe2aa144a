import { classifyMenuRejectionReason } from '../../src/logic/it-7-3-1';

describe('献立却下修正理由の自動カテゴリ分類', () => {
  // SCEN-698: [edge] 献立却下修正理由の自動カテゴリ分類 - 既定カテゴリに該当しない理由を『その他』カテゴリに分類する
  test('既定カテゴリに該当しない却下修正理由が『その他』に分類される', () => {
    const non_matching_reasons = [
      'システムがクラッシュした',
      'アプリが反応しない',
      '子どもが嫌がった理由は複雑',
    ];

    const results = non_matching_reasons.map((reason) =>
      classifyMenuRejectionReason({ reason_text: reason })
    );

    // すべての結果がカテゴリ『その他』に分類されることを確認
    expect(results).toHaveLength(3);
    expect(results[0]).toEqual({
      category: 'その他',
      reason_text: 'システムがクラッシュした',
      confidence: expect.any(Number),
    });
    expect(results[1]).toEqual({
      category: 'その他',
      reason_text: 'アプリが反応しない',
      confidence: expect.any(Number),
    });
    expect(results[2]).toEqual({
      category: 'その他',
      reason_text: '子どもが嫌がった理由は複雑',
      confidence: expect.any(Number),
    });

    // 『その他』カテゴリに分類された理由のテキストが正確に保持されていることを確認
    results.forEach((result, index) => {
      expect(result.reason_text).toBe(non_matching_reasons[index]);
      expect(result.category).toBe('その他');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(100);
    });

    // 複数の非該当理由を同時に処理した場合、すべてが『その他』に正しく分類されることを確認
    const batch_result = classifyMenuRejectionReason({
      reason_text: 'その他',
      batch_reasons: [
        'テスト理由1',
        'テスト理由2',
        'テスト理由3',
      ],
    });

    expect(batch_result).toEqual({
      category: 'その他',
      reason_text: 'その他',
      batch_results: expect.arrayContaining([
        expect.objectContaining({ category: 'その他' }),
        expect.objectContaining({ category: 'その他' }),
        expect.objectContaining({ category: 'その他' }),
      ]),
      confidence: expect.any(Number),
    });

    // 各バッチ結果が『その他』カテゴリであることを確認
    if (batch_result.batch_results) {
      batch_result.batch_results.forEach((item) => {
        expect(item.category).toBe('その他');
      });
    }
  });
});