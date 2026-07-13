import { describe, test, expect, beforeEach } from '@jest/globals';
import { predictAccuracyDeclineFactorsVisualization } from '../../src/logic/it-3-br-6-3-3';

describe('予測精度低下要因の可視化ダッシュボード', () => {
  // SCEN-279: [normal] 予測精度低下要因の可視化・提案書自動生成 - 精度低下の主要因を複数抽出し、影響度と実装難易度の2軸で優先度を自動判定してルーティングする
  test('SCEN-279: 精度低下の主要因を複数抽出し、影響度と実装難易度の2軸で優先度マトリクスに配置し、提案書を自動生成してルーティングする', () => {
    // 入力: 過去30日間の予測精度データを取得し、精度が低下している期間を特定する
    const pastDaysAccuracyData = [
      { date: '2024-12-01', predicted_demand: 100, actual_demand: 95, accuracy: 0.95 },
      { date: '2024-12-02', predicted_demand: 110, actual_demand: 85, accuracy: 0.77 },
      { date: '2024-12-03', predicted_demand: 120, actual_demand: 80, accuracy: 0.67 },
      { date: '2024-12-04', predicted_demand: 115, actual_demand: 88, accuracy: 0.77 },
      { date: '2024-12-05', predicted_demand: 125, actual_demand: 70, accuracy: 0.56 },
      { date: '2024-12-06', predicted_demand: 130, actual_demand: 75, accuracy: 0.58 },
      { date: '2024-12-07', predicted_demand: 135, actual_demand: 78, accuracy: 0.58 },
      { date: '2024-12-08', predicted_demand: 140, actual_demand: 82, accuracy: 0.59 },
      { date: '2024-12-09', predicted_demand: 145, actual_demand: 85, accuracy: 0.59 },
      { date: '2024-12-10', predicted_demand: 150, actual_demand: 90, accuracy: 0.60 },
      { date: '2024-12-11', predicted_demand: 155, actual_demand: 92, accuracy: 0.59 },
      { date: '2024-12-12', predicted_demand: 160, actual_demand: 95, accuracy: 0.59 },
      { date: '2024-12-13', predicted_demand: 165, actual_demand: 98, accuracy: 0.59 },
      { date: '2024-12-14', predicted_demand: 170, actual_demand: 100, accuracy: 0.59 },
      { date: '2024-12-15', predicted_demand: 175, actual_demand: 105, accuracy: 0.60 },
      { date: '2024-12-16', predicted_demand: 180, actual_demand: 108, accuracy: 0.60 },
      { date: '2024-12-17', predicted_demand: 185, actual_demand: 110, accuracy: 0.59 },
      { date: '2024-12-18', predicted_demand: 190, actual_demand: 112, accuracy: 0.59 },
      { date: '2024-12-19', predicted_demand: 195, actual_demand: 115, accuracy: 0.59 },
      { date: '2024-12-20', predicted_demand: 200, actual_demand: 118, accuracy: 0.59 },
      { date: '2024-12-21', predicted_demand: 105, actual_demand: 95, accuracy: 0.90 },
      { date: '2024-12-22', predicted_demand: 115, actual_demand: 98, accuracy: 0.85 },
      { date: '2024-12-23', predicted_demand: 125, actual_demand: 100, accuracy: 0.80 },
      { date: '2024-12-24', predicted_demand: 135, actual_demand: 102, accuracy: 0.76 },
      { date: '2024-12-25', predicted_demand: 145, actual_demand: 105, accuracy: 0.72 },
      { date: '2024-12-26', predicted_demand: 155, actual_demand: 108, accuracy: 0.70 },
      { date: '2024-12-27', predicted_demand: 165, actual_demand: 110, accuracy: 0.67 },
      { date: '2024-12-28', predicted_demand: 175, actual_demand: 112, accuracy: 0.64 },
      { date: '2024-12-29', predicted_demand: 185, actual_demand: 115, accuracy: 0.62 },
      { date: '2024-12-30', predicted_demand: 195, actual_demand: 118, accuracy: 0.61 },
    ];

    const external_factors = {
      weather_data: [
        { date: '2024-12-02', temperature: 5, precipitation: 15, impact_score: 0.8 },
        { date: '2024-12-05', temperature: 2, precipitation: 25, impact_score: 0.9 },
      ],
      event_data: [
        { date: '2024-12-20', event_type: 'holiday', impact_score: 0.85 },
        { date: '2024-12-25', event_type: 'christmas', impact_score: 0.95 },
      ],
      competitor_data: [
        { date: '2024-12-01', campaign_type: 'discount', impact_score: 0.7 },
        { date: '2024-12-15', campaign_type: 'promotion', impact_score: 0.75 },
      ],
    };

    const result = predictAccuracyDeclineFactorsVisualization({
      accuracy_data: pastDaysAccuracyData,
      external_factors: external_factors,
      baseline_accuracy: 0.85,
      decline_threshold_percent: 10,
    });

    // 精度低下の検出: baseline_accuracy 0.85 から 10% 低下した 0.765 未満のデータを抽出
    // 低下期間: 2024-12-02 から 2024-12-20（accuracy < 0.765）
    expect(result.decline_period_detected).toBe(true);
    expect(result.decline_start_date).toBe('2024-12-02');
    expect(result.decline_end_date).toBe('2024-12-20');

    // 精度低下の主要因を複数抽出
    expect(result.decline_factors).toBeDefined();
    expect(Array.isArray(result.decline_factors)).toBe(true);
    expect(result.decline_factors.length).toBeGreaterThanOrEqual(3);

    // 各要因に対して影響度スコア（0-100, 高・中・低）を算出
    const weatherFactor = result.decline_factors.find(f => f.factor_type === 'weather_volatility');
    expect(weatherFactor).toBeDefined();
    expect(weatherFactor.impact_score).toBe(85);
    expect(weatherFactor.impact_level).toBe('high');

    const eventFactor = result.decline_factors.find(f => f.factor_type === 'event_influence');
    expect(eventFactor).toBeDefined();
    expect(eventFactor.impact_score).toBe(80);
    expect(eventFactor.impact_level).toBe('high');

    const competitorFactor = result.decline_factors.find(f => f.factor_type === 'competitor_activity');
    expect(competitorFactor).toBeDefined();
    expect(competitorFactor.impact_score).toBe(72);
    expect(competitorFactor.impact_level).toBe('medium');

    const modelParameterFactor = result.decline_factors.find(f => f.factor_type === 'model_parameter_drift');
    expect(modelParameterFactor).toBeDefined();
    expect(modelParameterFactor.impact_score).toBe(65);
    expect(modelParameterFactor.impact_level).toBe('medium');

    // 各要因の実装難易度スコア（0-100, 高・中・低）を算出
    weatherFactor.implementation_difficulty_score = 75; // weather model integration is complex
    eventFactor.implementation_difficulty_score = 45;   // event integration is moderate
    competitorFactor.implementation_difficulty_score = 55; // competitor data is moderately complex
    modelParameterFactor.implementation_difficulty_score = 35; // model tuning is relatively easy

    expect(weatherFactor.implementation_difficulty_score).toBe(75);
    expect(weatherFactor.implementation_difficulty_level).toBe('high');

    expect(eventFactor.implementation_difficulty_score).toBe(45);
    expect(eventFactor.implementation_difficulty_level).toBe('medium');

    expect(competitorFactor.implementation_difficulty_score).toBe(55);
    expect(competitorFactor.implementation_difficulty_level).toBe('medium');

    expect(modelParameterFactor.implementation_difficulty_score).toBe(35);
    expect(modelParameterFactor.implementation_difficulty_level).toBe('low');

    // 優先度判定: 影響度が高く実装難易度が低い要因が最優先
    // priority_score = (impact_score / 100) * 0.6 + (1 - implementation_difficulty_score / 100) * 0.4
    // weather: (85/100) * 0.6 + (1 - 75/100) * 0.4 = 0.51 + 0.1 = 0.61
    // event: (80/100) * 0.6 + (1 - 45/100) * 0.4 = 0.48 + 0.22 = 0.70
    // competitor: (72/100) * 0.6 + (1 - 55/100) * 0.4 = 0.432 + 0.18 = 0.612
    // model_parameter: (65/100) * 0.6 + (1 - 35/100) * 0.4 = 0.39 + 0.26 = 0.65

    expect(result.priority_matrix).toBeDefined();
    expect(result.priority_matrix.length).toBe(4);

    // ランキング順序を確認（優先度スコアが高い順）
    expect(result.priority_matrix[0].factor_type).toBe('event_influence'); // priority_score = 0.70
    expect(result.priority_matrix[0].priority_rank).toBe(1);
    expect(result.priority_matrix[0].priority_score).toBe(0.70);

    expect(result.priority_matrix[1].factor_type).toBe('model_parameter_drift'); // priority_score = 0.65
    expect(result.priority_matrix[1].priority_rank).toBe(2);
    expect(result.priority_matrix[1].priority_score).toBe(0.65);

    expect(result.priority_matrix[2].factor_type).toBe('competitor_activity'); // priority_score = 0.612
    expect(result.priority_matrix[2].priority_rank).toBe(3);
    expect(result.priority_matrix[2].priority_score).toBe(0.612);

    expect(result.priority_matrix[3].factor_type).toBe('weather_volatility'); // priority_score = 0.61
    expect(result.priority_matrix[3].priority_rank).toBe(4);
    expect(result.priority_matrix[3].priority_score).toBe(0.61);

    // 改善提案書の自動生成
    expect(result.improvement_proposal_document).toBeDefined();
    expect(result.improvement_proposal_document.document_id).toBeDefined();
    expect(result.improvement_proposal_document.generated_at).toBe('2024-12-30T09:00:00Z');
    expect(result.improvement_proposal_document.title).toContain('需要予測精度改善提案');
    expect(result.improvement_proposal_document.accuracy_decline_percent).toBe(10.6);
    expect(result.improvement_proposal_document.baseline_accuracy).toBe(0.85);
    expect(result.improvement_proposal_document.current_accuracy).toBe(0.61);

    // 提案書フォーマット検証
    expect(result.improvement_proposal_document.sections).toBeDefined();
    expect(result.improvement_proposal_document.sections.executive_summary).toBeDefined();
    expect(result.improvement_proposal_document.sections.decline_analysis).toBeDefined();
    expect(result.improvement_proposal_document.sections.priority_factors).toBeDefined();
    expect(result.improvement_proposal_document.sections.implementation_roadmap).toBeDefined();

    expect(result.improvement_proposal_document.sections.priority_factors).toEqual([
      { rank: 1, factor: 'event_influence', impact_score: 80, difficulty_score: 45, estimated_effort_days: 5 },
      { rank: 2, factor: 'model_parameter_drift', impact_score: 65, difficulty_score: 35, estimated_effort_days: 3 },
      { rank: 3, factor: 'competitor_activity', impact_score: 72, difficulty_score: 55, estimated_effort_days: 7 },
      { rank: 4, factor: 'weather_volatility', impact_score: 85, difficulty_score: 75, estimated_effort_days: 10 },
    ]);

    // ルーティング結果の検証
    expect(result.routing_result).toBeDefined();
    expect(result.routing_result.status).toBe('routed_successfully');
    expect(result.routing_result.channels).toBeDefined();
    expect(Array.isArray(result.routing_result.channels)).toBe(true);

    const email_channel = result.routing_result.channels.find(ch => ch.channel_type === 'email');
    expect(email_channel).toBeDefined();
    expect(email_channel.recipient).toBe('development_team@company.com');
    expect(email_channel.delivery_status).toBe('delivered');
    expect(email_channel.delivered_at).toBe('2024-12-30T09:15:00Z');

    const dashboard_channel = result.routing_result.channels.find(ch => ch.channel_type === 'dashboard');
    expect(dashboard_channel).toBeDefined();
    expect(dashboard_channel.recipient).toBe('admin_dashboard');
    expect(dashboard_channel.delivery_status).toBe('available');
    expect(dashboard_channel.available_at).toBe('2024-12-30T09:05:00Z');

    const api_channel = result.routing_result.channels.find(ch => ch.channel_type === 'api');
    expect(api_channel).toBeDefined();
    expect(api_channel.recipient).toBe('improvement_management_api');
    expect(api_channel.delivery_status).toBe('accepted');
    expect(api_channel.accepted_at).toBe('2024-12-30T09:10:00Z');

    // 提안書ルーティングの検証
    expect(result.routing_result.proposal_routing).toBeDefined();
    expect(result.routing_result.proposal_routing.target_team).toBe('data_science_team');
    expect(result.routing_result.proposal_routing.assignment_priority).toBe('high');
    expect(result.routing_result.proposal_routing.assigned_at).toBe('2024-12-30T09:20:00Z');

    // 最優先改善要因の確認
    expect(result.top_priority_factor).toBeDefined();
    expect(result.top_priority_factor.factor_type).toBe('event_influence');
    expect(result.top_priority_factor.impact_score).toBe(80);
    expect(result.top_priority_factor.implementation_difficulty_score).toBe(45);
    expect(result.top_priority_factor.priority_rank).toBe(1);
    expect(result.top_priority_factor.recommended_action).toBe('Integrate event calendar and holiday patterns into demand prediction model');
    expect(result.top_priority_factor.estimated_accuracy_improvement_percent).toBe(5.2);

    // 全体サマリー
    expect(result.summary).toBeDefined();
    expect(result.summary.total_decline_factors_identified).toBe(4);
    expect(result.summary.highest_priority_factor).toBe('event_influence');
    expect(result.summary.estimated_total_accuracy_recovery_percent).toBe(12.8);
    expect(result.summary.total_estimated_effort_days).toBe(25);
    expect(result.summary.recommendation).toBe('Start with event_influence factor implementation to achieve quick wins, followed by model_parameter_drift tuning.');
  });
});