import {
  validateTechnicalFeasibility,
  integrateProposalToRoadmap,
  getRoadmapByPriority,
} from "../../src/logic/it-7-3-1";

describe("献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能", () => {
  // SCEN-738
  test("開発ロードマップ組み込み機能 - 優先度付けされた改善提案を技術実現性検証後、ロードマップに優先度順に組み込める", () => {
    // === Phase 1: 優先度付けされた改善提案の一覧確認 ===
    const prioritizedProposals = [
      {
        proposal_id: "PRO-001",
        proposal_name: "栄養基準ロジック改善",
        priority_score: 85,
        priority_rank: 1,
        business_value_score: 90,
        technical_difficulty_score: 35,
        user_impact_score: 80,
        description:
          "栄養項目ごとの目標値との乖離度を定量化するロジック改善",
        estimated_effort_hours: 40,
        tech_stack: "Python, NumPy",
      },
      {
        proposal_id: "PRO-002",
        proposal_name: "献立生成成功率向上",
        priority_score: 72,
        priority_rank: 2,
        business_value_score: 75,
        technical_difficulty_score: 50,
        user_impact_score: 70,
        description: "家族の好み未反映失敗パターンの削減",
        estimated_effort_hours: 60,
        tech_stack: "TypeScript, React",
      },
      {
        proposal_id: "PRO-003",
        proposal_name: "調理時間制約最適化",
        priority_score: 65,
        priority_rank: 3,
        business_value_score: 70,
        technical_difficulty_score: 60,
        user_impact_score: 65,
        description: "調理時間超過パターンの自動検出と最適化",
        estimated_effort_hours: 80,
        tech_stack: "TypeScript, Algorithm",
      },
    ];

    expect(prioritizedProposals).toHaveLength(3);
    expect(prioritizedProposals[0].priority_rank).toBe(1);
    expect(prioritizedProposals[1].priority_rank).toBe(2);
    expect(prioritizedProposals[2].priority_rank).toBe(3);

    // === Phase 2: 最優先度(rank=1)の改善提案の詳細確認 ===
    const topProposal = prioritizedProposals[0];
    expect(topProposal.proposal_id).toBe("PRO-001");
    expect(topProposal.priority_score).toBe(85);
    expect(topProposal.estimated_effort_hours).toBe(40);
    expect(topProposal.tech_stack).toBe("Python, NumPy");

    // === Phase 3: 技術実現性の検証 ===
    const technicalValidationChecklist = [
      {
        item_id: "TVC-001",
        item_name: "既存アルゴリズムとの依存関係確認",
        result: "実装可能",
        is_passed: true,
      },
      {
        item_id: "TVC-002",
        item_name: "必要なライブラリの可用性確認",
        result: "Python 3.9+, NumPy 1.21+ で確認済み",
        is_passed: true,
      },
      {
        item_id: "TVC-003",
        item_name: "パフォーマンス要件への適合性",
        result: "平均処理時間 250ms 以内で実現可能",
        is_passed: true,
      },
      {
        item_id: "TVC-004",
        item_name: "既存テストスイートとの整合性",
        result: "回帰テスト対象範囲に追加予定",
        is_passed: true,
      },
    ];

    const validationResult = validateTechnicalFeasibility({
      proposal_id: topProposal.proposal_id,
      checklist_items: technicalValidationChecklist,
      validation_comment:
        "技術実現性確認済み。既存システムとの整合性も問題なし。",
      reviewed_by: "dev-team-lead",
      reviewed_at: "2024-11-20T10:00:00Z",
    });

    expect(validationResult.proposal_id).toBe("PRO-001");
    expect(validationResult.all_items_passed).toBe(true);
    expect(validationResult.feasibility_status).toBe("実装可能");
    expect(validationResult.checklist_items).toHaveLength(4);

    // === Phase 4: 改善提案をロードマップに組み込む ===
    const roadmapIntegration = integrateProposalToRoadmap({
      proposal_id: topProposal.proposal_id,
      target_sprint: "Sprint-12",
      target_phase: "開発フェーズ",
      scheduled_start_date: "2024-12-01",
      scheduled_end_date: "2024-12-15",
      assigned_team: "Backend Team",
      status: "ロードマップ組み込み済み",
    });

    expect(roadmapIntegration.proposal_id).toBe("PRO-001");
    expect(roadmapIntegration.target_sprint).toBe("Sprint-12");
    expect(roadmapIntegration.status).toBe("ロードマップ組み込み済み");
    expect(roadmapIntegration.integrated_at).toBeDefined();

    // === Phase 5: 優先度2位の改善提案についても同様に検証・組み込み ===
    const secondProposal = prioritizedProposals[1];

    const secondValidationChecklist = [
      {
        item_id: "TVC-005",
        item_name: "既存アルゴリズムとの依存関係確認",
        result: "条件付き実装可能（リファクタリング必要）",
        is_passed: true,
      },
      {
        item_id: "TVC-006",
        item_name: "UI/UX 変更の影響範囲確認",
        result: "献立提案画面のみ影響、最小限の UI 変更",
        is_passed: true,
      },
      {
        item_id: "TVC-007",
        item_name: "パフォーマンス要件への適合性",
        result: "平均処理時間 500ms 以内で実現可能",
        is_passed: true,
      },
    ];

    const secondValidationResult = validateTechnicalFeasibility({
      proposal_id: secondProposal.proposal_id,
      checklist_items: secondValidationChecklist,
      validation_comment:
        "条件付き実装可能。リファクタリングスケジュール別途検討。",
      reviewed_by: "tech-architect",
      reviewed_at: "2024-11-20T11:30:00Z",
    });

    expect(secondValidationResult.proposal_id).toBe("PRO-002");
    expect(secondValidationResult.all_items_passed).toBe(true);
    expect(secondValidationResult.feasibility_status).toBe("実装可能");

    const secondRoadmapIntegration = integrateProposalToRoadmap({
      proposal_id: secondProposal.proposal_id,
      target_sprint: "Sprint-13",
      target_phase: "開発フェーズ",
      scheduled_start_date: "2024-12-16",
      scheduled_end_date: "2024-12-31",
      assigned_team: "Frontend Team",
      status: "ロードマップ組み込み済み",
    });

    expect(secondRoadmapIntegration.proposal_id).toBe("PRO-002");
    expect(secondRoadmapIntegration.target_sprint).toBe("Sprint-13");

    // === Phase 6: 優先度3位の改善提案についても同様に検証・組み込み ===
    const thirdProposal = prioritizedProposals[2];

    const thirdValidationChecklist = [
      {
        item_id: "TVC-008",
        item_name: "既存アルゴリズムとの依存関係確認",
        result: "独立したモジュール、依存性なし",
        is_passed: true,
      },
      {
        item_id: "TVC-009",
        item_name: "必要なライブラリの可用性確認",
        result: "TypeScript stdlib のみで実現可能",
        is_passed: true,
      },
      {
        item_id: "TVC-010",
        item_name: "パフォーマンス要件への適合性",
        result: "平均処理時間 300ms 以内で実現可能",
        is_passed: true,
      },
    ];

    const thirdValidationResult = validateTechnicalFeasibility({
      proposal_id: thirdProposal.proposal_id,
      checklist_items: thirdValidationChecklist,
      validation_comment: "実装可能性が高い。独立したモジュール開発が推奨。",
      reviewed_by: "dev-team-lead",
      reviewed_at: "2024-11-20T13:00:00Z",
    });

    expect(thirdValidationResult.proposal_id).toBe("PRO-003");
    expect(thirdValidationResult.all_items_passed).toBe(true);

    const thirdRoadmapIntegration = integrateProposalToRoadmap({
      proposal_id: thirdProposal.proposal_id,
      target_sprint: "Sprint-14",
      target_phase: "開発フェーズ",
      scheduled_start_date: "2025-01-01",
      scheduled_end_date: "2025-01-20",
      assigned_team: "Algorithm Team",
      status: "ロードマップ組み込み済み",
    });

    expect(thirdRoadmapIntegration.proposal_id).toBe("PRO-003");
    expect(thirdRoadmapIntegration.target_sprint).toBe("Sprint-14");

    // === Phase 7: 最終的なロードマップが優先度順に正しく組み込まれたことを確認 ===
    const finalRoadmap = getRoadmapByPriority({
      included_proposals: [
        { proposal_id: "PRO-001", priority_rank: 1 },
        { proposal_id: "PRO-002", priority_rank: 2 },
        { proposal_id: "PRO-003", priority_rank: 3 },
      ],
    });

    expect(finalRoadmap.roadmap_items).toHaveLength(3);
    expect(finalRoadmap.roadmap_items[0].proposal_id).toBe("PRO-001");
    expect(finalRoadmap.roadmap_items[0].priority_rank).toBe(1);
    expect(finalRoadmap.roadmap_items[0].scheduled_sprint).toBe("Sprint-12");

    expect(finalRoadmap.roadmap_items[1].proposal_id).toBe("PRO-002");
    expect(finalRoadmap.roadmap_items[1].priority_rank).toBe(2);
    expect(finalRoadmap.roadmap_items[1].scheduled_sprint).toBe("Sprint-13");

    expect(finalRoadmap.roadmap_items[2].proposal_id).toBe("PRO-003");
    expect(finalRoadmap.roadmap_items[2].priority_rank).toBe(3);
    expect(finalRoadmap.roadmap_items[2].scheduled_sprint).toBe("Sprint-14");

    expect(finalRoadmap.roadmap_status).toBe("優先度順に正しく組み込み完了");
  });
});