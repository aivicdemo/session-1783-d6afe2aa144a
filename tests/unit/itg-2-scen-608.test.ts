import { detectAndExcludeAnomalies } from "../../src/logic/it-1-br-2-1-1-1";

describe("ユーザーの食事記録と栄養摂取量の推移データを自動集計し、栄養項目別の達成度と改善ギャップを可視化するダッシュボード機能", () => {
  // SCEN-608: [edge] ユーザーデータの欠損値・異常値の自動検出と除外 - 全データが欠損値・異常値の場合に分析対象がゼロとなる境界ケースが正しくハンドルされる
  test("全データが欠損値・異常値の場合、システムが正常にハンドルされ、分析対象データゼロのメッセージと空グラフを表示する", () => {
    // 準備: テストデータセット - 全レコードが欠損値または異常値（100件以上）
    const anomalousDataSet = Array.from({ length: 105 }, (_, i) => ({
      recordId: `rec_${i + 1}`,
      userId: "user_test_001",
      nutritionItemId: "nut_protein",
      recordedValue: i % 2 === 0 ? -15.5 : null, // 欠損値またはネガティブ値
      recordDate: "2024-01-15",
      timestamp: new Date("2024-01-15T10:00:00Z").toISOString(),
      dataQualityFlag: "anomaly",
    }));

    // 実行: 欠損値・異常値の自動検出と除外処理
    const result = detectAndExcludeAnomalies({
      inputDataSet: anomalousDataSet,
      anomalyThresholds: {
        minValidValue: 0,
        maxValidValue: 500,
        allowNull: false,
      },
      analysisContext: {
        userId: "user_test_001",
        analysisStartDate: "2024-01-01",
        analysisEndDate: "2024-01-31",
        executionTimestamp: new Date("2024-01-15T11:00:00Z").toISOString(),
      },
    });

    // 検証: 分析対象データがゼロ件となった場合の正常なハンドリング
    expect(result.isSuccessful).toBe(true);
    expect(result.validRecordCount).toBe(0);
    expect(result.excludedRecordCount).toBe(105);
    expect(result.exclusionReasons).toContainEqual(
      expect.objectContaining({
        reasonCode: "negative_value",
        recordCount: expect.any(Number),
      })
    );
    expect(result.exclusionReasons).toContainEqual(
      expect.objectContaining({
        reasonCode: "null_value",
        recordCount: expect.any(Number),
      })
    );

    // 検証: メッセージ表示
    expect(result.userMessage).toMatch(/分析対象データがありません/);

    // 検証: グラフ・統計情報が空の状態
    expect(result.analysisOutput.graphData).toEqual([]);
    expect(result.analysisOutput.statisticalSummary).toEqual({
      meanValue: null,
      medianValue: null,
      stdDeviation: null,
      minValue: null,
      maxValue: null,
    });

    // 検証: ログに除外データの件数と理由が記録されている
    expect(result.auditLog).toEqual(
      expect.objectContaining({
        totalInputRecords: 105,
        totalValidRecords: 0,
        totalExcludedRecords: 105,
        processedAt: expect.stringMatching(
          /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/
        ),
        userId: "user_test_001",
      })
    );
    expect(result.auditLog.exclusionDetails).toHaveLength(2);
    expect(result.auditLog.exclusionDetails).toContainEqual(
      expect.objectContaining({
        reason: "negative_value",
        count: expect.any(Number),
      })
    );
    expect(result.auditLog.exclusionDetails).toContainEqual(
      expect.objectContaining({
        reason: "null_value",
        count: expect.any(Number),
      })
    );

    // 検証: システムが安定した状態を保ち、応答時間が正常範囲内
    expect(result.processingTimeMs).toBeLessThan(5000);
    expect(result.systemStatus).toBe("stable");
  });
});