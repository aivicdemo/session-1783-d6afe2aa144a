import { detectAndValidateMenuPatterns } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-474: [normal] 抵触パターンの妥当性判定と献立生成反映 - 不妥当と判定されたパターンが次週献立生成ロジックから除外される
  test('不妥当と判定されたパターンが次週献立生成ロジックから完全に除外され、妥当と判定されたパターンのみが献立生成に使用されていること', () => {
    // テストデータ: 複数の献立パターン（妥当・不妥当混在）
    const mentalMenuPatterns = [
      {
        patternId: 'PAT-001',
        mealName: '鶏肉のハーブ焼き',
        ingredients: ['鶏肉', 'ローズマリー', 'オリーブオイル'],
        cookingTimeMinutes: 25,
        estimatedNutrition: {
          calories: 380,
          protein: 35,
          carbs: 15,
          fat: 18,
        },
        isViable: true,
      },
      {
        patternId: 'PAT-002',
        mealName: 'えびの唐辛子炒め',
        ingredients: ['えび', '唐辛子', '醤油'],
        cookingTimeMinutes: 18,
        estimatedNutrition: {
          calories: 220,
          protein: 28,
          carbs: 8,
          fat: 10,
        },
        isViable: false,
      },
      {
        patternId: 'PAT-003',
        mealName: '豚肉のしょうが焼き',
        ingredients: ['豚肉', 'しょうが', '醤油'],
        cookingTimeMinutes: 20,
        estimatedNutrition: {
          calories: 350,
          protein: 32,
          carbs: 12,
          fat: 16,
        },
        isViable: true,
      },
      {
        patternId: 'PAT-004',
        mealName: 'ナッツアレルギー対応スムージー',
        ingredients: ['バナナ', 'ココナッツミルク', 'はちみつ'],
        cookingTimeMinutes: 5,
        estimatedNutrition: {
          calories: 180,
          protein: 3,
          carbs: 35,
          fat: 8,
        },
        isViable: false,
      },
      {
        patternId: 'PAT-005',
        mealName: 'サーモンのグリル',
        ingredients: ['サーモン', 'レモン', 'ディル'],
        cookingTimeMinutes: 22,
        estimatedNutrition: {
          calories: 320,
          protein: 38,
          carbs: 5,
          fat: 17,
        },
        isViable: true,
      },
    ];

    // 新しい食事制限条件（えびアレルギー追加）
    const newRestriction = {
      restrictionType: 'allergen',
      restrictionValue: 'えび',
      addedAt: new Date('2024-01-15T10:00:00Z'),
    };

    // 抵触パターン検出・妥当性判定ロジックを実行
    const validationResult = detectAndValidateMenuPatterns(
      mentalMenuPatterns,
      newRestriction
    );

    // 不妥当と判定されたパターンの ID リストを記録
    const invalidPatternIds = validationResult.invalidPatterns.map(
      (pattern) => pattern.patternId
    );

    // 期待される不妥当パターン（えびを含む PAT-002）
    expect(invalidPatternIds).toContain('PAT-002');
    expect(invalidPatternIds.length).toBe(1);

    // 次週献立生成ロジックで使用可能なパターンを取得
    const viablePatterns = validationResult.validPatterns;
    const usedPatternIds = viablePatterns.map((pattern) => pattern.patternId);

    // 不妥当パターンが献立生成で使用されていないことを確認
    expect(usedPatternIds).not.toContain('PAT-002');

    // 妥当なパターン（PAT-001, PAT-003, PAT-005）が献立生成に使用可能であることを確認
    expect(usedPatternIds).toContain('PAT-001');
    expect(usedPatternIds).toContain('PAT-003');
    expect(usedPatternIds).toContain('PAT-005');
    expect(usedPatternIds.length).toBe(3);

    // 妥当と判定されたパターンの詳細を検証
    const pat001 = viablePatterns.find((p) => p.patternId === 'PAT-001');
    expect(pat001).toBeDefined();
    expect(pat001?.mealName).toBe('鶏肉のハーブ焼き');
    expect(pat001?.ingredients).toContain('鶏肉');
    expect(pat001?.estimatedNutrition.calories).toBe(380);

    const pat003 = viablePatterns.find((p) => p.patternId === 'PAT-003');
    expect(pat003).toBeDefined();
    expect(pat003?.mealName).toBe('豚肉のしょうが焼き');
    expect(pat003?.cookingTimeMinutes).toBe(20);

    const pat005 = viablePatterns.find((p) => p.patternId === 'PAT-005');
    expect(pat005).toBeDefined();
    expect(pat005?.estimatedNutrition.protein).toBe(38);

    // 妥当性判定結果全体の構造を検証
    expect(validationResult).toHaveProperty('validPatterns');
    expect(validationResult).toHaveProperty('invalidPatterns');
    expect(validationResult.validPatterns.length + validationResult.invalidPatterns.length).toBe(5);

    // 献立生成除外状態を検証
    expect(validationResult.excludedFromNextWeekGeneration).toEqual(['PAT-002']);
  });
});