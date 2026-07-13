import { validateResourceAllocation } from "../../src/logic/it-1-br-2-1-2-1";

describe("栄養士からの改善提案を優先度付けして管理し、開発チームに定期通知する機能", () => {
  // SCEN-499: [edge] 実装計画策定 - リソース配分が不足する場合に警告を生成する
  test("リソース不足が検出され、警告メッセージが生成され、不足リソース情報が明記される", () => {
    const projectId = "proj-001";
    const projectName = "栄養基準ロジック改善";

    // 実装計画に紐付くタスク定義
    const tasks = [
      {
        taskId: "task-001",
        taskName: "栄養基準の再検証",
        requiredStaff: 2,
        requiredBudget: 150000,
        requiredHours: 80,
      },
      {
        taskId: "task-002",
        taskName: "献立生成アルゴリズム改善",
        requiredStaff: 3,
        requiredBudget: 250000,
        requiredHours: 120,
      },
      {
        taskId: "task-003",
        taskName: "テスト・検証",
        requiredStaff: 2,
        requiredBudget: 100000,
        requiredHours: 60,
      },
    ];

    // プロジェクト全体の利用可能リソース
    // 各タスクの合計: staff=7人, budget=500000円, hours=260時間
    // 以下は合計より少なく設定（リソース不足を意図的に作成）
    const availableResources = {
      totalAvailableStaff: 5, // 必要7人 → 不足2人
      totalAvailableBudget: 400000, // 必要500000円 → 不足100000円
      totalAvailableHours: 200, // 必要260時間 → 不足60時間
    };

    // 実装計画の検証実行
    const result = validateResourceAllocation({
      projectId,
      projectName,
      tasks,
      availableResources,
    });

    // リソース不足が検出されていることを確認
    expect(result.isResourceSufficient).toBe(false);

    // 警告メッセージが存在することを確認
    expect(result.warnings).toBeDefined();
    expect(result.warnings.length).toBeGreaterThan(0);

    // 不足しているリソースの種類と不足量が明記されているか確認
    expect(result.resourceShortages).toBeDefined();
    expect(result.resourceShortages.staffShortage).toBe(2);
    expect(result.resourceShortages.budgetShortage).toBe(100000);
    expect(result.resourceShortages.hoursShortage).toBe(60);

    // 警告メッセージに不足リソース情報が含まれているか確認
    const warningText = result.warnings.join(" ");
    expect(warningText).toMatch(/人員|スタッフ|staff/i);
    expect(warningText).toMatch(/予算|budget/i);
    expect(warningText).toMatch(/時間|hour/i);

    // 警告の詳細情報を確認
    expect(result.warnings).toContainEqual(
      expect.stringMatching(/2.*人員|人員.*2/)
    );
    expect(result.warnings).toContainEqual(
      expect.stringMatching(/100000.*円|円.*100000/)
    );
    expect(result.warnings).toContainEqual(
      expect.stringMatching(/60.*時間|時間.*60/)
    );

    // リソース配分状況のレポート情報が含まれているか確認
    expect(result.report).toBeDefined();
    expect(result.report.totalRequiredStaff).toBe(7);
    expect(result.report.totalRequiredBudget).toBe(500000);
    expect(result.report.totalRequiredHours).toBe(260);
    expect(result.report.totalAvailableStaff).toBe(5);
    expect(result.report.totalAvailableBudget).toBe(400000);
    expect(result.report.totalAvailableHours).toBe(200);

    // リソース充足率が正しく計算されているか確認
    expect(result.report.staffUtilizationRate).toBe(
      Math.round((5 / 7) * 10000) / 10000
    ); // 約71.43%
    expect(result.report.budgetUtilizationRate).toBe(
      Math.round((400000 / 500000) * 10000) / 10000
    ); // 80%
    expect(result.report.hoursUtilizationRate).toBe(
      Math.round((200 / 260) * 10000) / 10000
    ); // 約76.92%

    // ステータスが「警告」に設定されているか確認
    expect(result.status).toBe("warning");
  });
});