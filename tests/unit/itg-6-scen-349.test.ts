import { evaluateAnalysisResultTrustworthy } from '../../src/logic/it-8-1-1-1';

describe('ユーザーインタビュー記録と利用ログから抽出した分析結果の信頼度判定機能', () => {
  // SCEN-349: [edge] 分析結果信頼度判定機能 - 信頼度スコアが閾値ちょうどのとき、補完必要判定の境界線が正確に動作する
  test('should correctly classify analysis results at trust score threshold boundary', () => {
    const TRUST_THRESHOLD = 0.7;

    // Case 1: 信頼度スコア = 閾値ちょうど (0.7)
    const analysisResultAtThreshold = {
      trust_score: 0.7,
      interview_data_count: 15,
      log_data_count: 450,
      pain_factors: [
        {
          factor_id: 'pf_001',
          factor_name: '食材制限',
          occurrence_frequency: 12,
          impact_score: 0.85,
        },
      ],
      analysis_timestamp: '2025-01-15T09:00:00Z',
    };

    const resultAtThreshold = evaluateAnalysisResultTrustworthy(analysisResultAtThreshold);

    expect(resultAtThreshold).toEqual({
      is_trustworthy: true,
      trust_score: 0.7,
      requires_supplementary_data: false,
      supplementary_data_types: [],
      supplementary_method: null,
      recommendation: '補完不要。現在のデータで分析を進めることができます。',
    });

    // Case 2: 信頼度スコア < 閾値 (0.6999999)
    const analysisResultBelowThreshold = {
      trust_score: 0.6999999,
      interview_data_count: 14,
      log_data_count: 420,
      pain_factors: [
        {
          factor_id: 'pf_001',
          factor_name: '食材制限',
          occurrence_frequency: 10,
          impact_score: 0.82,
        },
      ],
      analysis_timestamp: '2025-01-15T08:30:00Z',
    };

    const resultBelowThreshold = evaluateAnalysisResultTrustworthy(analysisResultBelowThreshold);

    expect(resultBelowThreshold).toEqual({
      is_trustworthy: false,
      trust_score: 0.6999999,
      requires_supplementary_data: true,
      supplementary_data_types: ['interview_records', 'app_usage_logs'],
      supplementary_method: 'インタビュー対象者を最低5名追加、アプリ内ログを7日分追加収集',
      recommendation: '補完が必要です。信頼度向上のため、インタビュー記録とアプリ内ログの追加収集を実施してください。',
    });

    // Case 3: 信頼度スコア > 閾値 (0.7000001)
    const analysisResultAboveThreshold = {
      trust_score: 0.7000001,
      interview_data_count: 16,
      log_data_count: 480,
      pain_factors: [
        {
          factor_id: 'pf_001',
          factor_name: '食材制限',
          occurrence_frequency: 13,
          impact_score: 0.87,
        },
      ],
      analysis_timestamp: '2025-01-15T09:15:00Z',
    };

    const resultAboveThreshold = evaluateAnalysisResultTrustworthy(analysisResultAboveThreshold);

    expect(resultAboveThreshold).toEqual({
      is_trustworthy: true,
      trust_score: 0.7000001,
      requires_supplementary_data: false,
      supplementary_data_types: [],
      supplementary_method: null,
      recommendation: '補完不要。現在のデータで分析を進めることができます。',
    });

    // 3つの結果を比較し、境界線での分類が正確であることを検証
    expect(resultAtThreshold.is_trustworthy).toBe(true);
    expect(resultAtThreshold.requires_supplementary_data).toBe(false);

    expect(resultBelowThreshold.is_trustworthy).toBe(false);
    expect(resultBelowThreshold.requires_supplementary_data).toBe(true);

    expect(resultAboveThreshold.is_trustworthy).toBe(true);
    expect(resultAboveThreshold.requires_supplementary_data).toBe(false);

    // 境界値での判定ロジック検証: 閾値ちょうど（0.7）は補完不要
    expect(resultAtThreshold.trust_score).toBe(0.7);
    expect(resultAtThreshold.is_trustworthy).toBe(resultAboveThreshold.is_trustworthy);

    // 閾値未満（0.6999999）は補完必要
    expect(resultBelowThreshold.trust_score).toBeLessThan(TRUST_THRESHOLD);
    expect(resultBelowThreshold.requires_supplementary_data).toBe(true);

    // 補完必要なケースでのデータタイプ指定
    expect(resultBelowThreshold.supplementary_data_types).toContain('interview_records');
    expect(resultBelowThreshold.supplementary_data_types).toContain('app_usage_logs');
    expect(resultBelowThreshold.supplementary_data_types.length).toBe(2);
  });
});