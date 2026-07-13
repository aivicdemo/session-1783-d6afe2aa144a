import { detectAndCleanUserNutritionData } from "../../src/logic/it-1-br-2-1-1-1";

describe("ユーザー食事記録と栄養摂取量の推移分析・栄養基準ロジック検証", () => {
  // SCEN-609
  test("ユーザーデータの除外・補正による信頼性確保 - 検出された欠損値・異常値が分析対象から正しく除外または補正される", () => {
    // テスト用入力データセット：欠損値と異常値を含む栄養摂取ログ
    const inputDataset = [
      {
        user_id: "user_001",
        date: "2024-01-15",
        calorie: 2000,
        protein: 50,
        fat: 60,
        carbohydrate: 250,
      },
      {
        user_id: "user_002",
        date: "2024-01-15",
        calorie: null, // 欠損値：カロリー
        protein: 45,
        fat: 55,
        carbohydrate: 240,
      },
      {
        user_id: "user_003",
        date: "2024-01-15",
        calorie: -500, // 異常値：負のカロリー
        protein: 50,
        fat: 60,
        carbohydrate: 250,
      },
      {
        user_id: "user_004",
        date: "2024-01-15",
        calorie: 10000, // 異常値：あり得ない高値（基準上限 3500kcal）
        protein: 50,
        fat: 60,
        carbohydrate: 250,
      },
      {
        user_id: "user_005",
        date: "2024-01-15",
        calorie: 1800,
        protein: null, // 欠損値：タンパク質
        fat: 55,
        carbohydrate: 220,
      },
      {
        user_id: "user_006",
        date: "2024-01-15",
        calorie: 2100,
        protein: -20, // 異常値：負のタンパク質
        fat: 60,
        carbohydrate: 260,
      },
      {
        user_id: "user_007",
        date: "2024-01-15",
        calorie: 1950,
        protein: 48,
        fat: 58,
        carbohydrate: 240,
      },
    ];

    // データ品質チェックと清浄化処理を実行
    const cleaningResult = detectAndCleanUserNutritionData(inputDataset);

    // 欠損値の検出数：2件（user_002のcalorie、user_005のprotein）
    expect(cleaningResult.missing_value_count).toBe(2);

    // 異常値の検出数：3件（user_003のcalorie負値、user_004のcalorie高値、user_006のprotein負値）
    expect(cleaningResult.anomaly_value_count).toBe(3);

    // 除外対象レコード数：欠損値3件＋異常値3件＝6件（ただし除外ルール適用により実際は5件として計上）
    // 除外ルール：完全欠損行は除外、異常値行も除外
    expect(cleaningResult.excluded_record_count).toBe(5);

    // 分析対象に残るレコード数：7件入力 - 5件除外 = 2件（実際は修正される可能性あり）
    expect(cleaningResult.valid_record_count).toBe(2);

    // 除外されたレコードのリスト（user_id, 理由）
    expect(cleaningResult.excluded_records).toEqual([
      {
        user_id: "user_002",
        reason: "missing_calorie",
      },
      {
        user_id: "user_003",
        reason: "negative_calorie",
      },
      {
        user_id: "user_004",
        reason: "calorie_exceeds_upper_limit",
      },
      {
        user_id: "user_005",
        reason: "missing_protein",
      },
      {
        user_id: "user_006",
        reason: "negative_protein",
      },
    ]);

    // 清浄化されたデータセット（除外後の有効データ）
    expect(cleaningResult.cleaned_dataset).toEqual([
      {
        user_id: "user_001",
        date: "2024-01-15",
        calorie: 2000,
        protein: 50,
        fat: 60,
        carbohydrate: 250,
      },
      {
        user_id: "user_007",
        date: "2024-01-15",
        calorie: 1950,
        protein: 48,
        fat: 58,
        carbohydrate: 240,
      },
    ]);

    // 統計値：除外・補正前後での比較
    // 除外前全体：平均カロリー = (2000+null+(-500)+10000+1800+2100+1950) / 7
    // 除外後有効データのみ：平均カロリー = (2000+1950) / 2 = 1975
    expect(cleaningResult.statistics.avg_calorie_after_cleaning).toBe(1975);

    // 除外後有効データの平均タンパク質 = (50+48) / 2 = 49
    expect(cleaningResult.statistics.avg_protein_after_cleaning).toBe(49);

    // 除外後有効データの平均脂質 = (60+58) / 2 = 59
    expect(cleaningResult.statistics.avg_fat_after_cleaning).toBe(59);

    // 除外後有効データの平均炭水化物 = (250+240) / 2 = 245
    expect(cleaningResult.statistics.avg_carbohydrate_after_cleaning).toBe(245);

    // データ品質スコア（0～100）：有効レコード率 = 2/7 ≈ 28.57% → スコアは品質評価ロジック依存
    // ここでは検出と除外が正常に機能していることを確認
    expect(cleaningResult.data_quality_score).toBeGreaterThanOrEqual(0);
    expect(cleaningResult.data_quality_score).toBeLessThanOrEqual(100);

    // 信頼性スコア（0～100）：除外・補正ルール適用が正常に機能していることの指標
    expect(cleaningResult.reliability_score).toBeGreaterThan(50); // 有効データが存在し、除外・補正が完了している

    // 分析ログ：除外・補正の詳細が記録されていることを確認
    expect(cleaningResult.analysis_log).toBeDefined();
    expect(cleaningResult.analysis_log.length).toBeGreaterThan(0);
    expect(cleaningResult.analysis_log).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/user_002/),
        expect.stringMatching(/user_003/),
        expect.stringMatching(/user_004/),
        expect.stringMatching(/user_005/),
        expect.stringMatching(/user_006/),
      ])
    );

    // 分析実行可能性の判定：有効データが存在するため分析実行が可能
    expect(cleaningResult.can_proceed_analysis).toBe(true);

    // エラーケース：空のデータセットが渡された場合、警告を発生
    const emptyDataset: any[] = [];
    expect(() => detectAndCleanUserNutritionData(emptyDataset)).toThrow(
      /データセット/
    );

    // エラーケース：必須フィールドが欠落した不正なデータセット
    const invalidDataset = [
      {
        user_id: "user_001",
        date: "2024-01-15",
        // calorie フィールドが存在しない
        protein: 50,
        fat: 60,
        carbohydrate: 250,
      },
    ];
    expect(() => detectAndCleanUserNutritionData(invalidDataset)).toThrow(
      /必須フィールド/
    );
  });
});