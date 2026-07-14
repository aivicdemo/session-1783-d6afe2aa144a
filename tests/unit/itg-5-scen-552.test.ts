import { calculateMenuRankingWithConstraints } from '../../src/logic/it-7-2-1';

describe('献立生成の成功率・調理時間短縮度・ユーザー満足度スコアなどの行動指標を週次で自動集計し、アルゴリズム改善前後の効果差を定量比較するダッシュボード機能', () => {
  test('SCEN-552: 複数制約条件付き献立候補ランキング機能 - 複数の制約条件を優先度付けし、ユーザー満足度スコア順に献立候補がランキングされる', () => {
    // 前提: 複数の制約条件を優先度付けして入力した状態
    const constraints = [
      {
        constraintId: 'nutrition',
        constraintName: '栄養バランス',
        priority: 'high',
        priorityWeight: 0.4,
        fulfillmentScore: 85,
      },
      {
        constraintId: 'cooking_time',
        constraintName: '調理時間',
        priority: 'high',
        priorityWeight: 0.3,
        fulfillmentScore: 90,
      },
      {
        constraintId: 'cost',
        constraintName: 'コスト',
        priority: 'medium',
        priorityWeight: 0.15,
        fulfillmentScore: 75,
      },
      {
        constraintId: 'allergen',
        constraintName: 'アレルゲン対応',
        priority: 'high',
        priorityWeight: 0.1,
        fulfillmentScore: 100,
      },
      {
        constraintId: 'user_preference',
        constraintName: 'ユーザー嗜好',
        priority: 'low',
        priorityWeight: 0.05,
        fulfillmentScore: 70,
      },
    ];

    const menuCandidates = [
      {
        menuId: 'menu_001',
        menuName: '和風ハンバーグセット',
        satisfactionScore: 0,
        constraintScores: {
          nutrition: 85,
          cooking_time: 90,
          cost: 75,
          allergen: 100,
          user_preference: 70,
        },
      },
      {
        menuId: 'menu_002',
        menuName: 'グリーンサラダ丼',
        satisfactionScore: 0,
        constraintScores: {
          nutrition: 95,
          cooking_time: 95,
          cost: 80,
          allergen: 100,
          user_preference: 65,
        },
      },
      {
        menuId: 'menu_003',
        menuName: 'カレーライス',
        satisfactionScore: 0,
        constraintScores: {
          nutrition: 80,
          cooking_time: 75,
          cost: 70,
          allergen: 85,
          user_preference: 95,
        },
      },
      {
        menuId: 'menu_004',
        menuName: 'シーフードスパゲッティ',
        satisfactionScore: 0,
        constraintScores: {
          nutrition: 88,
          cooking_time: 80,
          cost: 60,
          allergen: 50,
          user_preference: 88,
        },
      },
    ];

    // アクション: 複数制約条件付き献立候補ランキング機能を実行
    const result = calculateMenuRankingWithConstraints(constraints, menuCandidates);

    // 期待結果1: ユーザー満足度スコアが正確に計算されていること
    // menu_002の期待スコア: (95 * 0.4) + (95 * 0.3) + (80 * 0.15) + (100 * 0.1) + (65 * 0.05) = 38 + 28.5 + 12 + 10 + 3.25 = 91.75
    expect(result.rankedMenus[0].menuId).toBe('menu_002');
    expect(result.rankedMenus[0].satisfactionScore).toBe(91.75);

    // menu_001の期待スコア: (85 * 0.4) + (90 * 0.3) + (75 * 0.15) + (100 * 0.1) + (70 * 0.05) = 34 + 27 + 11.25 + 10 + 3.5 = 85.75
    expect(result.rankedMenus[1].menuId).toBe('menu_001');
    expect(result.rankedMenus[1].satisfactionScore).toBe(85.75);

    // menu_003の期待スコア: (80 * 0.4) + (75 * 0.3) + (70 * 0.15) + (85 * 0.1) + (95 * 0.05) = 32 + 22.5 + 10.5 + 8.5 + 4.75 = 78.25
    expect(result.rankedMenus[2].menuId).toBe('menu_003');
    expect(result.rankedMenus[2].satisfactionScore).toBe(78.25);

    // menu_004の期待スコア: (88 * 0.4) + (80 * 0.3) + (60 * 0.15) + (50 * 0.1) + (88 * 0.05) = 35.2 + 24 + 9 + 5 + 4.4 = 77.6
    expect(result.rankedMenus[3].menuId).toBe('menu_004');
    expect(result.rankedMenus[3].satisfactionScore).toBe(77.6);

    // 期待結果2: 献立候補がユーザー満足度スコアの降順でランキングされていること
    expect(result.rankedMenus.length).toBe(4);
    for (let i = 0; i < result.rankedMenus.length - 1; i++) {
      expect(result.rankedMenus[i].satisfactionScore).toBeGreaterThanOrEqual(
        result.rankedMenus[i + 1].satisfactionScore
      );
    }

    // 期待結果3: 優先度の高い制約条件（栄養: 0.4、調理時間: 0.3、アレルゲン: 0.1）がランキング結果に大きく影響していることを検証
    // menu_002がトップランクなのは、栄養（95）、調理時間（95）、アレルゲン（100）の高得点スコアが影響している
    const topMenu = result.rankedMenus[0];
    const topMenuHighPriorityScore =
      topMenu.constraintScores.nutrition * 0.4 +
      topMenu.constraintScores.cooking_time * 0.3 +
      topMenu.constraintScores.allergen * 0.1;
    expect(topMenuHighPriorityScore).toBeGreaterThan(85); // 高優先度制約の合計が85以上であることを確認

    // 期待結果4: 優先度を異なるパターンで変更し、再度ランキング結果を生成・確認した場合、一貫性を持つ結果が得られること
    const alternativeConstraints = [
      {
        constraintId: 'nutrition',
        constraintName: '栄養バランス',
        priority: 'medium',
        priorityWeight: 0.2,
        fulfillmentScore: 85,
      },
      {
        constraintId: 'cooking_time',
        constraintName: '調理時間',
        priority: 'low',
        priorityWeight: 0.1,
        fulfillmentScore: 90,
      },
      {
        constraintId: 'cost',
        constraintName: 'コスト',
        priority: 'high',
        priorityWeight: 0.3,
        fulfillmentScore: 75,
      },
      {
        constraintId: 'allergen',
        constraintName: 'アレルゲン対応',
        priority: 'high',
        priorityWeight: 0.3,
        fulfillmentScore: 100,
      },
      {
        constraintId: 'user_preference',
        constraintName: 'ユーザー嗜好',
        priority: 'high',
        priorityWeight: 0.1,
        fulfillmentScore: 70,
      },
    ];

    const alternativeResult = calculateMenuRankingWithConstraints(
      alternativeConstraints,
      menuCandidates
    );

    // 期待結果4-1: 優先度変更後の新しいランキング結果が算出されること
    expect(alternativeResult.rankedMenus.length).toBe(4);

    // 期待結果4-2: ユーザー満足度スコアが正しく再計算されていること
    // menu_002の新しい期待スコア: (95 * 0.2) + (95 * 0.1) + (80 * 0.3) + (100 * 0.3) + (65 * 0.1) = 19 + 9.5 + 24 + 30 + 6.5 = 89
    const altMenu002 = alternativeResult.rankedMenus.find(
      (m) => m.menuId === 'menu_002'
    );
    expect(altMenu002?.satisfactionScore).toBe(89);

    // menu_004の新しい期待スコア: (88 * 0.2) + (80 * 0.1) + (60 * 0.3) + (50 * 0.3) + (88 * 0.1) = 17.6 + 8 + 18 + 15 + 8.8 = 67.4
    const altMenu004 = alternativeResult.rankedMenus.find(
      (m) => m.menuId === 'menu_004'
    );
    expect(altMenu004?.satisfactionScore).toBe(67.4);

    // 期待結果4-3: 優先度変更前後で異なるランキング結果が得られること（一貫性を持ちながらも、優先度の変更に応じて順序が変わること）
    // 優先度変更前はmenu_002がトップ、優先度変更後も満足度スコアが高いことを確認
    expect(alternativeResult.rankedMenus[0].satisfactionScore).toBeGreaterThanOrEqual(
      alternativeResult.rankedMenus[1].satisfactionScore
    );

    // 期待結果5: 制約条件の優先度ウェイトが正確に反映されていることを検証
    expect(result.constraintWeights).toEqual({
      nutrition: 0.4,
      cooking_time: 0.3,
      cost: 0.15,
      allergen: 0.1,
      user_preference: 0.05,
    });

    // 期待結果6: ランキング結果がメタデータを含んでいること
    expect(result.totalMenusEvaluated).toBe(4);
    expect(result.evaluationTimestamp).toBeDefined();
    expect(result.evaluationTimestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    );
  });
});