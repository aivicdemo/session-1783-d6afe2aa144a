import { assignPriorityToSegments } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  test("SCEN-699: 複数セグメントで同一スコアの場合に後続セグメント順で優先度が正しく振り分けられる", () => {
    // Arrange: 複数セグメントを同一スコアで登録
    const segments = [
      { id: "seg_user_a", name: "ユーザーA", priority_score: 100 },
      { id: "seg_user_b", name: "ユーザーB", priority_score: 100 },
      { id: "seg_user_c", name: "ユーザーC", priority_score: 100 },
    ];

    // Act: 優先度付与機能を実行
    const result = assignPriorityToSegments(segments);

    // Assert: 同一スコア時にセグメント登録順序が優先度に反映されることを検証
    expect(result).toEqual([
      {
        id: "seg_user_a",
        name: "ユーザーA",
        priority_score: 100,
        assigned_priority_rank: 1,
      },
      {
        id: "seg_user_b",
        name: "ユーザーB",
        priority_score: 100,
        assigned_priority_rank: 2,
      },
      {
        id: "seg_user_c",
        name: "ユーザーC",
        priority_score: 100,
        assigned_priority_rank: 3,
      },
    ]);

    // Assert: 各セグメントの優先度ランクが順序を保持していることを検証
    expect(result[0].assigned_priority_rank).toBe(1);
    expect(result[1].assigned_priority_rank).toBe(2);
    expect(result[2].assigned_priority_rank).toBe(3);

    // Assert: 登録順が後続であるほど優先度ランクが後になることを検証
    expect(result[0].assigned_priority_rank).toBeLessThan(
      result[1].assigned_priority_rank
    );
    expect(result[1].assigned_priority_rank).toBeLessThan(
      result[2].assigned_priority_rank
    );

    // Assert: すべてのセグメントの優先度スコアが変更されていないことを検証
    expect(result[0].priority_score).toBe(100);
    expect(result[1].priority_score).toBe(100);
    expect(result[2].priority_score).toBe(100);
  });
});