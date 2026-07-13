import { analyzeNutritionGapAndGenerateProposal } from "../../src/logic/it-1-br-2-1-1-1";

describe("需要予測精度の乖離分析と自動改善提案生成 - 実績データ欠損時のエラーハンドリング", () => {
  // SCEN-370
  test("実績データが欠損している場合、適切なエラー処理と詳細ログが実行される", () => {
    const testTimestamp = new Date("2024-01-15T11:00:00Z");
    
    // 欠損データを含むテストケース
    const incompletePerformanceData = {
      userId: "user_001",
      measurementDate: "2024-01-15",
      nutritionMetrics: [
        {
          nutrientId: "protein_001",
          targetValue: 60,
          actualValue: 55, // 正常なデータ
          unit: "g"
        },
        {
          nutrientId: "calcium_002",
          targetValue: 800,
          actualValue: null, // 欠損: 実績値がnull
          unit: "mg"
        },
        {
          nutrientId: "iron_003",
          targetValue: 8,
          actualValue: undefined, // 欠損: 実績値がundefined
          unit: "mg"
        }
      ],
      mealRecordCount: 2,
      recordingTimestamp: testTimestamp.toISOString()
    };

    // 期待される欠損検出結果
    const expectedMissingFields = [
      {
        nutrientId: "calcium_002",
        fieldName: "actualValue",
        recordType: "nutrition_metric"
      },
      {
        nutrientId: "iron_003",
        fieldName: "actualValue",
        recordType: "nutrition_metric"
      }
    ];

    // エラーをスロー
    expect(() => {
      analyzeNutritionGapAndGenerateProposal(incompletePerformanceData);
    }).toThrow(/実績データ欠損/);

    // エラー処理のログ検証
    expect(() => {
      analyzeNutritionGapAndGenerateProposal(incompletePerformanceData);
    }).toThrow(/2件の欠損データを検出/);
  });

  test("全てのメトリクスが欠損している場合、包括的なエラー情報を返す", () => {
    const testTimestamp = new Date("2024-01-15T11:00:00Z");

    const completelyMissingData = {
      userId: "user_002",
      measurementDate: "2024-01-15",
      nutritionMetrics: [
        {
          nutrientId: "protein_001",
          targetValue: 60,
          actualValue: null, // 欠損
          unit: "g"
        },
        {
          nutrientId: "calcium_002",
          targetValue: 800,
          actualValue: null, // 欠損
          unit: "mg"
        },
        {
          nutrientId: "iron_003",
          targetValue: 8,
          actualValue: null, // 欠損
          unit: "mg"
        }
      ],
      mealRecordCount: 0,
      recordingTimestamp: testTimestamp.toISOString()
    };

    expect(() => {
      analyzeNutritionGapAndGenerateProposal(completelyMissingData);
    }).toThrow(/実績データ欠損/);

    expect(() => {
      analyzeNutritionGapAndGenerateProposal(completelyMissingData);
    }).toThrow(/3件の欠損データを検出/);
  });

  test("部分欠損の場合、欠損箇所を特定してエラーメッセージに含める", () => {
    const testTimestamp = new Date("2024-01-15T11:00:00Z");

    const partiallyMissingData = {
      userId: "user_003",
      measurementDate: "2024-01-15",
      nutritionMetrics: [
        {
          nutrientId: "protein_001",
          targetValue: 60,
          actualValue: 58,
          unit: "g"
        },
        {
          nutrientId: "carbs_004",
          targetValue: 300,
          actualValue: null, // 欠損: 炭水化物
          unit: "g"
        }
      ],
      mealRecordCount: 1,
      recordingTimestamp: testTimestamp.toISOString()
    };

    expect(() => {
      analyzeNutritionGapAndGenerateProposal(partiallyMissingData);
    }).toThrow(/実績データ欠損/);

    expect(() => {
      analyzeNutritionGapAndGenerateProposal(partiallyMissingData);
    }).toThrow(/carbs_004/);
  });

  test("正常なデータの場合、達成度スコアと改善ギャップを正常に計算して返す", () => {
    const testTimestamp = new Date("2024-01-15T11:00:00Z");

    const validPerformanceData = {
      userId: "user_004",
      measurementDate: "2024-01-15",
      nutritionMetrics: [
        {
          nutrientId: "protein_001",
          targetValue: 60,
          actualValue: 54,
          unit: "g"
        },
        {
          nutrientId: "calcium_002",
          targetValue: 800,
          actualValue: 720,
          unit: "mg"
        },
        {
          nutrientId: "iron_003",
          targetValue: 8,
          actualValue: 7.2,
          unit: "mg"
        }
      ],
      mealRecordCount: 3,
      recordingTimestamp: testTimestamp.toISOString()
    };

    const result = analyzeNutritionGapAndGenerateProposal(validPerformanceData);

    // 期待される達成度スコア計算:
    // protein: (54/60) * 100 = 90
    // calcium: (720/800) * 100 = 90
    // iron: (7.2/8) * 100 = 90
    // 総合スコア: (90 + 90 + 90) / 3 = 90
    expect(result.totalAchievementScore).toBe(90);
    expect(result.achievementScores).toEqual({
      protein_001: 90,
      calcium_002: 90,
      iron_003: 90
    });

    // 改善ギャップ計算:
    // protein: 60 - 54 = 6
    // calcium: 800 - 720 = 80
    // iron: 8 - 7.2 = 0.8
    expect(result.improvementGaps).toEqual({
      protein_001: 6,
      calcium_002: 80,
      iron_003: 0.8
    });

    expect(result.status).toBe("success");
    expect(result.proposalGenerated).toBe(true);
  });

  test("達成度が異なる複数の栄養項目で、優先度付けが正しく実行される", () => {
    const testTimestamp = new Date("2024-01-15T11:00:00Z");

    const mixedPerformanceData = {
      userId: "user_005",
      measurementDate: "2024-01-15",
      nutritionMetrics: [
        {
          nutrientId: "protein_001",
          targetValue: 60,
          actualValue: 45,
          unit: "g"
        },
        {
          nutrientId: "calcium_002",
          targetValue: 800,
          actualValue: 760,
          unit: "mg"
        },
        {
          nutrientId: "iron_003",
          targetValue: 8,
          actualValue: 2,
          unit: "mg"
        }
      ],
      mealRecordCount: 2,
      recordingTimestamp: testTimestamp.toISOString()
    };

    const result = analyzeNutritionGapAndGenerateProposal(mixedPerformanceData);

    // 期待される達成度スコア:
    // protein: (45/60) * 100 = 75
    // calcium: (760/800) * 100 = 95
    // iron: (2/8) * 100 = 25
    // 総合: (75 + 95 + 25) / 3 ≈ 65
    expect(result.totalAchievementScore).toBe(65);

    // 優先度付け: iron (gap: 6) > protein (gap: 15) > calcium (gap: 40)
    expect(result.prioritizedImprovementItems[0]).toEqual({
      nutrientId: "iron_003",
      gap: 6,
      achievementScore: 25,
      priority: 1
    });
    expect(result.prioritizedImprovementItems[1]).toEqual({
      nutrientId: "protein_001",
      gap: 15,
      achievementScore: 75,
      priority: 2
    });
    expect(result.prioritizedImprovementItems[2]).toEqual({
      nutrientId: "calcium_002",
      gap: 40,
      achievementScore: 95,
      priority: 3
    });
  });

  test("userId が空文字列または欠損している場合、ユーザー識別エラーを返す", () => {
    const testTimestamp = new Date("2024-01-15T11:00:00Z");

    const missingUserIdData = {
      userId: "",
      measurementDate: "2024-01-15",
      nutritionMetrics: [
        {
          nutrientId: "protein_001",
          targetValue: 60,
          actualValue: 54,
          unit: "g"
        }
      ],
      mealRecordCount: 1,
      recordingTimestamp: testTimestamp.toISOString()
    };

    expect(() => {
      analyzeNutritionGapAndGenerateProposal(missingUserIdData);
    }).toThrow(/ユーザーID/);
  });

  test("測定日付が無効な場合、日付フォーマットエラーを返す", () => {
    const testTimestamp = new Date("2024-01-15T11:00:00Z");

    const invalidDateData = {
      userId: "user_006",
      measurementDate: "invalid-date",
      nutritionMetrics: [
        {
          nutrientId: "protein_001",
          targetValue: 60,
          actualValue: 54,
          unit: "g"
        }
      ],
      mealRecordCount: 1,
      recordingTimestamp: testTimestamp.toISOString()
    };

    expect(() => {
      analyzeNutritionGapAndGenerateProposal(invalidDateData);
    }).toThrow(/測定日付/);
  });

  test("栄養項目が空配列の場合、データ不足エラーを返す", () => {
    const testTimestamp = new Date("2024-01-15T11:00:00Z");

    const emptyMetricsData = {
      userId: "user_007",
      measurementDate: "2024-01-15",
      nutritionMetrics: [],
      mealRecordCount: 0,
      recordingTimestamp: testTimestamp.toISOString()
    };

    expect(() => {
      analyzeNutritionGapAndGenerateProposal(emptyMetricsData);
    }).toThrow(/栄養項目/);
  });

  test("達成度が100%以上の場合、改善提案は生成されず、達成状況を返す", () => {
    const testTimestamp = new Date("2024-01-15T11:00:00Z");

    const exceededTargetData = {
      userId: "user_008",
      measurementDate: "2024-01-15",
      nutritionMetrics: [
        {
          nutrientId: "protein_001",
          targetValue: 60,
          actualValue: 66,
          unit: "g"
        },
        {
          nutrientId: "calcium_002",
          targetValue: 800,
          actualValue: 850,
          unit: "mg"
        }
      ],
      mealRecordCount: 3,
      recordingTimestamp: testTimestamp.toISOString()
    };

    const result = analyzeNutritionGapAndGenerateProposal(exceededTargetData);

    expect(result.totalAchievementScore).toBe(108); // (110 + 106.25) / 2 ≈ 108
    expect(result.proposalGenerated).toBe(false);
    expect(result.status).toBe("target_achieved");
  });

  test("複数の欠損パターンが混在する場合、すべての欠損を列挙したエラーメッセージを返す", () => {
    const testTimestamp = new Date("2024-01-15T11:00:00Z");

    const mixedMissingData = {
      userId: "user_009",
      measurementDate: "2024-01-15",
      nutritionMetrics: [
        {
          nutrientId: "protein_001",
          targetValue: 60,
          actualValue: null // 欠損
        },
        {
          nutrientId: "calcium_002",
          targetValue: null, // 欠損: 目標値
          actualValue: 720,
          unit: "mg"
        },
        {
          nutrientId: "iron_003",
          targetValue: 8,
          actualValue: 7,
          unit: null // 欠損: 単位
        }
      ],
      mealRecordCount: 2,
      recordingTimestamp: testTimestamp.toISOString()
    };

    expect(() => {
      analyzeNutritionGapAndGenerateProposal(mixedMissingData);
    }).toThrow(/実績データ欠損/);

    // エラーメッセージに複数の欠損箇所が含まれることを確認
    try {
      analyzeNutritionGapAndGenerateProposal(mixedMissingData);
    } catch (error) {
      const errorMessage = (error as Error).message;
      expect(errorMessage).toMatch(/protein_001|calcium_002|iron_003/);
    }
  });
});