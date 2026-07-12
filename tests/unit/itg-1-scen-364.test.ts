import { calculateNutritionAchievementDashboard } from "../../src/logic/it-2";

describe("栄養分析ダッシュボード表示機能", () => {
  // SCEN-364
  test("栄養項目ごとの目標値と実績値の達成度が百分率で正確に計算され、ギャップが大きい項目が優先度付けされて表示される", () => {
    // Arrange: 栄養目標値と実績値のサンプルデータを構築
    const nutritionData = {
      items: [
        {
          name: "タンパク質",
          unit: "g",
          targetValue: 50,
          actualValue: 35,
        },
        {
          name: "炭水化物",
          unit: "g",
          targetValue: 250,
          actualValue: 220,
        },
        {
          name: "脂質",
          unit: "g",
          targetValue: 65,
          actualValue: 55,
        },
        {
          name: "ビタミンA",
          unit: "μg",
          targetValue: 700,
          actualValue: 600,
        },
        {
          name: "ビタミンC",
          unit: "mg",
          targetValue: 100,
          actualValue: 45,
        },
        {
          name: "カルシウム",
          unit: "mg",
          targetValue: 800,
          actualValue: 850,
        },
        {
          name: "鉄分",
          unit: "mg",
          targetValue: 8,
          actualValue: 5,
        },
      ],
    };

    // Act: ダッシュボード計算関数を実行
    const result = calculateNutritionAchievementDashboard(nutritionData);

    // Assert: 各栄養項目の達成度百分率が正確に計算されていることを検証
    // タンパク質: 35 / 50 × 100 = 70%
    expect(result.items[0].name).toBe("ビタミンC");
    expect(result.items[0].achievementPercentage).toBe(45);
    expect(result.items[0].gap).toBe(55);

    // 鉄分: 5 / 8 × 100 = 62.5%
    expect(result.items[1].name).toBe("鉄分");
    expect(result.items[1].achievementPercentage).toBe(62.5);
    expect(result.items[1].gap).toBe(3);

    // ビタミンA: 600 / 700 × 100 ≈ 85.71%
    expect(result.items[2].name).toBe("ビタミンA");
    expect(result.items[2].achievementPercentage).toBeCloseTo(85.71, 1);
    expect(result.items[2].gap).toBe(100);

    // タンパク質: 35 / 50 × 100 = 70%
    expect(result.items[3].name).toBe("タンパク質");
    expect(result.items[3].achievementPercentage).toBe(70);
    expect(result.items[3].gap).toBe(15);

    // 脂質: 55 / 65 × 100 ≈ 84.62%
    expect(result.items[4].name).toBe("脂質");
    expect(result.items[4].achievementPercentage).toBeCloseTo(84.62, 1);
    expect(result.items[4].gap).toBe(10);

    // 炭水化物: 220 / 250 × 100 = 88%
    expect(result.items[5].name).toBe("炭水化物");
    expect(result.items[5].achievementPercentage).toBe(88);
    expect(result.items[5].gap).toBe(30);

    // カルシウム: 850 / 800 × 100 = 106.25% (100%超過)
    expect(result.items[6].name).toBe("カルシウム");
    expect(result.items[6].achievementPercentage).toBe(106.25);
    expect(result.items[6].gap).toBe(-50);

    // 達成度が100%未満の項目がすべて上位に、100%以上が下位に表示されていることを検証
    const items_under_100 = result.items.filter(
      (item: any) => item.achievementPercentage < 100
    );
    const items_over_100 = result.items.filter(
      (item: any) => item.achievementPercentage >= 100
    );

    expect(items_under_100.length).toBe(6);
    expect(items_over_100.length).toBe(1);

    // 100%未満の項目がギャップの大きい順にソートされていることを検証
    for (let i = 0; i < items_under_100.length - 1; i++) {
      expect(items_under_100[i].gap).toBeGreaterThanOrEqual(
        items_under_100[i + 1].gap
      );
    }

    // 最初のアイテム（ギャップが最も大きい）がビタミンC（gap=55）であることを確認
    expect(result.items[0].gap).toBe(55);
    expect(result.items[0].achievementPercentage).toBe(45);

    // ダッシュボード全体の総合達成度が正確に計算されていることを検証
    // 総達成度 = (45 + 62.5 + 85.71 + 70 + 84.62 + 88 + 106.25) / 7 ≈ 77.01%
    expect(result.overallAchievementPercentage).toBeCloseTo(77.01, 1);

    // ギャップが大きい項目から優先度付けされていることを確認
    const sortedByGap = result.items.map((item: any) => ({
      name: item.name,
      gap: item.gap,
    }));
    expect(sortedByGap[0].gap).toBe(55); // ビタミンC (100% - 45%)
    expect(sortedByGap[1].gap).toBe(3); // 鉄分 (8 - 5)
    expect(sortedByGap[2].gap).toBe(100); // ビタミンA (700 - 600)

    // 結果が配列形式で返されており、各アイテムが必要なプロパティを持つことを確認
    expect(Array.isArray(result.items)).toBe(true);
    expect(result.items.length).toBe(7);
    result.items.forEach((item: any) => {
      expect(item).toHaveProperty("name");
      expect(item).toHaveProperty("targetValue");
      expect(item).toHaveProperty("actualValue");
      expect(item).toHaveProperty("achievementPercentage");
      expect(item).toHaveProperty("gap");
      expect(item).toHaveProperty("priority");
    });

    // 優先度が100%未満の項目に対して高い値が割り当てられていることを確認
    const high_priority_items = result.items.filter(
      (item: any) => item.priority > 5
    );
    expect(high_priority_items.every((item: any) => item.achievementPercentage < 100)).toBe(
      true
    );
  });
});