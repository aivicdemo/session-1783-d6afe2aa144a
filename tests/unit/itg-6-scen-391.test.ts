import { analyzeDropoffRatesByStep } from "../../src/logic/it-1-br-8-2-2-1";

describe("機能別使用頻度・離脱ポイント自動抽出・分析", () => {
  // SCEN-391: 献立生成フロー内の各ステップにおける離脱率を自動集計し、離脱ポイント毎の正確な頻度を算出する
  test("should accurately calculate dropoff rates and rank them in descending order", () => {
    // テストデータ準備: 献立生成フロー5ステップを通じた100ユーザーのセッションログ
    // ステップ1（食材入力）: 100人到達
    // ステップ2（栄養確認）: 95人到達（5人離脱）
    // ステップ3（調理時間確認）: 87人到達（8人離脱）
    // ステップ4（家族好み確認）: 75人到達（12人離脱）
    // ステップ5（献立確定）: 68人到達（7人離脱）
    // 献立確定完了: 65人（3人離脱）
    // 合計離脱数: 5 + 8 + 12 + 7 + 3 = 35人（全体の35%）

    const inputData = {
      totalUsers: 100,
      steps: [
        {
          stepId: 1,
          stepName: "食材入力",
          usersReachedCount: 100,
          usersDroppedCount: 5,
          collectionPeriodStart: "2024-01-01",
          collectionPeriodEnd: "2024-01-31",
        },
        {
          stepId: 2,
          stepName: "栄養確認",
          usersReachedCount: 95,
          usersDroppedCount: 8,
          collectionPeriodStart: "2024-01-01",
          collectionPeriodEnd: "2024-01-31",
        },
        {
          stepId: 3,
          stepName: "調理時間確認",
          usersReachedCount: 87,
          usersDroppedCount: 12,
          collectionPeriodStart: "2024-01-01",
          collectionPeriodEnd: "2024-01-31",
        },
        {
          stepId: 4,
          stepName: "家族好み確認",
          usersReachedCount: 75,
          usersDroppedCount: 7,
          collectionPeriodStart: "2024-01-01",
          collectionPeriodEnd: "2024-01-31",
        },
        {
          stepId: 5,
          stepName: "献立確定",
          usersReachedCount: 68,
          usersDroppedCount: 3,
          collectionPeriodStart: "2024-01-01",
          collectionPeriodEnd: "2024-01-31",
        },
      ],
    };

    // 自動集計機能を実行
    const result = analyzeDropoffRatesByStep(inputData);

    // 各ステップの離脱率を正確に計算（小数点第2位まで）
    // ステップ1: 5 / 100 = 0.05 = 5.00%
    // ステップ2: 8 / 95 = 0.0842... = 8.42%
    // ステップ3: 12 / 87 = 0.1379... = 13.79%
    // ステップ4: 7 / 75 = 0.0933... = 9.33%
    // ステップ5: 3 / 68 = 0.0441... = 4.41%

    // ステップの離脱率が正確に計算されたことを確認
    expect(result.stepAnalysis).toHaveLength(5);

    // 離脱率が小数点第2位まで正確に計算されていることを検証
    const step1 = result.stepAnalysis.find((s) => s.stepId === 1);
    expect(step1?.dropoffRate).toBe(5.0);

    const step2 = result.stepAnalysis.find((s) => s.stepId === 2);
    expect(step2?.dropoffRate).toBe(8.42);

    const step3 = result.stepAnalysis.find((s) => s.stepId === 3);
    expect(step3?.dropoffRate).toBe(13.79);

    const step4 = result.stepAnalysis.find((s) => s.stepId === 4);
    expect(step4?.dropoffRate).toBe(9.33);

    const step5 = result.stepAnalysis.find((s) => s.stepId === 5);
    expect(step5?.dropoffRate).toBe(4.41);

    // 離脱ポイント毎のランキング（降順）が正しく表示されていることを確認
    const rankedByDropoff = result.rankedDropoffPoints;
    expect(rankedByDropoff).toHaveLength(5);

    // ランキング順序の確認（降順）
    expect(rankedByDropoff[0].stepId).toBe(3); // 13.79% - 最高
    expect(rankedByDropoff[0].dropoffRate).toBe(13.79);
    expect(rankedByDropoff[0].dropoffCount).toBe(12);

    expect(rankedByDropoff[1].stepId).toBe(4); // 9.33%
    expect(rankedByDropoff[1].dropoffRate).toBe(9.33);
    expect(rankedByDropoff[1].dropoffCount).toBe(7);

    expect(rankedByDropoff[2].stepId).toBe(2); // 8.42%
    expect(rankedByDropoff[2].dropoffRate).toBe(8.42);
    expect(rankedByDropoff[2].dropoffCount).toBe(8);

    expect(rankedByDropoff[3].stepId).toBe(1); // 5.00%
    expect(rankedByDropoff[3].dropoffRate).toBe(5.0);
    expect(rankedByDropoff[3].dropoffCount).toBe(5);

    expect(rankedByDropoff[4].stepId).toBe(5); // 4.41% - 最低
    expect(rankedByDropoff[4].dropoffRate).toBe(4.41);
    expect(rankedByDropoff[4].dropoffCount).toBe(3);

    // 合計離脱数が正しく集計されていることを確認
    expect(result.totalDropoffCount).toBe(35);

    // 全体離脱率が正しく計算されていることを確認（35 / 100 = 35%）
    expect(result.overallDropoffRate).toBe(35.0);

    // エクスポート用のCSVデータが正しく生成されていることを確認
    expect(result.csvExportData).toBeDefined();
    expect(result.csvExportData).toContain("stepId,stepName,usersReachedCount");
    expect(result.csvExportData).toContain("1,食材入力,100,5,5.00");
    expect(result.csvExportData).toContain("2,栄養確認,95,8,8.42");
    expect(result.csvExportData).toContain("3,調理時間確認,87,12,13.79");
    expect(result.csvExportData).toContain("4,家族好み確認,75,7,9.33");
    expect(result.csvExportData).toContain("5,献立確定,68,3,4.41");

    // データの整合性を検証
    // 各ステップの離脱数の合計 = 35
    const sumOfDropoffs = result.stepAnalysis.reduce(
      (sum, step) => sum + step.dropoffCount,
      0
    );
    expect(sumOfDropoffs).toBe(35);

    // 全体の離脱ユーザー数がCSVと一致
    const csvLines = result.csvExportData.split("\n");
    const dataRows = csvLines.slice(1).filter((line) => line.trim() !== "");
    expect(dataRows).toHaveLength(5);
  });
});