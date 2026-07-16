import { extractFailurePatterns } from '../../src/logic/it-8-1-1-1';

describe('失敗パターン分析機能 - 頻出度閾値を超えた却下理由の抽出', () => {
  // SCEN-283
  test('頻出度閾値を超えた却下理由が失敗パターンとして正しく抽出される', () => {
    // テストデータ準備: 複数の失敗レコード（20件）を作成
    const failureRecords = [
      { rejection_reason: '栄養バランス不適切' },
      { rejection_reason: '栄養バランス不適切' },
      { rejection_reason: '栄養バランス不適切' },
      { rejection_reason: '栄養バランス不適切' },
      { rejection_reason: '栄養バランス不適切' },
      { rejection_reason: '栄養バランス不適切' },
      { rejection_reason: '家族好み未反映' },
      { rejection_reason: '家族好み未反映' },
      { rejection_reason: '家族好み未反映' },
      { rejection_reason: '家族好み未反映' },
      { rejection_reason: '調理時間超過' },
      { rejection_reason: '調理時間超過' },
      { rejection_reason: '調理時間超過' },
      { rejection_reason: '食材制限漏れ' },
      { rejection_reason: '食材制限漏れ' },
      { rejection_reason: 'その他' },
      { rejection_reason: 'その他' },
      { rejection_reason: 'その他' },
      { rejection_reason: 'その他' },
      { rejection_reason: 'その他' },
    ];

    const frequency_threshold_percent = 30;

    // 失敗パターン分析機能を実行
    const result = extractFailurePatterns(failureRecords, frequency_threshold_percent);

    // 期待値の計算
    // 全20件中：
    // - 栄養バランス不適切: 6件 → 30% (閾値以上)
    // - 家族好み未反映: 4件 → 20% (閾値未満)
    // - 調理時間超過: 3件 → 15% (閾値未満)
    // - 食材制限漏れ: 2件 → 10% (閾値未満)
    // - その他: 5件 → 25% (閾値未満)

    // 抽出された失敗パターンのリストを取得して検証
    expect(result.failure_patterns).toEqual(
      expect.arrayContaining([
        {
          rejection_reason: '栄養バランス不適切',
          occurrence_count: 6,
          frequency_percent: 30,
        },
      ])
    );

    // 抽出された失敗パターンが正確に1件であることを確認
    expect(result.failure_patterns).toHaveLength(1);

    // 各失敗パターンについて、出現頻度が閾値以上であることを検証
    result.failure_patterns.forEach((pattern) => {
      expect(pattern.frequency_percent).toBeGreaterThanOrEqual(frequency_threshold_percent);
    });

    // 閾値未満の却下理由が失敗パターンリストに含まれていないことを確認
    const extracted_reasons = result.failure_patterns.map((p) => p.rejection_reason);
    expect(extracted_reasons).not.toContain('家族好み未反映');
    expect(extracted_reasons).not.toContain('調理時間超過');
    expect(extracted_reasons).not.toContain('食材制限漏れ');
    expect(extracted_reasons).not.toContain('その他');

    // 分析統計情報の確認
    expect(result.total_records_analyzed).toBe(20);
    expect(result.analysis_threshold_percent).toBe(30);
  });

  test('複数の却下理由が同じ頻出度の場合、すべてが正しくリストアップされる', () => {
    // テストデータ準備: 複数の却下理由が同じ頻出度を持つケース（16件）
    const failureRecords = [
      { rejection_reason: '栄養バランス不適切' },
      { rejection_reason: '栄養バランス不適切' },
      { rejection_reason: '栄養バランス不適切' },
      { rejection_reason: '栄養バランス不適切' },
      { rejection_reason: '家族好み未反映' },
      { rejection_reason: '家族好み未反映' },
      { rejection_reason: '家族好み未反映' },
      { rejection_reason: '家族好み未反映' },
      { rejection_reason: '調理時間超過' },
      { rejection_reason: '調理時間超過' },
      { rejection_reason: '調理時間超過' },
      { rejection_reason: '調理時間超過' },
      { rejection_reason: '食材制限漏れ' },
      { rejection_reason: '食材制限漏れ' },
      { rejection_reason: 'その他' },
      { rejection_reason: 'その他' },
    ];

    const frequency_threshold_percent = 25;

    // 失敗パターン分析機能を実行
    const result = extractFailurePatterns(failureRecords, frequency_threshold_percent);

    // 期待値の計算
    // 全16件中：
    // - 栄養バランス不適切: 4件 → 25% (閾値以上)
    // - 家族好み未反映: 4件 → 25% (閾値以上)
    // - 調理時間超過: 4件 → 25% (閾値以上)
    // - 食材制限漏れ: 2件 → 12.5% (閾値未満)
    // - その他: 2件 → 12.5% (閾値未満)

    // 同じ頻出度（25%）の却下理由がすべてリストアップされていることを確認
    expect(result.failure_patterns).toHaveLength(3);

    const extracted_reasons = result.failure_patterns.map((p) => p.rejection_reason);
    expect(extracted_reasons).toContain('栄養バランス不適切');
    expect(extracted_reasons).toContain('家族好み未反映');
    expect(extracted_reasons).toContain('調理時間超過');

    // すべての抽出パターンが同じ頻出度であることを確認
    result.failure_patterns.forEach((pattern) => {
      expect(pattern.frequency_percent).toBe(25);
      expect(pattern.occurrence_count).toBe(4);
    });

    // 閾値未満の理由は含まれていないことを確認
    expect(extracted_reasons).not.toContain('食材制限漏れ');
    expect(extracted_reasons).not.toContain('その他');
  });

  test('空のレコードセットまたは閾値を超える理由がない場合、空の失敗パターンリストが返される', () => {
    // エッジケース：空のレコードセット
    const emptyRecords: Array<{ rejection_reason: string }> = [];
    const frequency_threshold_percent = 30;

    const result_empty = extractFailurePatterns(emptyRecords, frequency_threshold_percent);

    expect(result_empty.failure_patterns).toHaveLength(0);
    expect(result_empty.total_records_analyzed).toBe(0);

    // エッジケース：すべての理由が閾値未満の場合（10件）
    const lowFrequencyRecords = [
      { rejection_reason: '理由A' },
      { rejection_reason: '理由B' },
      { rejection_reason: '理由C' },
      { rejection_reason: '理由D' },
      { rejection_reason: '理由E' },
      { rejection_reason: '理由F' },
      { rejection_reason: '理由G' },
      { rejection_reason: '理由H' },
      { rejection_reason: '理由I' },
      { rejection_reason: '理由J' },
    ];

    const result_low_freq = extractFailurePatterns(lowFrequencyRecords, 50);

    expect(result_low_freq.failure_patterns).toHaveLength(0);
    expect(result_low_freq.total_records_analyzed).toBe(10);
  });

  test('無効な入力値（負の閾値、100を超える閾値）に対してエラーが発生する', () => {
    const testRecords = [{ rejection_reason: 'test' }];

    // 負の閾値
    expect(() => extractFailurePatterns(testRecords, -10)).toThrow(/閾値/);

    // 100を超える閾値
    expect(() => extractFailurePatterns(testRecords, 150)).toThrow(/閾値/);
  });
});