import { aggregateFamilyMealEvaluations } from "../../src/logic/it-2";

describe("食事評価データ集約機能", () => {
  // SCEN-419: [normal] 食事評価データ集約機能 - 複数家族成員の食事評価が入力された場合、料理ごと・家族成員ごとの満足度スコア、完食度、リクエストが正常に集約される
  test("複数家族成員の食事評価を料理ごと・家族成員ごと・クロス集計で正常に集約する", () => {
    const mealDate = "2024-01-15";

    const familyMemberEvaluations = [
      {
        familyMemberId: 1,
        familyMemberName: "親1",
        mealDate: mealDate,
        evaluations: [
          {
            dishId: 101,
            dishName: "主食：ご飯",
            satisfactionScore: 5,
            finishPercentage: 100,
            requestText: "もっと多く食べたい",
          },
          {
            dishId: 102,
            dishName: "主菜：焼き魚",
            satisfactionScore: 4,
            finishPercentage: 90,
            requestText: "塩辛めが好き",
          },
          {
            dishId: 103,
            dishName: "副菜：味噌汁",
            satisfactionScore: 3,
            finishPercentage: 80,
            requestText: "豆腐を多めに",
          },
        ],
      },
      {
        familyMemberId: 2,
        familyMemberName: "親2",
        mealDate: mealDate,
        evaluations: [
          {
            dishId: 101,
            dishName: "主食：ご飯",
            satisfactionScore: 4,
            finishPercentage: 95,
            requestText: "玄米混合が良い",
          },
          {
            dishId: 102,
            dishName: "主菜：焼き魚",
            satisfactionScore: 5,
            finishPercentage: 100,
            requestText: "新鮮で美味しい",
          },
          {
            dishId: 103,
            dishName: "副菜：味噌汁",
            satisfactionScore: 4,
            finishPercentage: 85,
            requestText: "具を増やして",
          },
        ],
      },
      {
        familyMemberId: 3,
        familyMemberName: "子1",
        mealDate: mealDate,
        evaluations: [
          {
            dishId: 101,
            dishName: "主食：ご飯",
            satisfactionScore: 5,
            finishPercentage: 100,
            requestText: "大好き",
          },
          {
            dishId: 102,
            dishName: "主菜：焼き魚",
            satisfactionScore: 3,
            finishPercentage: 70,
            requestText: "骨が多い",
          },
          {
            dishId: 103,
            dishName: "副菜：味噌汁",
            satisfactionScore: 2,
            finishPercentage: 60,
            requestText: "温度が熱い",
          },
        ],
      },
      {
        familyMemberId: 4,
        familyMemberName: "子2",
        mealDate: mealDate,
        evaluations: [
          {
            dishId: 101,
            dishName: "主食：ご飯",
            satisfactionScore: 4,
            finishPercentage: 90,
            requestText: "いつも通り",
          },
          {
            dishId: 102,
            dishName: "主菜：焼き魚",
            satisfactionScore: 4,
            finishPercentage: 85,
            requestText: "美味しい",
          },
          {
            dishId: 103,
            dishName: "副菜：味噌汁",
            satisfactionScore: 3,
            finishPercentage: 75,
            requestText: "塩辛すぎ",
          },
        ],
      },
    ];

    const result = aggregateFamilyMealEvaluations(familyMemberEvaluations);

    // 料理ごとの集約結果を検証
    // 主食：ご飯 (dishId: 101)
    // 満足度スコア: (5 + 4 + 5 + 4) / 4 = 18 / 4 = 4.5
    // 完食度: (100 + 95 + 100 + 90) / 4 = 385 / 4 = 96.25
    expect(result.byDish).toBeDefined();
    expect(result.byDish).toHaveLength(3);

    const dish101 = result.byDish.find((d) => d.dishId === 101);
    expect(dish101).toBeDefined();
    expect(dish101!.dishName).toBe("主食：ご飯");
    expect(dish101!.averageSatisfactionScore).toBe(4.5);
    expect(dish101!.averageFinishPercentage).toBe(96.25);
    expect(dish101!.evaluationCount).toBe(4);
    expect(dish101!.allRequests).toContain("もっと多く食べたい");
    expect(dish101!.allRequests).toContain("玄米混合が良い");
    expect(dish101!.allRequests).toContain("大好き");
    expect(dish101!.allRequests).toContain("いつも通り");

    // 主菜：焼き魚 (dishId: 102)
    // 満足度スコア: (4 + 5 + 3 + 4) / 4 = 16 / 4 = 4.0
    // 完食度: (90 + 100 + 70 + 85) / 4 = 345 / 4 = 86.25
    const dish102 = result.byDish.find((d) => d.dishId === 102);
    expect(dish102).toBeDefined();
    expect(dish102!.dishName).toBe("主菜：焼き魚");
    expect(dish102!.averageSatisfactionScore).toBe(4.0);
    expect(dish102!.averageFinishPercentage).toBe(86.25);
    expect(dish102!.evaluationCount).toBe(4);

    // 副菜：味噌汁 (dishId: 103)
    // 満足度スコア: (3 + 4 + 2 + 3) / 4 = 12 / 4 = 3.0
    // 完食度: (80 + 85 + 60 + 75) / 4 = 300 / 4 = 75.0
    const dish103 = result.byDish.find((d) => d.dishId === 103);
    expect(dish103).toBeDefined();
    expect(dish103!.dishName).toBe("副菜：味噌汁");
    expect(dish103!.averageSatisfactionScore).toBe(3.0);
    expect(dish103!.averageFinishPercentage).toBe(75.0);
    expect(dish103!.evaluationCount).toBe(4);

    // 家族成員ごとの集約結果を検証
    expect(result.byFamilyMember).toBeDefined();
    expect(result.byFamilyMember).toHaveLength(4);

    // 親1: 満足度 (5+4+3)/3 = 4.0, 完食度 (100+90+80)/3 = 90.0
    const parent1 = result.byFamilyMember.find((f) => f.familyMemberId === 1);
    expect(parent1).toBeDefined();
    expect(parent1!.familyMemberName).toBe("親1");
    expect(parent1!.averageSatisfactionScore).toBe(4.0);
    expect(parent1!.averageFinishPercentage).toBe(90.0);
    expect(parent1!.evaluationCount).toBe(3);

    // 親2: 満足度 (4+5+4)/3 = 4.33..., 完食度 (95+100+85)/3 = 93.33...
    const parent2 = result.byFamilyMember.find((f) => f.familyMemberId === 2);
    expect(parent2).toBeDefined();
    expect(parent2!.familyMemberName).toBe("親2");
    expect(parent2!.averageSatisfactionScore).toBeCloseTo(
      (4 + 5 + 4) / 3,
      5
    );
    expect(parent2!.averageFinishPercentage).toBeCloseTo(
      (95 + 100 + 85) / 3,
      5
    );
    expect(parent2!.evaluationCount).toBe(3);

    // 子1: 満足度 (5+3+2)/3 = 3.33..., 完食度 (100+70+60)/3 = 76.66...
    const child1 = result.byFamilyMember.find((f) => f.familyMemberId === 3);
    expect(child1).toBeDefined();
    expect(child1!.familyMemberName).toBe("子1");
    expect(child1!.averageSatisfactionScore).toBeCloseTo(
      (5 + 3 + 2) / 3,
      5
    );
    expect(child1!.averageFinishPercentage).toBeCloseTo(
      (100 + 70 + 60) / 3,
      5
    );
    expect(child1!.evaluationCount).toBe(3);

    // 子2: 満足度 (4+4+3)/3 = 3.66..., 完食度 (90+85+75)/3 = 83.33...
    const child2 = result.byFamilyMember.find((f) => f.familyMemberId === 4);
    expect(child2).toBeDefined();
    expect(child2!.familyMemberName).toBe("子2");
    expect(child2!.averageSatisfactionScore).toBeCloseTo(
      (4 + 4 + 3) / 3,
      5
    );
    expect(child2!.averageFinishPercentage).toBeCloseTo(
      (90 + 85 + 75) / 3,
      5
    );
    expect(child2!.evaluationCount).toBe(3);

    // クロス集計（料理×家族成員）の結果を検証
    expect(result.crossTabulation).toBeDefined();
    expect(result.crossTabulation).toHaveLength(12); // 3 dishes × 4 family members

    // 主食・親1の組み合わせ
    const cross_dish101_parent1 = result.crossTabulation.find(
      (c) => c.dishId === 101 && c.familyMemberId === 1
    );
    expect(cross_dish101_parent1).toBeDefined();
    expect(cross_dish101_parent1!.dishName).toBe("主食：ご飯");
    expect(cross_dish101_parent1!.familyMemberName).toBe("親1");
    expect(cross_dish101_parent1!.satisfactionScore).toBe(5);
    expect(cross_dish101_parent1!.finishPercentage).toBe(100);
    expect(cross_dish101_parent1!.requestText).toBe("もっと多く食べたい");

    // 主菜・親2の組み合わせ
    const cross_dish102_parent2 = result.crossTabulation.find(
      (c) => c.dishId === 102 && c.familyMemberId === 2
    );
    expect(cross_dish102_parent2).toBeDefined();
    expect(cross_dish102_parent2!.dishName).toBe("主菜：焼き魚");
    expect(cross_dish102_parent2!.familyMemberName).toBe("親2");
    expect(cross_dish102_parent2!.satisfactionScore).toBe(5);
    expect(cross_dish102_parent2!.finishPercentage).toBe(100);
    expect(cross_dish102_parent2!.requestText).toBe("新鮮で美味しい");

    // 副菜・子1の組み合わせ
    const cross_dish103_child1 = result.crossTabulation.find(
      (c) => c.dishId === 103 && c.familyMemberId === 3
    );
    expect(cross_dish103_child1).toBeDefined();
    expect(cross_dish103_child1!.dishName).toBe("副菜：味噌汁");
    expect(cross_dish103_child1!.familyMemberName).toBe("子1");
    expect(cross_dish103_child1!.satisfactionScore).toBe(2);
    expect(cross_dish103_child1!.finishPercentage).toBe(60);
    expect(cross_dish103_child1!.requestText).toBe("温度が熱い");

    // データ欠落・重複がないことを検証
    const crossSet = new Set(
      result.crossTabulation.map(
        (c) => `${c.dishId}-${c.familyMemberId}`
      )
    );
    expect(crossSet.size).toBe(12); // 重複なし

    // 計算誤差がないことを検証（料理ごとの合計と部分的な確認）
    expect(result.byDish[0].evaluationCount).toBe(4);
    expect(result.byDish[1].evaluationCount).toBe(4);
    expect(result.byDish[2].evaluationCount).toBe(4);

    expect(result.byFamilyMember[0].evaluationCount).toBe(3);
    expect(result.byFamilyMember[1].evaluationCount).toBe(3);
    expect(result.byFamilyMember[2].evaluationCount).toBe(3);
    expect(result.byFamilyMember[3].evaluationCount).toBe(3);
  });
});