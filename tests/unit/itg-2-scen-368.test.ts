import { calculatePredictionAccuracy, generateImprovementProposals } from '../../src/logic/it-1-br-2-1-1-1';

describe('需要予測精度の乖離分析と自動改善提案生成', () => {
  // SCEN-368
  test('予測精度が閾値を下回った場合に自動改善提案が生成される', () => {
    // Setup: 予測値と実績値のデータ
    const predicted_demand = [100, 95, 110, 105, 98, 102, 108];
    const actual_demand = [95, 88, 105, 98, 92, 110, 95];
    const accuracy_threshold = 80;
    
    // 予測精度の計算: 各要素の誤差率を算出して平均
    // 誤差率 = |予測値 - 実績値| / 実績値 * 100
    // 1: |100-95|/95*100 = 5.26
    // 2: |95-88|/88*100 = 7.95
    // 3: |110-105|/105*100 = 4.76
    // 4: |105-98|/98*100 = 7.14
    // 5: |98-92|/92*100 = 6.52
    // 6: |102-110|/110*100 = 7.27
    // 7: |108-95|/95*100 = 13.68
    // 平均誤差率 = (5.26+7.95+4.76+7.14+6.52+7.27+13.68)/7 = 8.80
    // 精度 = 100 - 8.80 = 91.20 (但し、以下の分析では異なるシナリオ)
    
    // Scenario: 精度が閾値以下のケース
    const predicted_demand_low_accuracy = [100, 80, 120, 90, 85, 110, 95];
    const actual_demand_low_accuracy = [50, 40, 60, 45, 42, 55, 48];
    // 誤差率計算:
    // 1: |100-50|/50*100 = 100
    // 2: |80-40|/40*100 = 100
    // 3: |120-60|/60*100 = 100
    // 4: |90-45|/45*100 = 100
    // 5: |85-42|/42*100 = 102.38
    // 6: |110-55|/55*100 = 100
    // 7: |95-48|/48*100 = 97.92
    // 平均誤差率 = (100+100+100+100+102.38+100+97.92)/7 = 99.91
    // 精度 = 100 - 99.91 = 0.09 (<<< 80% 閾値)
    
    const accuracy = calculatePredictionAccuracy(
      predicted_demand_low_accuracy,
      actual_demand_low_accuracy
    );
    
    expect(accuracy).toBeLessThan(accuracy_threshold);
    expect(accuracy).toBeCloseTo(0.09, 2);
    
    // 改善提案の生成
    const input_for_proposals = {
      predicted_values: predicted_demand_low_accuracy,
      actual_values: actual_demand_low_accuracy,
      current_accuracy: accuracy,
      threshold: accuracy_threshold,
      analysis_period: '2024-01-01_2024-01-07',
      external_factors: {
        weather_correlation: -0.15,
        event_impact: 0.05,
        competitor_action: 0.12
      }
    };
    
    const proposals = generateImprovementProposals(input_for_proposals);
    
    // 提案が生成されていることを確認
    expect(Array.isArray(proposals)).toBe(true);
    expect(proposals.length).toBeGreaterThan(0);
    
    // 提案の構造と内容を検証
    proposals.forEach((proposal: any) => {
      // 提案IDの存在と形式
      expect(proposal.proposal_id).toBeDefined();
      expect(typeof proposal.proposal_id).toBe('string');
      expect(proposal.proposal_id).toMatch(/^PROP_/);
      
      // 提案タイプ
      expect(proposal.proposal_type).toBeDefined();
      expect(['model_parameter', 'feature_engineering', 'data_quality', 'external_integration']).toContain(proposal.proposal_type);
      
      // 優先度スコア（0-100）
      expect(proposal.priority_score).toBeDefined();
      expect(typeof proposal.priority_score).toBe('number');
      expect(proposal.priority_score).toBeGreaterThanOrEqual(0);
      expect(proposal.priority_score).toBeLessThanOrEqual(100);
      
      // 根拠データ
      expect(proposal.rationale).toBeDefined();
      expect(typeof proposal.rationale).toBe('string');
      expect(proposal.rationale.length).toBeGreaterThan(0);
      
      // 推奨アクション
      expect(proposal.recommended_action).toBeDefined();
      expect(typeof proposal.recommended_action).toBe('string');
      expect(proposal.recommended_action.length).toBeGreaterThan(0);
      
      // タイムスタンプ
      expect(proposal.generated_at).toBeDefined();
      expect(typeof proposal.generated_at).toBe('string');
      const ts = new Date(proposal.generated_at);
      expect(ts.getTime()).toBeGreaterThan(0);
      
      // ステータス
      expect(proposal.status).toBe('pending_review');
    });
    
    // 優先度でソートされていることを確認
    for (let i = 0; i < proposals.length - 1; i++) {
      expect(proposals[i].priority_score).toBeGreaterThanOrEqual(proposals[i + 1].priority_score);
    }
    
    // 具体的な提案内容の検証
    const high_priority_proposal = proposals[0];
    expect(high_priority_proposal.priority_score).toBeGreaterThanOrEqual(70);
    
    // 提案のキー要素が存在すること
    expect(high_priority_proposal.proposal_id).toMatch(/^PROP_\d{14}$/);
    
    // ログ記録可能な形式であることを確認
    const log_entry = {
      event_type: 'improvement_proposal_generated',
      proposal_id: high_priority_proposal.proposal_id,
      accuracy_before: accuracy,
      threshold: accuracy_threshold,
      triggered_at: high_priority_proposal.generated_at,
      proposal_count: proposals.length
    };
    
    expect(log_entry.event_type).toBe('improvement_proposal_generated');
    expect(log_entry.accuracy_before).toBeLessThan(log_entry.threshold);
    expect(log_entry.proposal_count).toEqual(proposals.length);
    
    // 複数提案がある場合、優先度の差が理にかなっていることを確認
    if (proposals.length >= 2) {
      const top_priority = proposals[0].priority_score;
      const second_priority = proposals[1].priority_score;
      // 優先度が単調減少していることを確認
      expect(top_priority).toBeGreaterThanOrEqual(second_priority);
    }
  });
});