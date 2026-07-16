import { analyzeFailurePatterns } from '../../src/logic/it-8-1-1-1';

describe('失敗パターン分析機能', () => {
  // SCEN-284: [normal] 複数理由の組み合わせパターンが失敗パターンとして識別される
  test('複数の失敗理由の組み合わせが失敗パターンとして正確に識別され、出現頻度とスコアが正しく計算される', () => {
    // 準備: 複数の失敗理由データセット（最低10件以上）
    const failure_records = [
      // パターン1: 「ユーザビリティの問題」+ 「パフォーマンス低下」の組み合わせ
      {
        record_id: 1,
        reason_category: 'usability',
        reason_text: 'UI操作が複雑',
        timestamp: '2024-01-01T10:00:00Z',
      },
      {
        record_id: 2,
        reason_category: 'performance',
        reason_text: 'アプリの動作が遅い',
        timestamp: '2024-01-01T10:05:00Z',
      },
      {
        record_id: 3,
        reason_category: 'usability',
        reason_text: 'ボタン配置が分かりづらい',
        timestamp: '2024-01-01T10:10:00Z',
      },
      {
        record_id: 4,
        reason_category: 'performance',
        reason_text: 'レスポンス時間が長い',
        timestamp: '2024-01-01T10:15:00Z',
      },
      // パターン2: 「パフォーマンス低下」+ 「コスト負担」の組み合わせ
      {
        record_id: 5,
        reason_category: 'performance',
        reason_text: 'サーバー遅延',
        timestamp: '2024-01-01T10:20:00Z',
      },
      {
        record_id: 6,
        reason_category: 'cost',
        reason_text: '月額費用が高い',
        timestamp: '2024-01-01T10:25:00Z',
      },
      {
        record_id: 7,
        reason_category: 'performance',
        reason_text: 'ページ読み込み時間超過',
        timestamp: '2024-01-01T10:30:00Z',
      },
      {
        record_id: 8,
        reason_category: 'cost',
        reason_text: '追加機能の料金が不透明',
        timestamp: '2024-01-01T10:35:00Z',
      },
      // パターン3: 「ユーザビリティの問題」+ 「コスト負担」の組み合わせ
      {
        record_id: 9,
        reason_category: 'usability',
        reason_text: 'メニュー構造が複雑',
        timestamp: '2024-01-01T10:40:00Z',
      },
      {
        record_id: 10,
        reason_category: 'cost',
        reason_text: 'プラン選択が分かりづらい',
        timestamp: '2024-01-01T10:45:00Z',
      },
      {
        record_id: 11,
        reason_category: 'usability',
        reason_text: 'ガイドが不十分',
        timestamp: '2024-01-01T10:50:00Z',
      },
      {
        record_id: 12,
        reason_category: 'cost',
        reason_text: 'コストパフォーマンスが悪い',
        timestamp: '2024-01-01T10:55:00Z',
      },
    ];

    // 期待される失敗パターン分析結果
    // 複数理由の組み合わせ検出の閾値: 出現頻度 >= 2件以上を検出対象
    // 信頼度スコア計算式: (出現件数 / 総件数) * 100
    // 合計12件のデータから計算:
    // - usability + performance: 2件 → 16.67%
    // - performance + cost: 2件 → 16.67%
    // - usability + cost: 2件 → 16.67%

    const result = analyzeFailurePatterns({
      failure_records,
      frequency_threshold: 2,
      confidence_threshold: 10,
    });

    // 失敗パターンが識別されていることを検証
    expect(result.combination_patterns).toBeDefined();
    expect(Array.isArray(result.combination_patterns)).toBe(true);
    expect(result.combination_patterns.length).toBeGreaterThanOrEqual(3);

    // パターン1: usability + performance の検証
    const pattern_1 = result.combination_patterns.find(
      (p) =>
        p.reason_categories.includes('usability') &&
        p.reason_categories.includes('performance'),
    );
    expect(pattern_1).toBeDefined();
    expect(pattern_1.occurrence_count).toBe(2);
    expect(pattern_1.confidence_score).toBeCloseTo(16.67, 1);
    expect(pattern_1.related_record_ids).toContain(1);
    expect(pattern_1.related_record_ids).toContain(2);

    // パターン2: performance + cost の検証
    const pattern_2 = result.combination_patterns.find(
      (p) =>
        p.reason_categories.includes('performance') &&
        p.reason_categories.includes('cost'),
    );
    expect(pattern_2).toBeDefined();
    expect(pattern_2.occurrence_count).toBe(2);
    expect(pattern_2.confidence_score).toBeCloseTo(16.67, 1);
    expect(pattern_2.related_record_ids).toContain(5);
    expect(pattern_2.related_record_ids).toContain(6);

    // パターン3: usability + cost の検証
    const pattern_3 = result.combination_patterns.find(
      (p) =>
        p.reason_categories.includes('usability') &&
        p.reason_categories.includes('cost'),
    );
    expect(pattern_3).toBeDefined();
    expect(pattern_3.occurrence_count).toBe(2);
    expect(pattern_3.confidence_score).toBeCloseTo(16.67, 1);
    expect(pattern_3.related_record_ids).toContain(9);
    expect(pattern_3.related_record_ids).toContain(10);

    // 全パターンの詳細情報が正しくリンクされていることを検証
    result.combination_patterns.forEach((pattern) => {
      expect(pattern.reason_categories).toBeDefined();
      expect(Array.isArray(pattern.reason_categories)).toBe(true);
      expect(pattern.reason_categories.length).toBe(2);
      expect(pattern.occurrence_count).toBeGreaterThanOrEqual(2);
      expect(pattern.confidence_score).toBeGreaterThan(0);
      expect(pattern.confidence_score).toBeLessThanOrEqual(100);
      expect(Array.isArray(pattern.related_record_ids)).toBe(true);
      expect(pattern.related_record_ids.length).toBe(pattern.occurrence_count);
    });

    // 総合結果の集計が正しいことを検証
    expect(result.total_records_analyzed).toBe(12);
    expect(result.total_patterns_identified).toBe(3);
    expect(result.analysis_timestamp).toBeDefined();
    expect(typeof result.analysis_timestamp).toBe('string');
  });
});