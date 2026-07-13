import { identifyDemandForecastAccuracyDecline } from '../../src/logic/it-1-br-6-2-1';

describe('需要予測精度検証ダッシュボード：予測値と実績値の照合・乖離分析機能', () => {
  // SCEN-263: [normal] 需要予測精度低下検出・主要因抽出 - 前月比10%以上の精度低下を検出し、複数の仮説要因を優先度付けして抽出する
  test('should detect demand forecast accuracy decline >10% and extract prioritized root cause hypotheses', () => {
    // セットアップ: 3ヶ月分の過去データと当月データを準備
    // 先月の精度: 85%
    // 当月の精度: 75% (先月比 -10%で閾値を超える)

    const input = {
      previous_month_accuracy: 85,
      current_month_accuracy: 75,
      forecast_data: [
        {
          forecast_id: 'ForecastID_202401_001',
          product_code: 'P001',
          forecast_quantity: 100,
          actual_quantity: 90,
          forecast_date: '2024-01-15',
        },
        {
          forecast_id: 'ForecastID_202401_002',
          product_code: 'P002',
          forecast_quantity: 50,
          actual_quantity: 35,
          forecast_date: '2024-01-15',
        },
        {
          forecast_id: 'ForecastID_202402_001',
          product_code: 'P001',
          forecast_quantity: 120,
          actual_quantity: 80,
          forecast_date: '2024-02-15',
        },
        {
          forecast_id: 'ForecastID_202402_002',
          product_code: 'P002',
          forecast_quantity: 60,
          actual_quantity: 30,
          forecast_date: '2024-02-15',
        },
      ],
      external_factors: [
        {
          factor_type: 'weather_pattern',
          impact_level: 'high',
          confidence_score: 92,
        },
        {
          factor_type: 'demand_pattern_shift',
          impact_level: 'high',
          confidence_score: 88,
        },
        {
          factor_type: 'competitor_campaign',
          impact_level: 'medium',
          confidence_score: 75,
        },
        {
          factor_type: 'data_quality_issue',
          impact_level: 'medium',
          confidence_score: 70,
        },
        {
          factor_type: 'model_drift',
          impact_level: 'medium',
          confidence_score: 78,
        },
      ],
    };

    const result = identifyDemandForecastAccuracyDecline(input);

    // 精度低下検出の検証
    expect(result.accuracy_decline_detected).toBe(true);
    expect(result.accuracy_decline_percentage).toBe(10);
    expect(result.decline_threshold_exceeded).toBe(true);

    // 複数仮説要因の抽出検証（最低3つ以上）
    expect(result.root_cause_hypotheses).toBeDefined();
    expect(result.root_cause_hypotheses.length).toBeGreaterThanOrEqual(3);

    // 優先度付けの検証（影響度スコアで降順ソート）
    expect(result.root_cause_hypotheses[0].priority).toBe(1);
    expect(result.root_cause_hypotheses[1].priority).toBe(2);
    expect(result.root_cause_hypotheses[2].priority).toBe(3);

    // 最初の要因が最も影響度が高いことを確認
    expect(result.root_cause_hypotheses[0].impact_score).toBeGreaterThanOrEqual(
      result.root_cause_hypotheses[1].impact_score,
    );
    expect(result.root_cause_hypotheses[1].impact_score).toBeGreaterThanOrEqual(
      result.root_cause_hypotheses[2].impact_score,
    );

    // 各要因に根拠メトリクスが含まれていることを確認
    result.root_cause_hypotheses.forEach((hypothesis) => {
      expect(hypothesis.factor_type).toBeDefined();
      expect(typeof hypothesis.factor_type).toBe('string');

      expect(hypothesis.impact_score).toBeDefined();
      expect(typeof hypothesis.impact_score).toBe('number');
      expect(hypothesis.impact_score).toBeGreaterThan(0);
      expect(hypothesis.impact_score).toBeLessThanOrEqual(100);

      expect(hypothesis.confidence_score).toBeDefined();
      expect(typeof hypothesis.confidence_score).toBe('number');
      expect(hypothesis.confidence_score).toBeGreaterThan(0);
      expect(hypothesis.confidence_score).toBeLessThanOrEqual(100);

      expect(hypothesis.supporting_metrics).toBeDefined();
      expect(Array.isArray(hypothesis.supporting_metrics)).toBe(true);
      expect(hypothesis.supporting_metrics.length).toBeGreaterThan(0);

      hypothesis.supporting_metrics.forEach((metric) => {
        expect(metric.metric_name).toBeDefined();
        expect(typeof metric.metric_name).toBe('string');
        expect(metric.metric_value).toBeDefined();
        expect(typeof metric.metric_value).toBe('number');
      });

      expect(hypothesis.description).toBeDefined();
      expect(typeof hypothesis.description).toBe('string');
      expect(hypothesis.description.length).toBeGreaterThan(0);
    });

    // 最も影響度の高い要因が最初に返却されていることを検証
    const top_hypothesis = result.root_cause_hypotheses[0];
    expect(top_hypothesis.priority).toBe(1);
    expect(top_hypothesis.factor_type).toMatch(
      /weather_pattern|demand_pattern_shift|competitor_campaign|data_quality_issue|model_drift/,
    );

    // 返却されたリストが降順であることを再確認
    for (let i = 0; i < result.root_cause_hypotheses.length - 1; i++) {
      expect(result.root_cause_hypotheses[i].impact_score).toBeGreaterThanOrEqual(
        result.root_cause_hypotheses[i + 1].impact_score,
      );
    }

    // 結果全体の構造を検証
    expect(result.accuracy_decline_detected).toBe(true);
    expect(result.previous_month_accuracy).toBe(85);
    expect(result.current_month_accuracy).toBe(75);
    expect(result.analysis_timestamp).toBeDefined();
    expect(typeof result.analysis_timestamp).toBe('string');
  });
});