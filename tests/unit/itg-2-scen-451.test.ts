import { calculateDataReliabilityScore } from "../../src/logic/it-1-br-2-1-1-1";

describe("食費実績データの信頼性スコア算出機能", () => {
  // SCEN-451
  test("単一ソースのデータに対して信頼性スコアが正しく算出される", () => {
    // 単一ソースから取得した食費実績データを準備
    const singleSourceExpenseData = {
      sourceCount: 1,
      dataPoints: [
        {
          date: "2024-01-15",
          amount: 5000,
          category: "野菜",
          source: "献立アプリ",
        },
      ],
      hasValidationIssues: false,
      dataQualityScore: 95,
      completenessScore: 100,
      consistencyCheckPassed: true,
    };

    // 信頼性スコア算出機能を実行
    const reliabilityScore = calculateDataReliabilityScore(
      singleSourceExpenseData
    );

    // 算出された信頼性スコアが0～100の範囲内であることを検証
    expect(reliabilityScore).toBeGreaterThanOrEqual(0);
    expect(reliabilityScore).toBeLessThanOrEqual(100);

    // 単一ソースデータに対する信頼性スコアの計算ロジックが正しく適用されていることを確認
    // 単一ソースの場合、sourceCountの減点を適切に反映
    expect(typeof reliabilityScore).toBe("number");

    // 単一ソースの場合の標準スコア期待値は85（複数ソース統合がないため）
    expect(reliabilityScore).toBe(85);
  });

  // 複数ソースのデータとの比較検証
  test("複数ソースのデータに対する信頼性スコアが単一ソースより高くなること", () => {
    const singleSourceData = {
      sourceCount: 1,
      dataPoints: [
        {
          date: "2024-01-15",
          amount: 5000,
          category: "野菜",
          source: "献立アプリ",
        },
      ],
      hasValidationIssues: false,
      dataQualityScore: 95,
      completenessScore: 100,
      consistencyCheckPassed: true,
    };

    const multiSourceData = {
      sourceCount: 3,
      dataPoints: [
        {
          date: "2024-01-15",
          amount: 5000,
          category: "野菜",
          source: "献立アプリ",
        },
        {
          date: "2024-01-15",
          amount: 5050,
          category: "野菜",
          source: "栄養管理ダッシュボード",
        },
        {
          date: "2024-01-15",
          amount: 4950,
          category: "野菜",
          source: "食費管理システム",
        },
      ],
      hasValidationIssues: false,
      dataQualityScore: 95,
      completenessScore: 100,
      consistencyCheckPassed: true,
    };

    const singleScore = calculateDataReliabilityScore(singleSourceData);
    const multiScore = calculateDataReliabilityScore(multiSourceData);

    // 複数ソースの信頼性スコアが単一ソースより高いことを検証
    expect(multiScore).toBeGreaterThan(singleScore);
    expect(multiScore).toBe(92);
  });

  // エラーケース：データ品質が低い場合
  test("データ品質が低い場合は信頼性スコアが低く算出される", () => {
    const lowQualityData = {
      sourceCount: 1,
      dataPoints: [
        {
          date: "2024-01-15",
          amount: 5000,
          category: "野菜",
          source: "献立アプリ",
        },
      ],
      hasValidationIssues: true,
      dataQualityScore: 50,
      completenessScore: 60,
      consistencyCheckPassed: false,
    };

    const reliabilityScore = calculateDataReliabilityScore(lowQualityData);

    expect(reliabilityScore).toBeGreaterThanOrEqual(0);
    expect(reliabilityScore).toBeLessThanOrEqual(100);
    expect(reliabilityScore).toBe(38);
  });

  // 境界値テスト：完全に検証済みのデータ
  test("完全に検証済みの単一ソースデータに対して最高レベルの信頼性スコアが算出される", () => {
    const perfectSingleSourceData = {
      sourceCount: 1,
      dataPoints: [
        {
          date: "2024-01-15",
          amount: 5000,
          category: "野菜",
          source: "献立アプリ",
        },
      ],
      hasValidationIssues: false,
      dataQualityScore: 100,
      completenessScore: 100,
      consistencyCheckPassed: true,
    };

    const reliabilityScore = calculateDataReliabilityScore(
      perfectSingleSourceData
    );

    expect(reliabilityScore).toBe(90);
  });

  // エラーケース：無効なデータ構造
  test("無効なデータに対してはエラーがスローされる", () => {
    const invalidData = {
      sourceCount: 0,
      dataPoints: [],
      hasValidationIssues: true,
      dataQualityScore: -10,
      completenessScore: 0,
      consistencyCheckPassed: false,
    };

    expect(() => calculateDataReliabilityScore(invalidData)).toThrow(
      /信頼性スコア/
    );
  });
});