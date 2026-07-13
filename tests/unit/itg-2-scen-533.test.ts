import { calculateNutritionAchievementComparison } from "../../src/logic/it-1-br-2-1-1-1";

describe("栄養項目別達成度比較機能", () => {
  test("SCEN-533: 改善後1週間以上のデータから栄養項目別達成度と改善前後の効果差が定量比較される", () => {
    // 改善前期間のデータ（7日分）
    const preImprovementData = [
      { date: "2024-01-01", protein: 45.0, calcium: 600, vitaminC: 55.0 },
      { date: "2024-01-02", protein: 48.0, calcium: 620, vitaminC: 60.0 },
      { date: "2024-01-03", protein: 42.0, calcium: 580, vitaminC: 50.0 },
      { date: "2024-01-04", protein: 50.0, calcium: 650, vitaminC: 65.0 },
      { date: "2024-01-05", protein: 46.0, calcium: 610, vitaminC: 58.0 },
      { date: "2024-01-06", protein: 44.0, calcium: 590, vitaminC: 52.0 },
      { date: "2024-01-07", protein: 47.0, calcium: 630, vitaminC: 63.0 },
    ];

    // 改善後期間のデータ（7日分）
    const postImprovementData = [
      { date: "2024-02-01", protein: 55.0, calcium: 750, vitaminC: 78.0 },
      { date: "2024-02-02", protein: 58.0, calcium: 780, vitaminC: 82.0 },
      { date: "2024-02-03", protein: 56.0, calcium: 760, vitaminC: 80.0 },
      { date: "2024-02-04", protein: 60.0, calcium: 800, vitaminC: 85.0 },
      { date: "2024-02-05", protein: 57.0, calcium: 770, vitaminC: 81.0 },
      { date: "2024-02-06", protein: 54.0, calcium: 740, vitaminC: 76.0 },
      { date: "2024-02-07", protein: 59.0, calcium: 790, vitaminC: 84.0 },
    ];

    // 栄養基準値
    const nutritionStandards = {
      protein: 60.0,
      calcium: 800,
      vitaminC: 100.0,
    };

    // 比較対象の栄養項目
    const selectedNutrients = ["protein", "calcium", "vitaminC"];

    const result = calculateNutritionAchievementComparison(
      preImprovementData,
      postImprovementData,
      nutritionStandards,
      selectedNutrients
    );

    // 改善前のタンパク質平均: (45+48+42+50+46+44+47) / 7 = 46.0
    // 改善前のタンパク質達成度: (46.0 / 60.0) * 100 = 76.7%
    expect(result.preImprovement.protein.achievementPercentage).toBe(76.7);

    // 改善前のカルシウム平均: (600+620+580+650+610+590+630) / 7 = 611.4
    // 改善前のカルシウム達成度: (611.4 / 800) * 100 = 76.4%
    expect(result.preImprovement.calcium.achievementPercentage).toBeCloseTo(
      76.4,
      1
    );

    // 改善前のビタミンC平均: (55+60+50+65+58+52+63) / 7 = 57.4
    // 改善前のビタミンC達成度: (57.4 / 100.0) * 100 = 57.4%
    expect(result.preImprovement.vitaminC.achievementPercentage).toBeCloseTo(
      57.4,
      1
    );

    // 改善後のタンパク質平均: (55+58+56+60+57+54+59) / 7 = 57.0
    // 改善後のタンパク質達成度: (57.0 / 60.0) * 100 = 95.0%
    expect(result.postImprovement.protein.achievementPercentage).toBe(95.0);

    // 改善後のカルシウム平均: (750+780+760+800+770+740+790) / 7 = 770.0
    // 改善後のカルシウム達成度: (770.0 / 800) * 100 = 96.3%
    expect(result.postImprovement.calcium.achievementPercentage).toBeCloseTo(
      96.3,
      1
    );

    // 改善後のビタミンC平均: (78+82+80+85+81+76+84) / 7 = 80.7
    // 改善後のビタミンC達成度: (80.7 / 100.0) * 100 = 80.7%
    expect(result.postImprovement.vitaminC.achievementPercentage).toBeCloseTo(
      80.7,
      1
    );

    // タンパク質の効果差: 95.0 - 76.7 = 18.3
    expect(result.effectDifference.protein.absoluteDifference).toBe(18.3);

    // タンパク質の増減率: (18.3 / 76.7) * 100 = 23.9%
    expect(result.effectDifference.protein.percentageDifference).toBeCloseTo(
      23.9,
      1
    );

    // カルシウムの効果差: 96.3 - 76.4 = 19.9
    expect(result.effectDifference.calcium.absoluteDifference).toBeCloseTo(
      19.9,
      1
    );

    // カルシウムの増減率: (19.9 / 76.4) * 100 = 26.0%
    expect(result.effectDifference.calcium.percentageDifference).toBeCloseTo(
      26.0,
      1
    );

    // ビタミンCの効果差: 80.7 - 57.4 = 23.3
    expect(result.effectDifference.vitaminC.absoluteDifference).toBeCloseTo(
      23.3,
      1
    );

    // ビタミンCの増減率: (23.3 / 57.4) * 100 = 40.6%
    expect(result.effectDifference.vitaminC.percentageDifference).toBeCloseTo(
      40.6,
      1
    );

    // 結果に複数項目の比較データが含まれることを確認
    expect(result.comparisonData).toBeDefined();
    expect(result.comparisonData.length).toBe(3);

    // 各項目の比較データが正しい構造を持つことを確認
    result.comparisonData.forEach((item: any) => {
      expect(item.nutrient).toBeDefined();
      expect(item.preAchievementPercentage).toBeDefined();
      expect(item.postAchievementPercentage).toBeDefined();
      expect(item.effectDifference).toBeDefined();
      expect(item.effectPercentageChange).toBeDefined();
    });

    // グラフデータが生成されていることを確認
    expect(result.graphData).toBeDefined();
    expect(result.graphData.labels).toEqual([
      "protein",
      "calcium",
      "vitaminC",
    ]);
    expect(result.graphData.preImprovementDataset).toEqual([76.7, 76.4, 57.4]);
    expect(result.graphData.postImprovementDataset).toEqual([95.0, 96.3, 80.7]);

    // テーブル形式データが生成されていることを確認
    expect(result.tableData).toBeDefined();
    expect(result.tableData.length).toBe(3);
  });
});