import { generateImprovementProposal } from '../../src/logic/it-7-2-1';

describe('改善提案書生成機能', () => {
  // SCEN-718
  test('優先度付けされた改善課題リストから実装見積・期待効果・KPI寄与度を含む改善提案書が正確に生成される', () => {
    // テストデータ: 優先度付けされた改善課題リスト（3件以上）
    const prioritized_improvement_tasks = [
      {
        task_id: 'TASK-001',
        task_name: '栄養バランス判定ロジック改善',
        priority_score: 85,
        business_value: 90,
        technical_difficulty: 60,
        user_impact: 80,
        estimated_hours: 40,
        estimated_cost_jpy: 400000,
        expected_effect_qualitative: '栄養基準充足率が向上し、ユーザーの健康改善に寄与',
        expected_effect_quantitative: '充足率5%向上見込み',
        kpi_contribution: [
          {
            kpi_name: '献立生成成功率',
            contribution_rate: 8.5
          },
          {
            kpi_name: 'ユーザー満足度スコア',
            contribution_rate: 0.6
          }
        ]
      },
      {
        task_id: 'TASK-002',
        task_name: '家族好み学習アルゴリズム強化',
        priority_score: 72,
        business_value: 75,
        technical_difficulty: 75,
        user_impact: 85,
        estimated_hours: 60,
        estimated_cost_jpy: 600000,
        expected_effect_qualitative: '過去の食事評価データから高精度に嗜好を抽出',
        expected_effect_quantitative: '却下率3%低下見込み',
        kpi_contribution: [
          {
            kpi_name: 'ユーザー満足度スコア',
            contribution_rate: 1.2
          },
          {
            kpi_name: '完食度',
            contribution_rate: 5.0
          }
        ]
      },
      {
        task_id: 'TASK-003',
        task_name: '調理時間予測精度向上',
        priority_score: 68,
        business_value: 70,
        technical_difficulty: 55,
        user_impact: 72,
        estimated_hours: 35,
        estimated_cost_jpy: 350000,
        expected_effect_qualitative: '調理時間超過による却下を削減',
        expected_effect_quantitative: '調理時間超過による却下が20%削減見込み',
        kpi_contribution: [
          {
            kpi_name: '調理時間短縮度',
            contribution_rate: 12.0
          }
        ]
      }
    ];

    const generation_timestamp = new Date('2025-02-15T09:30:00Z');
    const generated_by_user_id = 'USR-PM-001';
    const generated_by_user_name = 'Product Manager A';

    // 改善提案書生成機能を呼び出し
    const result = generateImprovementProposal({
      prioritized_tasks: prioritized_improvement_tasks,
      generation_timestamp: generation_timestamp,
      generated_by_user_id: generated_by_user_id,
      generated_by_user_name: generated_by_user_name
    });

    // ドキュメント構造が正確に生成されていることを確認
    expect(result).toHaveProperty('proposal_id');
    expect(result).toHaveProperty('document_title');
    expect(result).toHaveProperty('metadata');
    expect(result).toHaveProperty('tasks');
    expect(result).toHaveProperty('summary_statistics');
    expect(result).toHaveProperty('format_type');

    // メタデータが正確に含まれていることを確認
    expect(result.metadata).toEqual({
      generation_date: '2025-02-15',
      generation_time: '09:30:00',
      generated_by_user_id: 'USR-PM-001',
      generated_by_user_name: 'Product Manager A',
      total_tasks: 3
    });

    // 改善提案書のフォーマットが指定フォーマットであることを確認
    expect(result.format_type).toBe('PDF');

    // 課題リストが優先度順に正確にソートされていることを確認
    expect(result.tasks).toHaveLength(3);
    expect(result.tasks[0].task_id).toBe('TASK-001');
    expect(result.tasks[0].priority_score).toBe(85);
    expect(result.tasks[1].task_id).toBe('TASK-002');
    expect(result.tasks[1].priority_score).toBe(72);
    expect(result.tasks[2].task_id).toBe('TASK-003');
    expect(result.tasks[2].priority_score).toBe(68);

    // 各課題について実装見積が正確に計算・記載されていることを検証
    expect(result.tasks[0]).toEqual(
      expect.objectContaining({
        task_id: 'TASK-001',
        task_name: '栄養バランス判定ロジック改善',
        estimated_hours: 40,
        estimated_cost_jpy: 400000
      })
    );
    expect(result.tasks[1]).toEqual(
      expect.objectContaining({
        task_id: 'TASK-002',
        task_name: '家族好み学習アルゴリズム強化',
        estimated_hours: 60,
        estimated_cost_jpy: 600000
      })
    );
    expect(result.tasks[2]).toEqual(
      expect.objectContaining({
        task_id: 'TASK-003',
        task_name: '調理時間予測精度向上',
        estimated_hours: 35,
        estimated_cost_jpy: 350000
      })
    );

    // 各課題について期待効果が適切に記載されていることを検証
    expect(result.tasks[0].expected_effect_qualitative).toBe(
      '栄養基準充足率が向上し、ユーザーの健康改善に寄与'
    );
    expect(result.tasks[0].expected_effect_quantitative).toBe('充足率5%向上見込み');
    expect(result.tasks[1].expected_effect_qualitative).toBe(
      '過去の食事評価データから高精度に嗜好を抽出'
    );
    expect(result.tasks[1].expected_effect_quantitative).toBe('却下率3%低下見込み');
    expect(result.tasks[2].expected_effect_qualitative).toBe(
      '調理時間超過による却下を削減'
    );
    expect(result.tasks[2].expected_effect_quantitative).toBe(
      '調理時間超過による却下が20%削減見込み'
    );

    // 各課題についてKPI寄与度が正確に記載されていることを検証
    expect(result.tasks[0].kpi_contribution).toHaveLength(2);
    expect(result.tasks[0].kpi_contribution[0]).toEqual({
      kpi_name: '献立生成成功率',
      contribution_rate: 8.5
    });
    expect(result.tasks[0].kpi_contribution[1]).toEqual({
      kpi_name: 'ユーザー満足度スコア',
      contribution_rate: 0.6
    });

    expect(result.tasks[1].kpi_contribution).toHaveLength(2);
    expect(result.tasks[1].kpi_contribution[0]).toEqual({
      kpi_name: 'ユーザー満足度スコア',
      contribution_rate: 1.2
    });
    expect(result.tasks[1].kpi_contribution[1]).toEqual({
      kpi_name: '完食度',
      contribution_rate: 5.0
    });

    expect(result.tasks[2].kpi_contribution).toHaveLength(1);
    expect(result.tasks[2].kpi_contribution[0]).toEqual({
      kpi_name: '調理時間短縮度',
      contribution_rate: 12.0
    });

    // 集計統計が正確に計算されていることを検証
    expect(result.summary_statistics).toEqual({
      total_estimated_hours: 135,
      total_estimated_cost_jpy: 1350000,
      average_priority_score: 75,
      highest_priority_score: 85,
      lowest_priority_score: 68
    });

    // ドキュメントタイトルが適切に生成されていることを確認
    expect(result.document_title).toMatch(/改善提案書/);
  });
});