import { generateImprovementProposal } from "../../src/logic/it-7-2-1";

describe("改善提案書生成機能", () => {
  // SCEN-719
  test("複数の改善課題について、それぞれ異なる実装見積と期待効果を含む提案書が生成される", () => {
    const improvement_task_a = {
      task_id: "TASK-001",
      task_name: "献立生成速度最適化",
      estimated_implementation_days: 10,
      expected_effect_description: "処理速度30%改善",
      expected_effect_percentage: 30,
      kpi_contribution_score: 85,
    };

    const improvement_task_b = {
      task_id: "TASK-002",
      task_name: "メモリ効率改善",
      estimated_implementation_days: 5,
      expected_effect_description: "メモリ使用量20%削減",
      expected_effect_percentage: 20,
      kpi_contribution_score: 72,
    };

    const improvement_task_c = {
      task_id: "TASK-003",
      task_name: "エラーハンドリング強化",
      estimated_implementation_days: 15,
      expected_effect_description: "エラー率50%低下",
      expected_effect_percentage: 50,
      kpi_contribution_score: 95,
    };

    const improvement_tasks = [
      improvement_task_a,
      improvement_task_b,
      improvement_task_c,
    ];

    const proposal = generateImprovementProposal({
      improvement_tasks: improvement_tasks,
      proposal_generated_at: new Date("2024-12-15T10:30:00Z"),
    });

    // 提案書が存在することを確認
    expect(proposal).toBeDefined();

    // 提案書に含まれる改善課題の数が入力した課題数と一致することを確認
    expect(proposal.tasks.length).toBe(3);

    // 提案書内の各改善課題について、設定した実装見積値が正確に反映されていることを確認
    expect(proposal.tasks[0].estimated_implementation_days).toBe(10);
    expect(proposal.tasks[1].estimated_implementation_days).toBe(5);
    expect(proposal.tasks[2].estimated_implementation_days).toBe(15);

    // 提案書内の各改善課題について、設定した期待効果値が正確に反映されていることを確認
    expect(proposal.tasks[0].expected_effect_percentage).toBe(30);
    expect(proposal.tasks[1].expected_effect_percentage).toBe(20);
    expect(proposal.tasks[2].expected_effect_percentage).toBe(50);

    // 提案書内の課題間で実装見積値が相互に異なっていることを確認
    const estimated_days_set = new Set([
      proposal.tasks[0].estimated_implementation_days,
      proposal.tasks[1].estimated_implementation_days,
      proposal.tasks[2].estimated_implementation_days,
    ]);
    expect(estimated_days_set.size).toBe(3);

    // 提案書内の課題間で期待効果値が相互に異なっていることを確認
    const effect_percentage_set = new Set([
      proposal.tasks[0].expected_effect_percentage,
      proposal.tasks[1].expected_effect_percentage,
      proposal.tasks[2].expected_effect_percentage,
    ]);
    expect(effect_percentage_set.size).toBe(3);

    // 各課題のIDと名前が正確に保持されていることを確認
    expect(proposal.tasks[0].task_id).toBe("TASK-001");
    expect(proposal.tasks[0].task_name).toBe("献立生成速度最適化");
    expect(proposal.tasks[1].task_id).toBe("TASK-002");
    expect(proposal.tasks[1].task_name).toBe("メモリ効率改善");
    expect(proposal.tasks[2].task_id).toBe("TASK-003");
    expect(proposal.tasks[2].task_name).toBe("エラーハンドリング強化");

    // 期待効果の説明文が正確に反映されていることを確認
    expect(proposal.tasks[0].expected_effect_description).toBe(
      "処理速度30%改善"
    );
    expect(proposal.tasks[1].expected_effect_description).toBe(
      "メモリ使用量20%削減"
    );
    expect(proposal.tasks[2].expected_effect_description).toBe(
      "エラー率50%低下"
    );

    // KPI寄与度スコアが正確に反映されていることを確認
    expect(proposal.tasks[0].kpi_contribution_score).toBe(85);
    expect(proposal.tasks[1].kpi_contribution_score).toBe(72);
    expect(proposal.tasks[2].kpi_contribution_score).toBe(95);
  });
});