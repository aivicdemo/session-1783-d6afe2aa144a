import { createNutritionVerificationReport } from '../../src/logic/it-7-2-1';

describe('栄養基準ロジック検証結果レポート生成', () => {
  // SCEN-692
  test('検証結果レポート作成・承認判定 - 栄養基準ロジック検証結果・改善実装効果・次期改善優先度を含むレポートを作成する', () => {
    // 栄養基準ロジックの検証結果データ
    const verification_results = {
      verification_id: 'VER-2024-Q1-001',
      verification_date: '2024-03-31T23:59:59Z',
      verification_cycle: 'quarterly',
      logic_version: 'v2.1.0',
      user_samples_analyzed: 1250,
      nutrition_items_evaluated: [
        {
          nutrition_item_name: 'タンパク質',
          nutrition_code: 'PROTEIN',
          recommended_daily_intake: 60,
          actual_achievement_rate: 94.5,
          verification_result: 'pass',
          achievement_score: 94.5
        },
        {
          nutrition_item_name: 'カルシウム',
          nutrition_code: 'CALCIUM',
          recommended_daily_intake: 800,
          actual_achievement_rate: 72.3,
          verification_result: 'fail',
          achievement_score: 72.3
        },
        {
          nutrition_item_name: '食物繊維',
          nutrition_code: 'FIBER',
          recommended_daily_intake: 25,
          actual_achievement_rate: 88.7,
          verification_result: 'pass',
          achievement_score: 88.7
        }
      ],
      overall_verification_result: 'conditional_pass',
      overall_achievement_score: 85.2
    };

    // 改善実装前後の性能比較データ
    const performance_comparison = {
      comparison_id: 'CMP-2024-Q1-001',
      comparison_period_start: '2024-01-01T00:00:00Z',
      comparison_period_end: '2024-03-31T23:59:59Z',
      before_implementation: {
        precision_score: 78.5,
        processing_speed_ms: 2450,
        user_satisfaction_score: 7.2,
        menu_generation_success_rate: 82.3
      },
      after_implementation: {
        precision_score: 85.2,
        processing_speed_ms: 1890,
        user_satisfaction_score: 8.1,
        menu_generation_success_rate: 89.7
      },
      improvements: {
        precision_improvement_percentage: 8.5,
        processing_speed_improvement_percentage: 22.9,
        satisfaction_improvement_points: 0.9,
        success_rate_improvement_percentage: 7.4
      }
    };

    // 次期改善優先度データ
    const priority_improvements = [
      {
        priority_rank: 1,
        priority_score: 92,
        improvement_item_name: 'カルシウム摂取量の基準値見直し',
        improvement_code: 'IMP-CALCIUM-001',
        business_value_score: 95,
        technical_difficulty_score: 45,
        user_impact_score: 90,
        recommended_implementation_period: 'Q2 2024',
        estimated_implementation_days: 14
      },
      {
        priority_rank: 2,
        priority_score: 78,
        improvement_item_name: '高齢者向け栄養基準の個別対応',
        improvement_code: 'IMP-ELDERLY-001',
        business_value_score: 82,
        technical_difficulty_score: 65,
        user_impact_score: 75,
        recommended_implementation_period: 'Q2-Q3 2024',
        estimated_implementation_days: 21
      },
      {
        priority_rank: 3,
        priority_score: 68,
        improvement_item_name: 'ビタミンB群摂取バランスの最適化',
        improvement_code: 'IMP-VITB-001',
        business_value_score: 70,
        technical_difficulty_score: 55,
        user_impact_score: 65,
        recommended_implementation_period: 'Q3 2024',
        estimated_implementation_days: 10
      }
    ];

    // レポート作成機能を呼び出し
    const generated_report = createNutritionVerificationReport({
      verification_results,
      performance_comparison,
      priority_improvements,
      report_generated_timestamp: '2024-04-07T10:30:00Z',
      generated_by_nutritionist_id: 'NUT-2024-001',
      approval_status: 'pending_review'
    });

    // レポートが正常に生成されたことを確認
    expect(generated_report).toBeDefined();
    expect(generated_report.report_id).toMatch(/^RPT-\d{4}-\w+-\d{3}$/);

    // 栄養基準ロジック検証結果が正確に反映されていることを検証
    expect(generated_report.verification_section).toBeDefined();
    expect(generated_report.verification_section.overall_verification_result).toBe('conditional_pass');
    expect(generated_report.verification_section.overall_achievement_score).toBe(85.2);
    expect(generated_report.verification_section.nutrition_items_summary).toHaveLength(3);

    const calcium_item = generated_report.verification_section.nutrition_items_summary.find(
      (item) => item.nutrition_code === 'CALCIUM'
    );
    expect(calcium_item).toBeDefined();
    expect(calcium_item.actual_achievement_rate).toBe(72.3);
    expect(calcium_item.verification_result).toBe('fail');

    // 改善実装効果（性能向上数値）がレポートに正確に記載されていることを確認
    expect(generated_report.performance_section).toBeDefined();
    expect(generated_report.performance_section.precision_improvement_percentage).toBe(8.5);
    expect(generated_report.performance_section.processing_speed_improvement_percentage).toBe(22.9);
    expect(generated_report.performance_section.satisfaction_improvement_points).toBe(0.9);
    expect(generated_report.performance_section.success_rate_improvement_percentage).toBe(7.4);

    // 改善前後の具体的な数値が正確に記載されていることを確認
    expect(generated_report.performance_section.before_metrics).toEqual({
      precision_score: 78.5,
      processing_speed_ms: 2450,
      user_satisfaction_score: 7.2,
      menu_generation_success_rate: 82.3
    });
    expect(generated_report.performance_section.after_metrics).toEqual({
      precision_score: 85.2,
      processing_speed_ms: 1890,
      user_satisfaction_score: 8.1,
      menu_generation_success_rate: 89.7
    });

    // 次期改善優先度が優先順位順に正確に列挙されていることを検証
    expect(generated_report.priority_section).toBeDefined();
    expect(generated_report.priority_section.improvements_list).toHaveLength(3);

    expect(generated_report.priority_section.improvements_list[0]).toEqual({
      priority_rank: 1,
      priority_score: 92,
      improvement_item_name: 'カルシウム摂取量の基準値見直し',
      improvement_code: 'IMP-CALCIUM-001',
      business_value_score: 95,
      technical_difficulty_score: 45,
      user_impact_score: 90,
      recommended_implementation_period: 'Q2 2024',
      estimated_implementation_days: 14
    });

    expect(generated_report.priority_section.improvements_list[1]).toEqual({
      priority_rank: 2,
      priority_score: 78,
      improvement_item_name: '高齢者向け栄養基準の個別対応',
      improvement_code: 'IMP-ELDERLY-001',
      business_value_score: 82,
      technical_difficulty_score: 65,
      user_impact_score: 75,
      recommended_implementation_period: 'Q2-Q3 2024',
      estimated_implementation_days: 21
    });

    expect(generated_report.priority_section.improvements_list[2]).toEqual({
      priority_rank: 3,
      priority_score: 68,
      improvement_item_name: 'ビタミンB群摂取バランスの最適化',
      improvement_code: 'IMP-VITB-001',
      business_value_score: 70,
      technical_difficulty_score: 55,
      user_impact_score: 65,
      recommended_implementation_period: 'Q3 2024',
      estimated_implementation_days: 10
    });

    // レポートのフォーマット（構成、見出し、表記）が仕様通りであることを確認
    expect(generated_report).toHaveProperty('report_id');
    expect(generated_report).toHaveProperty('report_title');
    expect(generated_report).toHaveProperty('report_generated_timestamp');
    expect(generated_report).toHaveProperty('generated_by_nutritionist_id');
    expect(generated_report).toHaveProperty('verification_section');
    expect(generated_report).toHaveProperty('performance_section');
    expect(generated_report).toHaveProperty('priority_section');
    expect(generated_report).toHaveProperty('approval_status');
    expect(generated_report).toHaveProperty('summary_remarks');

    expect(generated_report.report_title).toMatch(/栄養基準ロジック検証結果レポート/);
    expect(generated_report.report_generated_timestamp).toBe('2024-04-07T10:30:00Z');
    expect(generated_report.generated_by_nutritionist_id).toBe('NUT-2024-001');
    expect(generated_report.approval_status).toBe('pending_review');

    // レポートが正常に保存・出力されることを確認
    expect(generated_report.report_status).toBe('generated');
    expect(generated_report.is_valid_format).toBe(true);
    expect(generated_report.data_integrity_check).toBe(true);

    // サマリーセクションに検証結果の要約が含まれていることを確認
    expect(generated_report.summary_remarks).toBeDefined();
    expect(generated_report.summary_remarks).toContain('conditional_pass');
    expect(generated_report.summary_remarks).toContain('85.2');

    // 全体的なレポート構造の検証
    expect(generated_report.report_sections_count).toBe(3);
    expect(generated_report.total_data_points).toBe(
      3 + 4 + 4 + 3 // verification items(3) + before metrics(4) + after metrics(4) + improvements(3)
    );
  });
});