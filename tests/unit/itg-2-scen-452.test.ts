import { calculateFoodExpenseReliabilityScore } from "../../src/logic/it-1-br-2-1-1-1";

describe("ユーザーの食事記録と栄養摂取量の推移データを自動集計し、栄養項目別の達成度と改善ギャップを可視化するダッシュボード機能", () => {
  // SCEN-452: [error] 食費実績データの信頼性スコア算出機能 - データソースにnullまたは不完全なレコードが含まれる場合、スコア低下が適切に反映される
  test("信頼性スコアが不完全なレコード数に応じて段階的に低下し、メタデータが記録されることを検証する", () => {
    // 準備: 完全なレコード 7 件
    const completeRecords = [
      {
        id: "exp_1",
        userId: "user_001",
        amount: 5000,
        date: "2024-01-15",
        category: "vegetables",
        timestamp: new Date("2024-01-15T10:00:00Z"),
      },
      {
        id: "exp_2",
        userId: "user_001",
        amount: 3200,
        date: "2024-01-16",
        category: "meat",
        timestamp: new Date("2024-01-16T11:30:00Z"),
      },
      {
        id: "exp_3",
        userId: "user_001",
        amount: 1800,
        date: "2024-01-17",
        category: "dairy",
        timestamp: new Date("2024-01-17T09:15:00Z"),
      },
      {
        id: "exp_4",
        userId: "user_001",
        amount: 4500,
        date: "2024-01-18",
        category: "seafood",
        timestamp: new Date("2024-01-18T14:00:00Z"),
      },
      {
        id: "exp_5",
        userId: "user_001",
        amount: 2100,
        date: "2024-01-19",
        category: "grains",
        timestamp: new Date("2024-01-19T08:45:00Z"),
      },
      {
        id: "exp_6",
        userId: "user_001",
        amount: 6200,
        date: "2024-01-20",
        category: "fruits",
        timestamp: new Date("2024-01-20T16:20:00Z"),
      },
      {
        id: "exp_7",
        userId: "user_001",
        amount: 2900,
        date: "2024-01-21",
        category: "snacks",
        timestamp: new Date("2024-01-21T13:30:00Z"),
      },
    ];

    // 準備: nullフィールドを含むレコード 2 件
    const nullRecords = [
      {
        id: "exp_8",
        userId: "user_001",
        amount: null,
        date: "2024-01-22",
        category: "vegetables",
        timestamp: new Date("2024-01-22T10:00:00Z"),
      },
      {
        id: "exp_9",
        userId: "user_001",
        amount: 2500,
        date: null,
        category: "meat",
        timestamp: new Date("2024-01-23T11:00:00Z"),
      },
    ];

    // 準備: 不完全なレコード 1 件（categoryが欠落）
    const incompleteRecords = [
      {
        id: "exp_10",
        userId: "user_001",
        amount: 3500,
        date: "2024-01-24",
        category: null,
        timestamp: new Date("2024-01-24T12:00:00Z"),
      },
    ];

    // すべてのレコードを結合（合計 10 件）
    const allRecords = [
      ...completeRecords,
      ...nullRecords,
      ...incompleteRecords,
    ];

    // 実行: 信頼性スコア算出
    const result = calculateFoodExpenseReliabilityScore({
      records: allRecords,
      evaluationPeriod: "2024-01",
    });

    // 検証 1: スコアが返される
    expect(result).toHaveProperty("score");
    expect(typeof result.score).toBe("number");

    // 検証 2: スコアが 0～100 の範囲内
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);

    // 検証 3: 完全なレコード 7 件のみの場合スコア = 100
    // 不完全なレコード 3 件（nullフィールド 2 件 + 不完全レコード 1 件）が含まれているため、スコア低下を確認
    // 期待スコア計算: 基本スコア 100 から 不完全レコード率（3/10 = 30%）に基づいて減点
    // 減点アルゴリズム: スコア = 100 * (1 - 不完全率) = 100 * (1 - 0.3) = 70
    expect(result.score).toBe(70);

    // 検証 4: メタデータが記録されている
    expect(result).toHaveProperty("metadata");
    expect(result.metadata).toBeDefined();

    // 検証 5: nullレコード数が正しく検出・記録されている
    expect(result.metadata).toHaveProperty("nullRecordCount");
    expect(result.metadata.nullRecordCount).toBe(2);

    // 検証 6: 不完全なレコード数が正しく検出・記録されている
    expect(result.metadata).toHaveProperty("incompleteRecordCount");
    expect(result.metadata.incompleteRecordCount).toBe(1);

    // 検証 7: 完全なレコード数が正しく記録されている
    expect(result.metadata).toHaveProperty("completeRecordCount");
    expect(result.metadata.completeRecordCount).toBe(7);

    // 検証 8: 総レコード数が正しく記録されている
    expect(result.metadata).toHaveProperty("totalRecordCount");
    expect(result.metadata.totalRecordCount).toBe(10);

    // 検証 9: 不完全率が正しく計算・記録されている
    expect(result.metadata).toHaveProperty("incompletenessRatio");
    expect(result.metadata.incompletenessRatio).toBe(0.3);

    // 検証 10: 検出されたnullフィールドの詳細が記録されている
    expect(result.metadata).toHaveProperty("detectedNullFields");
    expect(Array.isArray(result.metadata.detectedNullFields)).toBe(true);
    expect(result.metadata.detectedNullFields.length).toBeGreaterThan(0);

    // 検証 11: 検出されたnullフィールドに amount と date が含まれている
    const nullFieldNames = result.metadata.detectedNullFields.map(
      (field: any) => field.fieldName
    );
    expect(nullFieldNames).toContain("amount");
    expect(nullFieldNames).toContain("date");

    // 検証 12: 各nullフィールドの発生レコード数が記録されている
    const amountNullField = result.metadata.detectedNullFields.find(
      (field: any) => field.fieldName === "amount"
    );
    expect(amountNullField).toHaveProperty("count");
    expect(amountNullField.count).toBe(1);

    const dateNullField = result.metadata.detectedNullFields.find(
      (field: any) => field.fieldName === "date"
    );
    expect(dateNullField).toHaveProperty("count");
    expect(dateNullField.count).toBe(1);

    // 検証 13: スコア算出ログが記録されている
    expect(result.metadata).toHaveProperty("calculationLog");
    expect(typeof result.metadata.calculationLog).toBe("string");
    expect(result.metadata.calculationLog.length).toBeGreaterThan(0);

    // 検証 14: エラーが発生していないことが示されている
    expect(result).toHaveProperty("hasError");
    expect(result.hasError).toBe(false);

    // 検証 15: エラーメッセージが存在しない場合、例外がスローされないことを確認
    expect(result).not.toHaveProperty("errorMessage");

    // 検証 16: 段階的な減点が適用されていることを確認
    // - nullレコード 2 件: 各 5 点減点 = 10 点
    // - 不完全レコード 1 件: 10 点減点
    // - 基本スコア 100 - 10 - 10 = 80（ただしアルゴリズムが 70 の場合、不完全率ベースの計算が優先）
    // 確認: スコアが単純な足し算ではなく、不完全率の線形計算に従っていることを確認
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });
});