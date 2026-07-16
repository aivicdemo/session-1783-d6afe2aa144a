import { analyzeUserPainWithIntegratedData } from '../../src/logic/it-1-br-8-2-2-1';

describe('定性定量データ統合分析・ペイン優先度可視化機能', () => {
  // SCEN-315: [normal] 定性定量データ統合分析・ペイン優先度可視化機能 - インタビュー記録と利用ログが統合され、専業主夫層の具体的なペイン要因が優先度付けされて可視化される
  test('インタビュー記録と利用ログが統合され、ペイン要因が優先度付けして可視化される', () => {
    const interviewRecords = [
      {
        interview_id: 'INT-001',
        user_segment: '専業主夫',
        pain_category: '財務管理',
        content: '食費管理が手間で、毎月予算を超えてしまう',
        interview_date: '2024-01-10T10:00:00Z',
      },
      {
        interview_id: 'INT-002',
        user_segment: '専業主夫',
        pain_category: '育児との両立',
        content: '子どもの食物アレルギーに対応した献立作成に時間がかかる',
        interview_date: '2024-01-10T11:30:00Z',
      },
      {
        interview_id: 'INT-003',
        user_segment: '専業主夫',
        pain_category: '財務管理',
        content: '季節ごとの食材価格変動に対応できていない',
        interview_date: '2024-01-10T13:00:00Z',
      },
      {
        interview_id: 'INT-004',
        user_segment: '専業主夫',
        pain_category: '社会的孤立',
        content: '献立作成について相談できるコミュニティがない',
        interview_date: '2024-01-10T14:30:00Z',
      },
    ];

    const usageLogRecords = [
      {
        log_id: 'LOG-001',
        user_id: 'USER-101',
        user_segment: '専業主夫',
        feature_name: '食費管理',
        action_type: 'view',
        timestamp: '2024-01-15T09:00:00Z',
        session_duration_seconds: 180,
      },
      {
        log_id: 'LOG-002',
        user_id: 'USER-101',
        user_segment: '専業主夫',
        feature_name: '食費管理',
        action_type: 'abandon',
        timestamp: '2024-01-15T09:03:00Z',
        session_duration_seconds: 180,
      },
      {
        log_id: 'LOG-003',
        user_id: 'USER-102',
        user_segment: '専業主夫',
        feature_name: '食物アレルギー設定',
        action_type: 'view',
        timestamp: '2024-01-15T10:00:00Z',
        session_duration_seconds: 420,
      },
      {
        log_id: 'LOG-004',
        user_id: 'USER-102',
        user_segment: '専業主夫',
        feature_name: '食物アレルギー設定',
        action_type: 'complete',
        timestamp: '2024-01-15T10:07:00Z',
        session_duration_seconds: 420,
      },
      {
        log_id: 'LOG-005',
        user_id: 'USER-103',
        user_segment: '専業主夫',
        feature_name: '食費管理',
        action_type: 'view',
        timestamp: '2024-01-15T11:00:00Z',
        session_duration_seconds: 150,
      },
      {
        log_id: 'LOG-006',
        user_id: 'USER-103',
        user_segment: '専業主夫',
        feature_name: '食費管理',
        action_type: 'abandon',
        timestamp: '2024-01-15T11:02:30Z',
        session_duration_seconds: 150,
      },
    ];

    const result = analyzeUserPainWithIntegratedData({
      user_segment: '専業主夫',
      interview_records: interviewRecords,
      usage_log_records: usageLogRecords,
      analysis_period_start: '2024-01-01T00:00:00Z',
      analysis_period_end: '2024-01-31T23:59:59Z',
      min_interview_sample_size: 3,
      min_log_sample_size: 2,
    });

    expect(result).toBeDefined();
    expect(result.status).toBe('success');
    expect(result.user_segment).toBe('専業主夫');
    expect(result.analysis_timestamp).toBeDefined();

    expect(Array.isArray(result.integrated_pain_factors)).toBe(true);
    expect(result.integrated_pain_factors.length).toBeGreaterThan(0);

    const painFactorsByPriority = result.integrated_pain_factors.sort(
      (a, b) => b.priority_score - a.priority_score,
    );

    expect(painFactorsByPriority[0].pain_category).toBe('財務管理');
    expect(painFactorsByPriority[0].priority_score).toBe(72);
    expect(painFactorsByPriority[0].interview_mention_count).toBe(2);
    expect(painFactorsByPriority[0].log_occurrence_frequency).toBe(2);
    expect(painFactorsByPriority[0].combined_score_formula).toBe(
      'interview_weight * interview_mention_count + log_weight * log_occurrence_frequency',
    );
    expect(painFactorsByPriority[0].combined_score_calculation).toBe(
      '0.6 * 2 + 0.4 * 2 = 1.2 + 0.8 = 2.0, normalized to 72 (out of 100)',
    );

    expect(painFactorsByPriority[1].pain_category).toBe('育児との両立');
    expect(painFactorsByPriority[1].priority_score).toBe(54);
    expect(painFactorsByPriority[1].interview_mention_count).toBe(1);
    expect(painFactorsByPriority[1].log_occurrence_frequency).toBe(1);

    expect(painFactorsByPriority[2].pain_category).toBe('社会的孤立');
    expect(painFactorsByPriority[2].priority_score).toBe(36);
    expect(painFactorsByPriority[2].interview_mention_count).toBe(1);
    expect(painFactorsByPriority[2].log_occurrence_frequency).toBe(0);

    expect(result.visualization_data).toBeDefined();
    expect(result.visualization_data.heatmap_data).toBeDefined();
    expect(result.visualization_data.bar_chart_data).toBeDefined();

    expect(Array.isArray(result.visualization_data.bar_chart_data)).toBe(true);
    expect(result.visualization_data.bar_chart_data.length).toBe(3);
    expect(result.visualization_data.bar_chart_data[0].label).toBe('財務管理');
    expect(result.visualization_data.bar_chart_data[0].value).toBe(72);
    expect(result.visualization_data.bar_chart_data[1].label).toBe('育児との両立');
    expect(result.visualization_data.bar_chart_data[1].value).toBe(54);
    expect(result.visualization_data.bar_chart_data[2].label).toBe('社会的孤立');
    expect(result.visualization_data.bar_chart_data[2].value).toBe(36);

    expect(result.data_quality_validation).toBeDefined();
    expect(result.data_quality_validation.interview_records_count).toBe(4);
    expect(result.data_quality_validation.interview_records_count).toBeGreaterThanOrEqual(3);
    expect(result.data_quality_validation.log_records_count).toBe(6);
    expect(result.data_quality_validation.log_records_count).toBeGreaterThanOrEqual(2);
    expect(result.data_quality_validation.anomaly_detected).toBe(false);
    expect(result.data_quality_validation.data_integrity_score).toBe(100);

    expect(result.evidence_summary).toBeDefined();
    expect(result.evidence_summary.key_insights).toBeDefined();
    expect(Array.isArray(result.evidence_summary.key_insights)).toBe(true);
    expect(result.evidence_summary.key_insights.length).toBeGreaterThan(0);
    expect(result.evidence_summary.key_insights[0]).toContain('財務管理');

    expect(result.derived_differentiation_points).toBeDefined();
    expect(Array.isArray(result.derived_differentiation_points)).toBe(true);
  });
});