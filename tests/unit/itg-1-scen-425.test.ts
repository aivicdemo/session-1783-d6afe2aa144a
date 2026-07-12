import { detectAnomalousEvaluationData } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  // SCEN-425: [error] 食事評価データ異常値検出機能 - 完食度が100%なのに満足度スコアが1である矛盾データが検出された場合、信頼度が低いデータとして除外される
  test("完食度100%かつ満足度スコア1の矛盾データを異常値として検出し、信頼度を低いと判定して除外リストに追加し、献立生成ロジックで使用されない", () => {
    // テストデータ: 完食度100%かつ満足度スコア1の矛盾データを含む食事評価データセット
    const anomalousEvaluationDataset = [
      {
        evaluationId: "eval_001",
        mealId: "meal_20240115_dinner",
        familyMemberId: "member_child_08yo",
        satisfactionScore: 5,
        completionRate: 95,
        requestText: "もっと塩辛くしてほしい",
        timestamp: "2024-01-15T18:30:00Z",
        trustworthinessFlag: "high",
        exclusionFlag: false,
      },
      {
        evaluationId: "eval_002",
        mealId: "meal_20240115_dinner",
        familyMemberId: "member_child_06yo",
        satisfactionScore: 1,
        completionRate: 100,
        requestText: "",
        timestamp: "2024-01-15T18:35:00Z",
        trustworthinessFlag: "high",
        exclusionFlag: false,
      },
      {
        evaluationId: "eval_003",
        mealId: "meal_20240115_dinner",
        familyMemberId: "member_parent_40yo",
        satisfactionScore: 4,
        completionRate: 88,
        requestText: "次週もこれでお願いします",
        timestamp: "2024-01-15T18:40:00Z",
        trustworthinessFlag: "high",
        exclusionFlag: false,
      },
    ];

    // 献立自動生成アプリの食事評価データ異常値検出機能を実行する
    const detectionResult = detectAnomalousEvaluationData(
      anomalousEvaluationDataset
    );

    // 異常値検出機能が矛盾データを検出したか確認する
    // 完食度100%かつ満足度スコア1のデータ（eval_002）が異常と判定されているか
    expect(detectionResult.anomalousList).toContainEqual(
      expect.objectContaining({
        evaluationId: "eval_002",
      })
    );
    expect(detectionResult.anomalousList.length).toBe(1);

    // 検出されたデータの信頼度フラグが「低い」に設定されているか確認する
    const detectedAnomaly = detectionResult.anomalousList[0];
    expect(detectedAnomaly.trustworthinessFlag).toBe("low");

    // 該当データが除外リストに追加されているか確認する
    expect(detectionResult.exclusionList).toContainEqual(
      expect.objectContaining({
        evaluationId: "eval_002",
      })
    );
    expect(detectionResult.exclusionList.length).toBe(1);

    // 除外されたデータが献立生成ロジックで使用されていないことを検証する
    // 献立生成に使用されるデータセット（信頼度「高」かつ除外フラグがfalse）から除外データが削除されているか
    const validDataForGeneration = detectionResult.validDataForGeneration;
    expect(validDataForGeneration.length).toBe(2);
    expect(
      validDataForGeneration.find((d) => d.evaluationId === "eval_002")
    ).toBeUndefined();
    expect(validDataForGeneration.map((d) => d.evaluationId)).toEqual([
      "eval_001",
      "eval_003",
    ]);

    // 除外されたデータのexclusionFlagが献立生成ロジック適用前には正しく設定されているか確認
    // (データセット入力時点では除外フラグがfalseだったが、検出後にtrueに更新される)
    expect(detectedAnomaly.exclusionFlag).toBe(true);
  });
});