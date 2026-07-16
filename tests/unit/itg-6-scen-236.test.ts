import {
  assignAlgorithmReviewProxies,
} from "../../src/logic/it-1-br-8-2-2-1";

describe("アルゴリズム改善レビュー会議参加者確定 - 欠席者代理割り当て", () => {
  // SCEN-236
  test("should handle proxy assignment for 0 absent, 1 absent, and all absent participants correctly", () => {
    // ========== ケース1: 欠席者が0人のシナリオ ==========
    const case1_input = {
      meeting_id: "meeting_001",
      participants: [
        {
          participant_id: "p001",
          name: "Alice",
          is_absent: false,
          proxy_id: null,
        },
        {
          participant_id: "p002",
          name: "Bob",
          is_absent: false,
          proxy_id: null,
        },
        {
          participant_id: "p003",
          name: "Charlie",
          is_absent: false,
          proxy_id: null,
        },
      ],
      available_proxies: [
        { proxy_id: "pr001", name: "Dave", availability: true },
        { proxy_id: "pr002", name: "Eve", availability: true },
      ],
    };

    const case1_result = assignAlgorithmReviewProxies(case1_input);

    // ケース1の検証: 参加者リストが変更されていないことを確認
    expect(case1_result.meeting_id).toBe("meeting_001");
    expect(case1_result.participants.length).toBe(3);
    expect(case1_result.participants[0].proxy_id).toBeNull();
    expect(case1_result.participants[1].proxy_id).toBeNull();
    expect(case1_result.participants[2].proxy_id).toBeNull();
    expect(case1_result.absent_count).toBe(0);
    expect(case1_result.proxy_assignments_count).toBe(0);
    expect(case1_result.status).toBe("confirmed");

    // ========== ケース2: 欠席者が1人のシナリオ ==========
    const case2_input = {
      meeting_id: "meeting_002",
      participants: [
        {
          participant_id: "p001",
          name: "Alice",
          is_absent: false,
          proxy_id: null,
        },
        {
          participant_id: "p002",
          name: "Bob",
          is_absent: true,
          proxy_id: null,
        },
        {
          participant_id: "p003",
          name: "Charlie",
          is_absent: false,
          proxy_id: null,
        },
      ],
      available_proxies: [
        { proxy_id: "pr001", name: "Dave", availability: true },
        { proxy_id: "pr002", name: "Eve", availability: true },
      ],
    };

    const case2_result = assignAlgorithmReviewProxies(case2_input);

    // ケース2の検証: 欠席者に対して正確に1人の代理が割り当てられていることを確認
    expect(case2_result.meeting_id).toBe("meeting_002");
    expect(case2_result.participants.length).toBe(3);
    expect(case2_result.participants[0].proxy_id).toBeNull(); // Alice は出席
    expect(case2_result.participants[1].proxy_id).toBe("pr001"); // Bob に代理割り当て
    expect(case2_result.participants[2].proxy_id).toBeNull(); // Charlie は出席
    expect(case2_result.absent_count).toBe(1);
    expect(case2_result.proxy_assignments_count).toBe(1);

    // 割り当てられた代理者の有効性チェック（重複なし、適格者であるか）
    const assigned_proxies_case2 = case2_result.participants
      .filter((p) => p.proxy_id !== null)
      .map((p) => p.proxy_id);
    expect(new Set(assigned_proxies_case2).size).toBe(assigned_proxies_case2.length); // 重複なし
    expect(assigned_proxies_case2).toContain("pr001");
    expect(case2_result.status).toBe("confirmed");

    // ========== ケース3: 全員欠席のシナリオ ==========
    const case3_input = {
      meeting_id: "meeting_003",
      participants: [
        {
          participant_id: "p001",
          name: "Alice",
          is_absent: true,
          proxy_id: null,
        },
        {
          participant_id: "p002",
          name: "Bob",
          is_absent: true,
          proxy_id: null,
        },
        {
          participant_id: "p003",
          name: "Charlie",
          is_absent: true,
          proxy_id: null,
        },
      ],
      available_proxies: [
        { proxy_id: "pr001", name: "Dave", availability: true },
        { proxy_id: "pr002", name: "Eve", availability: true },
        { proxy_id: "pr003", name: "Frank", availability: true },
      ],
    };

    const case3_result = assignAlgorithmReviewProxies(case3_input);

    // ケース3の検証: すべての参加者に対して代理が割り当てられていることを確認
    expect(case3_result.meeting_id).toBe("meeting_003");
    expect(case3_result.participants.length).toBe(3);
    expect(case3_result.participants[0].proxy_id).toBe("pr001");
    expect(case3_result.participants[1].proxy_id).toBe("pr002");
    expect(case3_result.participants[2].proxy_id).toBe("pr003");
    expect(case3_result.absent_count).toBe(3);
    expect(case3_result.proxy_assignments_count).toBe(3);

    // 割り当てられた代理者の有効性チェック（重複なし、適格者であるか）
    const assigned_proxies_case3 = case3_result.participants
      .filter((p) => p.proxy_id !== null)
      .map((p) => p.proxy_id);
    expect(assigned_proxies_case3.length).toBe(3); // すべての欠席者に代理割り当て
    expect(new Set(assigned_proxies_case3).size).toBe(3); // 重複なし
    expect(case3_result.status).toBe("confirmed");

    // ========== ケース4: 代理が不足する場合（エラーケース） ==========
    const case4_input = {
      meeting_id: "meeting_004",
      participants: [
        {
          participant_id: "p001",
          name: "Alice",
          is_absent: true,
          proxy_id: null,
        },
        {
          participant_id: "p002",
          name: "Bob",
          is_absent: true,
          proxy_id: null,
        },
        {
          participant_id: "p003",
          name: "Charlie",
          is_absent: true,
          proxy_id: null,
        },
      ],
      available_proxies: [
        { proxy_id: "pr001", name: "Dave", availability: true },
      ], // 代理が1人のみ
    };

    expect(() => assignAlgorithmReviewProxies(case4_input)).toThrow(/代理不足/);
  });
});