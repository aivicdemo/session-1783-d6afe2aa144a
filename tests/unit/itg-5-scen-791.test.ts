import { calculatePriorityScoreForExternalFactorAnalysis } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズムの成功・失敗パターン分析と改善提案 - 週次集計と効果差定量比較', () => {
  // SCEN-791: 予測精度低下検出・原因分析機能 - 抽出された主要因に基づいて外部要因分析の優先順位を正確に決定する
  test('主要因の影響度スコアと関連度に基づいて外部要因分析の優先順位が正確に決定される', () => {
    // 【Precondition】予測精度低下検出が完了し、複数の主要因が抽出された状態
    const primary_factors = [
      {
        factor_id: 'weather_01',
        factor_name: '気象パターン変動',
        impact_score: 85,
        relevance_degree: 0.92,
        affected_user_count: 2450,
      },
      {
        factor_id: 'event_02',
        factor_name: 'イベント施策効果',
        impact_score: 72,
        relevance_degree: 0.78,
        affected_user_count: 1680,
      },
      {
        factor_id: 'competitor_03',
        factor_name: '競合店舗施策',
        impact_score: 58,
        relevance_degree: 0.65,
        affected_user_count: 940,
      },
      {
        factor_id: 'seasonal_04',
        factor_name: '季節トレンド',
        impact_score: 91,
        relevance_degree: 0.88,
        affected_user_count: 3120,
      },
    ];

    // 【Trigger】優先順位決定ロジックが実行される
    const result = calculatePriorityScoreForExternalFactorAnalysis(primary_factors);

    // 【Outcome】優先順位が影響度スコアと関連度に基づいて正確に決定されることを検証
    // 期待値計算（structured.formula に従う）:
    // 優先度スコア = (影響度スコア × 関連度 × 影響ユーザー数 / 全ユーザー) × 100
    // 基準値: 全ユーザー数 = 10000 と仮定

    // seasonal_04: (91 × 0.88 × 3120 / 10000) × 100 = (80.08 × 0.312) × 100 ≈ 2498.5
    const seasonal_priority_score = (91 * 0.88 * 3120 / 10000) * 100;

    // weather_01: (85 × 0.92 × 2450 / 10000) × 100 = (78.2 × 0.245) × 100 ≈ 1911
    const weather_priority_score = (85 * 0.92 * 2450 / 10000) * 100;

    // event_02: (72 × 0.78 × 1680 / 10000) × 100 = (56.16 × 0.168) × 100 ≈ 943.5
    const event_priority_score = (72 * 0.78 * 1680 / 10000) * 100;

    // competitor_03: (58 × 0.65 × 940 / 10000) × 100 = (37.7 × 0.094) × 100 ≈ 354.6
    const competitor_priority_score = (58 * 0.65 * 940 / 10000) * 100;

    // 【検証1】優先度スコアが正確に計算されている
    expect(result.prioritized_factors.length).toBe(4);

    // 【検証2】優先度が降順でソートされている（最も影響度が高いものが先頭）
    expect(result.prioritized_factors[0].factor_id).toBe('seasonal_04');
    expect(result.prioritized_factors[0].priority_score).toBeCloseTo(seasonal_priority_score, 1);

    expect(result.prioritized_factors[1].factor_id).toBe('weather_01');
    expect(result.prioritized_factors[1].priority_score).toBeCloseTo(weather_priority_score, 1);

    expect(result.prioritized_factors[2].factor_id).toBe('event_02');
    expect(result.prioritized_factors[2].priority_score).toBeCloseTo(event_priority_score, 1);

    expect(result.prioritized_factors[3].factor_id).toBe('competitor_03');
    expect(result.prioritized_factors[3].priority_score).toBeCloseTo(competitor_priority_score, 1);

    // 【検証3】優先度ランクが正確に付与されている
    // 最上位25%以上: 優先度ランク「高」、次の50%: 「中」、下位25%: 「低」
    expect(result.prioritized_factors[0].priority_rank).toBe('high');
    expect(result.prioritized_factors[1].priority_rank).toBe('high');
    expect(result.prioritized_factors[2].priority_rank).toBe('medium');
    expect(result.prioritized_factors[3].priority_rank).toBe('low');

    // 【検証4】複合的な優先順位計算が行われている（複数の主要因が統合されている）
    const combined_score_top_2 = (seasonal_priority_score + weather_priority_score) / 2;
    expect(result.top_2_combined_average_score).toBeCloseTo(combined_score_top_2, 1);

    // 【検証5】優先順位決定の根拠情報が明確に含まれている
    expect(result.prioritized_factors[0]).toHaveProperty('factor_name');
    expect(result.prioritized_factors[0]).toHaveProperty('impact_score');
    expect(result.prioritized_factors[0]).toHaveProperty('relevance_degree');
    expect(result.prioritized_factors[0]).toHaveProperty('affected_user_count');

    // 【検証6】根拠情報の詳細メッセージが生成されている
    expect(result.prioritized_factors[0].rationale).toContain('季節トレンド');
    expect(result.prioritized_factors[0].rationale).toContain('影響度スコア');

    // 【検証7】優先順位リスト全体が外部要因調査の対象選定に利用可能な構造になっている
    expect(result.prioritized_factors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          factor_id: expect.any(String),
          factor_name: expect.any(String),
          priority_score: expect.any(Number),
          priority_rank: expect.stringMatching(/^(high|medium|low)$/),
          rationale: expect.any(String),
        }),
      ]),
    );

    // 【検証8】優先順位が厳密に降順でソートされていることを確認
    for (let i = 0; i < result.prioritized_factors.length - 1; i++) {
      expect(result.prioritized_factors[i].priority_score).toBeGreaterThanOrEqual(
        result.prioritized_factors[i + 1].priority_score,
      );
    }

    // 【検証9】スコア計算過程が監査ログに記録可能な形式であることを確認
    expect(result.calculation_timestamp).toBeDefined();
    expect(result.total_factors_analyzed).toBe(4);
    expect(result.calculation_timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);

    // 【検証10】複数の主要因が存在する場合の統合優先度が正確であることを確認
    expect(result.prioritized_factors.map((f) => f.factor_id)).toEqual([
      'seasonal_04',
      'weather_01',
      'event_02',
      'competitor_03',
    ]);
  });
});