import {
  judgeMinimumSampleCountRequirement,
  type UserFeedbackJudgmentInput,
  type UserFeedbackJudgmentOutput,
} from "../../src/logic/it-8-1-1-1";

describe("ユーザーインタビュー記録と利用ログから食材制限・調理時間制限・予算制約を抽出し優先度マトリクスを生成", () => {
  // SCEN-203
  test("[normal] ユーザーフィードバック最小サンプル数判定機能 - 収集フィードバック数が最小要件数以上の場合、改善課題リスト作成フェーズへ遷移判定が正常に実行される", () => {
    const minimumRequirementCount = 100;
    const collectedFeedbackCount = 100;

    const input: UserFeedbackJudgmentInput = {
      minimumRequirementCount,
      collectedFeedbackCount,
    };

    const result: UserFeedbackJudgmentOutput =
      judgeMinimumSampleCountRequirement(input);

    expect(result.isMeetingRequirement).toBe(true);
    expect(result.judgmentResult).toBe("最小要件数以上");
    expect(result.shouldTransitionToNextPhase).toBe(true);
    expect(result.nextPhase).toBe("改善課題リスト作成フェーズ");
    expect(result.collectedCount).toBe(100);
    expect(result.requiredCount).toBe(100);
  });
});