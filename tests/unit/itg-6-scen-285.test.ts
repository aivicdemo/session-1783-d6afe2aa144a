import { identifyFailurePatterns } from "../../src/logic/it-8-1-1-1";

describe("失敗パターン分析機能 - 頻出度閾値以下の理由は失敗パターンに含まれない", () => {
  // SCEN-285
  test("頻出度が閾値以下の失敗理由を除外し、閾値超過のみを失敗パターンとして抽出する", () => {
    // Precondition: 失敗パターン分析機能を初期化
    const frequencyThreshold = 5;

    // Test data: 複数の失敗理由を準備し、うち1件以上が閾値以下
    const failureReasons = [
      { reasonId: "R001", category: "栄養バランス", frequency: 12, description: "タンパク質不足" },
      { reasonId: "R002", category: "栄養バランス", frequency: 8, description: "脂質過多" },
      { reasonId: "R003", category: "家族好み未反映", frequency: 3, description: "子どもが嫌いな野菜" },
      { reasonId: "R004", category: "調理時間超過", frequency: 15, description: "下準備時間長い" },
      { reasonId: "R005", category: "食材制限漏れ", frequency: 2, description: "アレルギー見落とし" },
      { reasonId: "R006", category: "調理時間超過", frequency: 6, description: "調理工程が多い" },
      { reasonId: "R007", category: "家族好み未反映", frequency: 4, description: "配偶者の好み未反映" },
    ];

    // Execute: 失敗パターン分析処理を実行
    const result = identifyFailurePatterns({
      failureReasons,
      frequencyThreshold,
    });

    // Verify: 閾値以下の理由が結果に含まれていないことを確認
    const resultReasonIds = result.failurePatterns.map((p) => p.reasonId);
    expect(resultReasonIds).not.toContain("R003"); // frequency=3 < threshold=5
    expect(resultReasonIds).not.toContain("R005"); // frequency=2 < threshold=5
    expect(resultReasonIds).not.toContain("R007"); // frequency=4 < threshold=5

    // Verify: 閾値を超える理由のみが結果に含まれていることを確認
    expect(resultReasonIds).toContain("R001"); // frequency=12 >= threshold=5
    expect(resultReasonIds).toContain("R002"); // frequency=8 >= threshold=5
    expect(resultReasonIds).toContain("R004"); // frequency=15 >= threshold=5
    expect(resultReasonIds).toContain("R006"); // frequency=6 >= threshold=5

    // Verify: 抽出された失敗パターン数の確認
    expect(result.failurePatterns).toHaveLength(4);

    // Verify: 抽出された失敗パターンが正しい構造を持つ
    expect(result.failurePatterns[0]).toEqual(
      expect.objectContaining({
        reasonId: expect.any(String),
        category: expect.any(String),
        frequency: expect.any(Number),
        description: expect.any(String),
      })
    );

    // Verify: 除外された理由の確認
    expect(result.excludedReasons).toHaveLength(3);
    const excludedIds = result.excludedReasons.map((r) => r.reasonId);
    expect(excludedIds).toEqual(expect.arrayContaining(["R003", "R005", "R007"]));

    // Verify: 除外理由に閾値情報が含まれている
    result.excludedReasons.forEach((excluded) => {
      expect(excluded.frequency).toBeLessThanOrEqual(frequencyThreshold);
      expect(excluded.excludeReason).toBe("frequency_below_threshold");
    });

    // Verify: 分析メタデータの確認
    expect(result.analysisMetadata).toEqual(
      expect.objectContaining({
        appliedThreshold: frequencyThreshold,
        totalInputReasons: 7,
        extractedPatterns: 4,
        excludedCount: 3,
        analysisTimestamp: expect.any(String),
      })
    );

    // Verify: 抽出された失敗パターンが頻度順ソート済み
    const frequencies = result.failurePatterns.map((p) => p.frequency);
    expect(frequencies).toEqual([15, 12, 8, 6]);
  });
});