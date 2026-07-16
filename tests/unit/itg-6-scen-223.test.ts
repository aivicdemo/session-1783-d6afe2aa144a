import { validateNutritionAlignmentAndMeasureImprovement } from "../../src/logic/it-8-1-1-1";

describe("栄養基準設定の改善効果検証", () => {
  test("SCEN-223: デプロイ後の献立提案栄養基準がユーザー実食事記録と一致して改善効果が定量的に測定される", () => {
    // ========== テストデータ準備 ==========
    // デプロイ前のユーザー実食事記録
    const preDeployUserMealRecords = [
      {
        userId: "user_001",
        mealDate: "2024-01-01",
        recordedNutrients: {
          protein_g: 45.2,
          fat_g: 52.8,
          carbohydrate_g: 210.5,
          vitamin_a_mcg: 580.0,
          vitamin_c_mg: 68.0,
          calcium_mg: 520.0,
          iron_mg: 8.2,
        },
      },
      {
        userId: "user_002",
        mealDate: "2024-01-01",
        recordedNutrients: {
          protein_g: 48.5,
          fat_g: 55.2,
          carbohydrate_g: 215.8,
          vitamin_a_mcg: 620.0,
          vitamin_c_mg: 72.5,
          calcium_mg: 540.0,
          iron_mg: 8.8,
        },
      },
    ];

    // デプロイ前の献목提案栄養基準（改善前）
    const preDeployProposedNutrients = [
      {
        userId: "user_001",
        proposedNutrients: {
          protein_g: 50.0,
          fat_g: 60.0,
          carbohydrate_g: 240.0,
          vitamin_a_mcg: 700.0,
          vitamin_c_mg: 80.0,
          calcium_mg: 600.0,
          iron_mg: 10.0,
        },
      },
      {
        userId: "user_002",
        proposedNutrients: {
          protein_g: 50.0,
          fat_g: 60.0,
          carbohydrate_g: 240.0,
          vitamin_a_mcg: 700.0,
          vitamin_c_mg: 80.0,
          calcium_mg: 600.0,
          iron_mg: 10.0,
        },
      },
    ];

    // デプロイ後のユーザー実食事記録
    const postDeployUserMealRecords = [
      {
        userId: "user_001",
        mealDate: "2024-02-15",
        recordedNutrients: {
          protein_g: 48.8,
          fat_g: 57.5,
          carbohydrate_g: 225.3,
          vitamin_a_mcg: 650.0,
          vitamin_c_mg: 75.0,
          calcium_mg: 580.0,
          iron_mg: 9.5,
        },
      },
      {
        userId: "user_002",
        mealDate: "2024-02-15",
        recordedNutrients: {
          protein_g: 49.2,
          fat_g: 58.8,
          carbohydrate_g: 228.0,
          vitamin_a_mcg: 680.0,
          vitamin_c_mg: 77.8,
          calcium_mg: 595.0,
          iron_mg: 9.8,
        },
      },
    ];

    // デプロイ後の献立提案栄養基準（改善後）
    const postDeployProposedNutrients = [
      {
        userId: "user_001",
        proposedNutrients: {
          protein_g: 48.0,
          fat_g: 58.0,
          carbohydrate_g: 225.0,
          vitamin_a_mcg: 650.0,
          vitamin_c_mg: 75.0,
          calcium_mg: 580.0,
          iron_mg: 9.5,
        },
      },
      {
        userId: "user_002",
        proposedNutrients: {
          protein_g: 49.0,
          fat_g: 58.5,
          carbohydrate_g: 228.0,
          vitamin_a_mcg: 680.0,
          vitamin_c_mg: 77.8,
          calcium_mg: 595.0,
          iron_mg: 9.8,
        },
      },
    ];

    // ========== テスト対象関数の呼び出し ==========
    const result = validateNutritionAlignmentAndMeasureImprovement({
      preDeployUserMealRecords,
      preDeployProposedNutrients,
      postDeployUserMealRecords,
      postDeployProposedNutrients,
    });

    // ========== 期待出力の計算 ==========
    // デプロイ前の乖離率計算
    // user_001:
    //   - protein: |45.2 - 50.0| / 50.0 = 4.8 / 50.0 = 0.096 = 9.6%
    //   - fat: |52.8 - 60.0| / 60.0 = 7.2 / 60.0 = 0.12 = 12.0%
    //   - carbohydrate: |210.5 - 240.0| / 240.0 = 29.5 / 240.0 = 0.1229 = 12.29%
    //   - vitamin_a: |580.0 - 700.0| / 700.0 = 120.0 / 700.0 = 0.1714 = 17.14%
    //   - vitamin_c: |68.0 - 80.0| / 80.0 = 12.0 / 80.0 = 0.15 = 15.0%
    //   - calcium: |520.0 - 600.0| / 600.0 = 80.0 / 600.0 = 0.1333 = 13.33%
    //   - iron: |8.2 - 10.0| / 10.0 = 1.8 / 10.0 = 0.18 = 18.0%
    //   user_001 avg: (9.6 + 12.0 + 12.29 + 17.14 + 15.0 + 13.33 + 18.0) / 7 = 97.36 / 7 = 13.91%
    //
    // user_002:
    //   - protein: |48.5 - 50.0| / 50.0 = 1.5 / 50.0 = 0.03 = 3.0%
    //   - fat: |55.2 - 60.0| / 60.0 = 4.8 / 60.0 = 0.08 = 8.0%
    //   - carbohydrate: |215.8 - 240.0| / 240.0 = 24.2 / 240.0 = 0.1008 = 10.08%
    //   - vitamin_a: |620.0 - 700.0| / 700.0 = 80.0 / 700.0 = 0.1143 = 11.43%
    //   - vitamin_c: |72.5 - 80.0| / 80.0 = 7.5 / 80.0 = 0.09375 = 9.375%
    //   - calcium: |540.0 - 600.0| / 600.0 = 60.0 / 600.0 = 0.10 = 10.0%
    //   - iron: |8.8 - 10.0| / 10.0 = 1.2 / 10.0 = 0.12 = 12.0%
    //   user_002 avg: (3.0 + 8.0 + 10.08 + 11.43 + 9.375 + 10.0 + 12.0) / 7 = 63.885 / 7 = 9.13%
    //
    // 全体のプリデプロイ平均乖離率: (13.91 + 9.13) / 2 = 23.04 / 2 = 11.52%

    // デプロイ後の乖離率計算
    // user_001:
    //   - protein: |48.8 - 48.0| / 48.0 = 0.8 / 48.0 = 0.0167 = 1.67%
    //   - fat: |57.5 - 58.0| / 58.0 = 0.5 / 58.0 = 0.0086 = 0.86%
    //   - carbohydrate: |225.3 - 225.0| / 225.0 = 0.3 / 225.0 = 0.0013 = 0.13%
    //   - vitamin_a: |650.0 - 650.0| / 650.0 = 0 / 650.0 = 0.0 = 0.0%
    //   - vitamin_c: |75.0 - 75.0| / 75.0 = 0 / 75.0 = 0.0 = 0.0%
    //   - calcium: |580.0 - 580.0| / 580.0 = 0 / 580.0 = 0.0 = 0.0%
    //   - iron: |9.5 - 9.5| / 9.5 = 0 / 9.5 = 0.0 = 0.0%
    //   user_001 avg: (1.67 + 0.86 + 0.13 + 0.0 + 0.0 + 0.0 + 0.0) / 7 = 2.66 / 7 = 0.38%
    //
    // user_002:
    //   - protein: |49.2 - 49.0| / 49.0 = 0.2 / 49.0 = 0.0041 = 0.41%
    //   - fat: |58.8 - 58.5| / 58.5 = 0.3 / 58.5 = 0.0051 = 0.51%
    //   - carbohydrate: |228.0 - 228.0| / 228.0 = 0 / 228.0 = 0.0 = 0.0%
    //   - vitamin_a: |680.0 - 680.0| / 680.0 = 0 / 680.0 = 0.0 = 0.0%
    //   - vitamin_c: |77.8 - 77.8| / 77.8 = 0 / 77.8 = 0.0 = 0.0%
    //   - calcium: |595.0 - 595.0| / 595.0 = 0 / 595.0 = 0.0 = 0.0%
    //   - iron: |9.8 - 9.8| / 9.8 = 0 / 9.8 = 0.0 = 0.0%
    //   user_002 avg: (0.41 + 0.51 + 0.0 + 0.0 + 0.0 + 0.0 + 0.0) / 7 = 0.92 / 7 = 0.13%
    //
    // 全体のポストデプロイ平均乖離率: (0.38 + 0.13) / 2 = 0.51 / 2 = 0.255%

    // 改善度合いの計算
    // 乖離率改善度 = ((プリデプロイ平均乖離率 - ポストデプロイ平均乖離率) / プリデプロイ平均乖離率) * 100
    // = ((11.52 - 0.255) / 11.52) * 100 = (11.265 / 11.52) * 100 = 0.9778 * 100 = 97.78%

    // 一致度スコア計算（100 - 乖離率）
    // プリデプロイ平均一致度スコア: 100 - 11.52 = 88.48
    // ポストデプロイ平均一致度スコア: 100 - 0.255 = 99.745

    // ========== アサーション ==========
    // 結果の構造を検証
    expect(result).toHaveProperty("preDeployDivergenceRate");
    expect(result).toHaveProperty("postDeployDivergenceRate");
    expect(result).toHaveProperty("improvementPercentage");
    expect(result).toHaveProperty("preDeployAlignmentScore");
    expect(result).toHaveProperty("postDeployAlignmentScore");
    expect(result).toHaveProperty("isSignificantImprovement");
    expect(result).toHaveProperty("userSegmentConsistency");

    // 具体値での検証
    expect(result.preDeployDivergenceRate).toBeCloseTo(11.52, 1);
    expect(result.postDeployDivergenceRate).toBeCloseTo(0.255, 2);
    expect(result.improvementPercentage).toBeCloseTo(97.78, 1);
    expect(result.preDeployAlignmentScore).toBeCloseTo(88.48, 1);
    expect(result.postDeployAlignmentScore).toBeCloseTo(99.745, 2);

    // 改善効果が5%以上であることを検証（ビジネスルール要件）
    expect(result.improvementPercentage).toBeGreaterThanOrEqual(5);

    // 統計的有意性を検証
    expect(result.isSignificantImprovement).toBe(true);

    // ユーザーセグメント全体での一致度スコアが有意に向上していることを検証
    expect(result.postDeployAlignmentScore).toBeGreaterThan(result.preDeployAlignmentScore);

    // ユーザーセグメント間での一貫性を検証
    expect(result.userSegmentConsistency).toHaveProperty("user_001");
    expect(result.userSegmentConsistency).toHaveProperty("user_002");
    expect(result.userSegmentConsistency.user_001.postDeployAlignmentScore).toBeCloseTo(99.62, 1);
    expect(result.userSegmentConsistency.user_002.postDeployAlignmentScore).toBeCloseTo(99.87, 1);

    // 両ユーザーセグメントでの改善効果の一貫性を検証
    const user_001_improvement =
      ((result.userSegmentConsistency.user_001.preDeployDivergenceRate -
        result.userSegmentConsistency.user_001.postDeployDivergenceRate) /
        result.userSegmentConsistency.user_001.preDeployDivergenceRate) *
      100;
    const user_002_improvement =
      ((result.userSegmentConsistency.user_002.preDeployDivergenceRate -
        result.userSegmentConsistency.user_002.postDeployDivergenceRate) /
        result.userSegmentConsistency.user_002.preDeployDivergenceRate) *
      100;

    expect(user_001_improvement).toBeGreaterThanOrEqual(5);
    expect(user_002_improvement).toBeGreaterThanOrEqual(5);

    // 栄養素ごとの乖離率改善を検証
    expect(result).toHaveProperty("nutrientLevelImprovement");
    expect(result.nutrientLevelImprovement).toHaveProperty("protein_g");
    expect(result.nutrientLevelImprovement).toHaveProperty("fat_g");
    expect(result.nutrientLevelImprovement).toHaveProperty("carbohydrate_g");
    expect(result.nutrientLevelImprovement).toHaveProperty("vitamin_a_mcg");
    expect(result.nutrientLevelImprovement).toHaveProperty("vitamin_c_mg");
    expect(result.nutrientLevelImprovement).toHaveProperty("calcium_mg");
    expect(result.nutrientLevelImprovement).toHaveProperty("iron_mg");

    // 全栄養素での改善を検証（5%以上改善されていることを確認）
    Object.values(result.nutrientLevelImprovement).forEach((improvement: number) => {
      expect(improvement).toBeGreaterThanOrEqual(5);
    });
  });
});