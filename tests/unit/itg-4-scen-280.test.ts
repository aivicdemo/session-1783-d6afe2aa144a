import { generatePrecisionDeclinePriorityMatrix } from '../../src/logic/it-3-br-6-3-3';

describe('予測精度低下要因の可視化ダッシュボード', () => {
  // SCEN-280: [normal] 予測精度低下要因の可視化・提案書自動生成 - 複数の精度低下要因を優先度に応じてランク付けし、改善提案書に自動記載される
  test('should generate improvement proposal document with ranked decline factors and mitigation strategies', () => {
    // 過去3ヶ月間の予測データと実績データを読み込む
    const pastThreeMonthsData = {
      forecast_data: [
        {
          product_id: 'PROD_001',
          month: '2024-01',
          forecast_demand: 1000,
          actual_demand: 950,
          forecast_accuracy: 0.95,
        },
        {
          product_id: 'PROD_001',
          month: '2024-02',
          forecast_demand: 1100,
          actual_demand: 900,
          forecast_accuracy: 0.82,
        },
        {
          product_id: 'PROD_001',
          month: '2024-03',
          forecast_demand: 1050,
          actual_demand: 750,
          forecast_accuracy: 0.71,
        },
      ],
      external_factors: [
        {
          factor_type: 'weather',
          month: '2024-02',
          impact_score: 0.25,
          confidence: 85,
        },
        {
          factor_type: 'seasonality',
          month: '2024-03',
          impact_score: 0.35,
          confidence: 90,
        },
        {
          factor_type: 'inventory_variance',
          month: '2024-03',
          impact_score: 0.20,
          confidence: 75,
        },
        {
          factor_type: 'demand_pattern_change',
          month: '2024-02',
          impact_score: 0.15,
          confidence: 70,
        },
      ],
    };

    // 優先度スコア計算ロジック:
    // 優先度スコア = (精度低下率 × 影響度) × 信頼度スコア
    // 月ごと精度低下率: (前月精度 - 当月精度) / 前月精度
    // 2024-02: (0.95 - 0.82) / 0.95 = 0.137 (13.7%)
    // 2024-03: (0.82 - 0.71) / 0.82 = 0.134 (13.4%)
    //
    // 要因別優先度スコア:
    // weather (2024-02): 0.137 × 0.25 × 0.85 = 0.0291
    // demand_pattern_change (2024-02): 0.137 × 0.15 × 0.70 = 0.0144
    // seasonality (2024-03): 0.134 × 0.35 × 0.90 = 0.0423
    // inventory_variance (2024-03): 0.134 × 0.20 × 0.75 = 0.0201
    //
    // ランク順: seasonality (0.0423) > weather (0.0291) > inventory_variance (0.0201) > demand_pattern_change (0.0144)

    const result = generatePrecisionDeclinePriorityMatrix({
      forecast_and_actual_data: pastThreeMonthsData.forecast_data,
      external_factor_data: pastThreeMonthsData.external_factors,
      impact_threshold: 0.10,
      confidence_threshold: 65,
    });

    // 提案書が生成されていることを検証
    expect(result).toHaveProperty('proposal_document_id');
    expect(result.proposal_document_id).toMatch(/^PROP_/);

    // 複数の精度低下要因が抽出されていることを検証
    expect(result).toHaveProperty('extracted_decline_factors');
    expect(result.extracted_decline_factors).toHaveLength(4);

    // 要因が優先度スコアの高い順にランク付けされていることを検証
    const factors = result.ranked_decline_factors;
    expect(factors).toHaveLength(4);
    expect(factors[0]).toEqual({
      rank: 1,
      factor_type: 'seasonality',
      priority_score: 0.0423,
      impact_on_accuracy: 0.35,
      confidence: 0.90,
      affected_period: '2024-03',
      expected_accuracy_improvement_rate: 0.035,
      mitigation_strategy: 'Incorporate seasonal demand patterns into the forecasting model using historical seasonal indices',
      implementation_difficulty: 'medium',
      estimated_effort_hours: 40,
    });

    expect(factors[1]).toEqual({
      rank: 2,
      factor_type: 'weather',
      priority_score: 0.0291,
      impact_on_accuracy: 0.25,
      confidence: 0.85,
      affected_period: '2024-02',
      expected_accuracy_improvement_rate: 0.026,
      mitigation_strategy: 'Add weather-based demand correlation variables to the forecast model',
      implementation_difficulty: 'medium',
      estimated_effort_hours: 32,
    });

    expect(factors[2]).toEqual({
      rank: 3,
      factor_type: 'inventory_variance',
      priority_score: 0.0201,
      impact_on_accuracy: 0.20,
      confidence: 0.75,
      affected_period: '2024-03',
      expected_accuracy_improvement_rate: 0.018,
      mitigation_strategy: 'Calibrate inventory adjustment factors in the forecasting algorithm',
      implementation_difficulty: 'low',
      estimated_effort_hours: 16,
    });

    expect(factors[3]).toEqual({
      rank: 4,
      factor_type: 'demand_pattern_change',
      priority_score: 0.0144,
      impact_on_accuracy: 0.15,
      confidence: 0.70,
      affected_period: '2024-02',
      expected_accuracy_improvement_rate: 0.012,
      mitigation_strategy: 'Implement change point detection to identify and adapt to new demand patterns',
      implementation_difficulty: 'high',
      estimated_effort_hours: 60,
    });

    // 各要因に具体的な改善施策が記載されていることを検証
    factors.forEach((factor) => {
      expect(factor).toHaveProperty('mitigation_strategy');
      expect(factor.mitigation_strategy).toBeTruthy();
      expect(factor.mitigation_strategy.length).toBeGreaterThan(10);
    });

    // 提案書の総要因数が 4 であることを検証
    expect(result.total_decline_factors_identified).toBe(4);

    // 提案書が生成された日時が有効なISO形式であることを検証
    expect(result).toHaveProperty('generated_at');
    expect(result.generated_at).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    );

    // 提案書の適用対象製品が PROD_001 であることを検証
    expect(result.target_product_id).toBe('PROD_001');

    // 全ランク付けされた要因の優先度スコアが降順であることを検証
    for (let i = 0; i < factors.length - 1; i++) {
      expect(factors[i].priority_score).toBeGreaterThanOrEqual(
        factors[i + 1].priority_score
      );
    }

    // 期待精度向上率の合計が妥当範囲内であることを検証（各要因の施策を全て実装した場合の合計向上率）
    const total_expected_improvement = factors.reduce(
      (sum, f) => sum + f.expected_accuracy_improvement_rate,
      0
    );
    expect(total_expected_improvement).toBeCloseTo(0.091, 2);
  });
});