import { mergeAndPrepareMealEvaluationData } from "../../src/logic/it-1-br-2-1-1-1";

describe("ユーザーの食事記録と栄養摂取量の推移データを自動集計し、栄養項目別の達成度と改善ギャップを可視化するダッシュボード機能", () => {
  // SCEN-339
  test("同一家族成員・同一料理に対する重複エントリが適切にマージされる", () => {
    const familyMemberId = "FM001";
    const dishName = "カレーライス";
    const evaluationData = [
      {
        familyMemberId: familyMemberId,
        dishName: dishName,
        evaluationDateTime: new Date("2024-01-15T12:00:00Z"),
        evaluationScore: 4.5,
        remarks: "美味しかった",
      },
      {
        familyMemberId: familyMemberId,
        dishName: dishName,
        evaluationDateTime: new Date("2024-01-15T12:05:00Z"),
        evaluationScore: 4.0,
        remarks: "塩辛い",
      },
    ];

    const result = mergeAndPrepareMealEvaluationData(evaluationData);

    // マージ後のレコード数は1件に統合されることを検証
    expect(result.mergedRecords.length).toBe(1);

    // マージされたレコードが最新の評価情報を反映していることを検証
    expect(result.mergedRecords[0].familyMemberId).toBe(familyMemberId);
    expect(result.mergedRecords[0].dishName).toBe(dishName);

    // 最新の評価スコアが反映されていることを検証
    expect(result.mergedRecords[0].evaluationScore).toBe(4.0);

    // 最新の備考が反映されていることを検証
    expect(result.mergedRecords[0].remarks).toBe("塩辛い");

    // 最新のタイムスタンプが反映されていることを検証
    expect(result.mergedRecords[0].evaluationDateTime).toEqual(
      new Date("2024-01-15T12:05:00Z")
    );

    // 複数の評価データが履歴として保持されていることを検証
    expect(result.mergedRecords[0].evaluationHistory.length).toBe(2);
    expect(result.mergedRecords[0].evaluationHistory[0].evaluationScore).toBe(
      4.5
    );
    expect(result.mergedRecords[0].evaluationHistory[1].evaluationScore).toBe(
      4.0
    );

    // データベースに重複レコードが存在しないことを検証
    expect(result.duplicateRecordCount).toBe(0);

    // 嗜好学習のための前処理が正常に完了した状態であることを検証
    expect(result.preferenceReadyFlag).toBe(true);
    expect(result.processingStatus).toBe("completed");
  });
});