import { distributeRuleSpecificationAndAutoProgressApprovalFlow } from "../../src/logic/it-1-br-6-2-1-1";

describe("食材流通業者・スーパーの在庫・価格データ連携インターフェース", () => {
  // SCEN-491
  test("ルール仕様書配布・承認フロー自動進行機能 - ルール仕様書の配布対象が未定義の場合、承認フロー自動進行が中断される", () => {
    const ruleSpecificationId = "rule-spec-001";
    const ruleTitle = "季節パターン・割引率閾値・販売期間優先度ルール";
    const ruleContent =
      "Q1季節パターンと割引率の定義。旬の食材は優先度+30、割引率20%以上は優先度+20";
    const distributionTargets = undefined;
    const currentStatus = "保留中";

    const result = distributeRuleSpecificationAndAutoProgressApprovalFlow({
      ruleSpecificationId,
      ruleTitle,
      ruleContent,
      distributionTargets,
      currentStatus,
    });

    expect(result.isApprovalFlowProgressed).toBe(false);
    expect(result.errorMessage).toBe(
      "配布対象が指定されていません。承認フロー自動進行を実行することはできません"
    );
    expect(result.ruleSpecificationStatus).toBe("保留中");
    expect(result.approvalFlowHalted).toBe(true);
  });
});