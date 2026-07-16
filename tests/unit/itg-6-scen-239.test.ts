import { extractConstraintMetrics } from '../../src/logic/it-8-1-1-1';

describe('ユーザーインタビュー記録と利用ログから食材制限・調理時間・予算の優先度マトリクス生成', () => {
  // SCEN-239
  test('食材制限・調理時間・予算の発生頻度と影響度が自動抽出され優先度マトリクスが生成される', () => {
    // テストデータ: ユーザーインタビュー記録（テキスト形式）
    const interviewRecord = `
      ユーザーA: 子どもがピーナッツアレルギーなので、食材制限は必須です。
      インタビュアー: 他にアレルギーはありますか？
      ユーザーA: えびもダメです。嫌いな食材も結構あって、制限が多いです。
      インタビュアー: 調理時間はどのくらい確保できますか？
      ユーザーA: 平日は30分程度しか時間がなくて、時間が足りません。夜間なので急いでいます。
      インタビュアー: 食費についてはいかがですか？
      ユーザーA: 予算が限られているので、安いレシピを探すことが多いです。
    `;

    // テストデータ: 利用ログ（JSON形式）
    const usageLog = [
      {
        timestamp: '2024-01-15T09:00:00Z',
        userId: 'user-001',
        action: 'quick_recipe_search',
        metadata: { cookingTimeMinutes: 30 }
      },
      {
        timestamp: '2024-01-15T09:05:00Z',
        userId: 'user-001',
        action: 'apply_time_filter',
        metadata: { maxCookingTime: 30 }
      },
      {
        timestamp: '2024-01-15T09:10:00Z',
        userId: 'user-001',
        action: 'apply_price_filter',
        metadata: { maxPrice: 1500 }
      },
      {
        timestamp: '2024-01-15T09:12:00Z',
        userId: 'user-001',
        action: 'search_cheap_recipe',
        metadata: { priceRange: 'under_1500' }
      },
      {
        timestamp: '2024-01-15T09:15:00Z',
        userId: 'user-001',
        action: 'apply_allergen_filter',
        metadata: { allergens: ['peanut', 'shrimp'] }
      },
      {
        timestamp: '2024-01-15T09:18:00Z',
        userId: 'user-001',
        action: 'apply_allergen_filter',
        metadata: { allergens: ['peanut', 'shrimp', 'egg'] }
      },
      {
        timestamp: '2024-01-15T09:20:00Z',
        userId: 'user-001',
        action: 'recipe_selected',
        metadata: { cookingTime: 28, price: 1200, meetsConstraints: true }
      },
      {
        timestamp: '2024-01-15T09:22:00Z',
        userId: 'user-001',
        action: 'quick_recipe_search',
        metadata: { cookingTimeMinutes: 30 }
      },
      {
        timestamp: '2024-01-15T09:25:00Z',
        userId: 'user-001',
        action: 'apply_price_filter',
        metadata: { maxPrice: 1800 }
      }
    ];

    // 抽出関数を呼び出す
    const result = extractConstraintMetrics({
      interviewText: interviewRecord,
      usageLogData: usageLog
    });

    // インタビュー記録から食材制限に関するキーワードの出現回数をカウント
    // "アレルギー" x3, "ダメ" x1, "嫌い" x1, "制限" x2 → 合計出現 7 回
    // 正規化スコア: (7 / 10) * 100 = 70
    expect(result.foodRestrictionFrequencyScore).toBe(70);

    // 利用ログから調理時間制限に関するアクションの発生回数をカウント
    // "quick_recipe_search" x2, "apply_time_filter" x1 → 合計 3 件
    // 正規化スコア: (3 / 9) * 100 = 33.33 (四捨五入して33)
    expect(result.cookingTimeFrequencyScore).toBe(33);

    // 利用ログから予算制約に関するアクションの発生回数をカウント
    // "apply_price_filter" x2, "search_cheap_recipe" x1 → 合計 3 件
    // 正規化スコア: (3 / 9) * 100 = 33.33 (四捨五入して33)
    expect(result.budgetConstraintFrequencyScore).toBe(33);

    // ユーザー行動データからユーザーの実際の選択に与えた影響度スコアを算出
    // recipe_selected イベントでの制約満足度分析
    // food restriction の影響度: 制約フィルタ適用 3 回、選択されたレシピが制約を満たす 1 回 → (1/3) * 100 = 33
    expect(result.foodRestrictionImpactScore).toBe(33);

    // cooking time の影響度: 制約フィルタ適用 1 回、選択されたレシピが 28 分（制約内） → (1/1) * 100 = 100
    expect(result.cookingTimeImpactScore).toBe(100);

    // budget constraint の影響度: 制約フィルタ適用 2 回、選択されたレシピが 1200 円（制約内） → (1/2) * 100 = 50
    expect(result.budgetConstraintImpactScore).toBe(50);

    // 優先度マトリクスデータセットの生成
    expect(result.priorityMatrix).toEqual({
      quadrants: [
        {
          constraintType: 'food_restriction',
          frequency: 70,
          impact: 33,
          priority: 'high',
          quadrant: 'top_left'
        },
        {
          constraintType: 'cooking_time',
          frequency: 33,
          impact: 100,
          priority: 'high',
          quadrant: 'top_right'
        },
        {
          constraintType: 'budget_constraint',
          frequency: 33,
          impact: 50,
          priority: 'medium',
          quadrant: 'middle'
        }
      ],
      totalSamplesAnalyzed: 9,
      analysisDate: '2024-01-15'
    });

    // マトリクスデータが優先順位判定に使用可能な形式であることを確認
    expect(result.priorityMatrix.quadrants.length).toBe(3);
    expect(result.priorityMatrix.quadrants[0]).toHaveProperty('constraintType');
    expect(result.priorityMatrix.quadrants[0]).toHaveProperty('frequency');
    expect(result.priorityMatrix.quadrants[0]).toHaveProperty('impact');
    expect(result.priorityMatrix.quadrants[0]).toHaveProperty('priority');
    expect(result.priorityMatrix.quadrants[0]).toHaveProperty('quadrant');

    // 優先度は適切に判定されていることを確認
    const highPriorityItems = result.priorityMatrix.quadrants.filter(
      (item) => item.priority === 'high'
    );
    expect(highPriorityItems.length).toBe(2);
    expect(highPriorityItems[0].constraintType).toBe('food_restriction');
    expect(highPriorityItems[1].constraintType).toBe('cooking_time');
  });
});