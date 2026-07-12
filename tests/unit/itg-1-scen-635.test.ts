import { detectConflictingMenusWithNewRestriction } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出', () => {
  // SCEN-635
  test('新しい食事制限条件入力時に過去献立から制限抵触パターンを自動検出し専業主夫に一覧表示', () => {
    // Precondition: 共働き配偶者が新しい食事制限条件をアプリに入力し、システムが過去の献立履歴と栄養データを保有している状態
    // Trigger: 共働き配偶者が食事制限条件を入力・送信したとき
    // Expected Outcome: システムが過去献立から制限抵触パターンを自動検出し、専業主夫に一覧表示。専業主夫が妥当性を判断後、次週献立生成ロジックに反映される

    const newRestriction = {
      restrictionId: 'rest_001',
      restrictionType: 'ingredient_allergy',
      restrictionValue: '卵',
      effectiveDate: '2024-01-15T10:00:00Z',
      priority: 1,
    };

    const pastMenus = [
      {
        menuId: 'menu_001',
        menuName: '卵焼き定食',
        ingredients: ['卵', '醤油', '米'],
        generatedDate: '2024-01-08T11:00:00Z',
        nutritionScore: 85,
      },
      {
        menuId: 'menu_002',
        menuName: '鶏肉と野菜のソテー',
        ingredients: ['鶏肉', 'ニンジン', 'キャベツ'],
        generatedDate: '2024-01-09T11:00:00Z',
        nutritionScore: 88,
      },
      {
        menuId: 'menu_003',
        menuName: 'スクランブルエッグ',
        ingredients: ['卵', 'チーズ', 'トースト'],
        generatedDate: '2024-01-10T11:00:00Z',
        nutritionScore: 80,
      },
      {
        menuId: 'menu_004',
        menuName: 'サラダ',
        ingredients: ['レタス', 'トマト', 'キュウリ'],
        generatedDate: '2024-01-11T11:00:00Z',
        nutritionScore: 75,
      },
    ];

    const userId = 'user_001';

    // Act
    const result = detectConflictingMenusWithNewRestriction(
      userId,
      newRestriction,
      pastMenus
    );

    // Assert: 過去献立から卵を含むメニューが検出される
    expect(result).toBeDefined();
    expect(result.conflictingMenus).toBeDefined();
    expect(Array.isArray(result.conflictingMenus)).toBe(true);
    expect(result.conflictingMenus.length).toBe(2);

    // Assert: 検出されたメニューが正しいものであること
    const conflictingMenuIds = result.conflictingMenus.map(
      (m: any) => m.menuId
    );
    expect(conflictingMenuIds).toContain('menu_001');
    expect(conflictingMenuIds).toContain('menu_003');
    expect(conflictingMenuIds).not.toContain('menu_002');
    expect(conflictingMenuIds).not.toContain('menu_004');

    // Assert: 各検出パターンに理由が記録されていること
    result.conflictingMenus.forEach((menu: any) => {
      expect(menu.conflictReason).toBeDefined();
      expect(typeof menu.conflictReason).toBe('string');
      expect(menu.conflictReason).toMatch(/卵/);
    });

    // Assert: 一覧にはメニュー名、生成日時、栄養スコアが含まれていること
    result.conflictingMenus.forEach((menu: any) => {
      expect(menu.menuName).toBeDefined();
      expect(menu.generatedDate).toBeDefined();
      expect(menu.nutritionScore).toBeDefined();
      expect(typeof menu.menuName).toBe('string');
      expect(typeof menu.generatedDate).toBe('string');
      expect(typeof menu.nutritionScore).toBe('number');
    });

    // Assert: 検出パターンに優先度順ランキングが付与されていること
    expect(result.conflictingMenus[0].priority).toBeDefined();
    expect(typeof result.conflictingMenus[0].priority).toBe('number');

    // Assert: 制限条件の詳細が検出結果に紐付けられていること
    expect(result.restrictionApplied).toBeDefined();
    expect(result.restrictionApplied.restrictionValue).toBe('卵');
    expect(result.restrictionApplied.restrictionType).toBe('ingredient_allergy');

    // Assert: 検出サマリーが含まれていること
    expect(result.summary).toBeDefined();
    expect(result.summary.totalConflictCount).toBe(2);
    expect(result.summary.analysisTimestamp).toBeDefined();
  });
});