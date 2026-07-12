import { generateInitialMenuWithIncompleteAllergy } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-458
  test('初期献立生成ロジック - アレルギー情報が不完全な場合でもエラーにならず基本属性で生成される', () => {
    // Precondition: ユーザーが基本属性を入力済み、アレルギー情報が空または部分的
    const userInput = {
      userId: 'user-001',
      age: 35,
      gender: 'male',
      activityLevel: 'moderate',
      allergyInfo: [], // 空のアレルギー情報
    };

    // Expected: エラーなし、基本属性に基づいた献立が生成される
    const result = generateInitialMenuWithIncompleteAllergy(userInput);

    // Assertion: 献立が正常に生成されている
    expect(result).toBeDefined();
    expect(result).toHaveProperty('menuId');
    expect(result).toHaveProperty('dishes');
    expect(Array.isArray(result.dishes)).toBe(true);
    expect(result.dishes.length).toBeGreaterThan(0);

    // Assertion: 献立の内容が基本属性に適合している
    // 35歳男性・中程度活動レベル向けの栄養バランス検証
    expect(result).toHaveProperty('nutritionSummary');
    expect(result.nutritionSummary).toHaveProperty('calories');
    expect(result.nutritionSummary).toHaveProperty('protein');
    expect(result.nutritionSummary).toHaveProperty('carbohydrates');
    expect(result.nutritionSummary).toHaveProperty('fat');

    // Assertion: 35歳男性中程度活動レベルの推奨カロリー (2400-2600kcal)
    expect(result.nutritionSummary.calories).toBeGreaterThanOrEqual(2400);
    expect(result.nutritionSummary.calories).toBeLessThanOrEqual(2600);

    // Assertion: タンパク質推奨量 (60-75g)
    expect(result.nutritionSummary.protein).toBeGreaterThanOrEqual(60);
    expect(result.nutritionSummary.protein).toBeLessThanOrEqual(75);

    // Assertion: 各献立要素にアレルギー情報が適用されている（空でも処理済み）
    result.dishes.forEach((dish: any) => {
      expect(dish).toHaveProperty('name');
      expect(dish).toHaveProperty('ingredients');
      expect(typeof dish.name).toBe('string');
      expect(Array.isArray(dish.ingredients)).toBe(true);
    });

    // Assertion: 生成タイムスタンプが存在する
    expect(result).toHaveProperty('generatedAt');
    expect(typeof result.generatedAt).toBe('string');

    // Assertion: 基本属性が献立メタデータに保持されている
    expect(result).toHaveProperty('metadata');
    expect(result.metadata.age).toBe(35);
    expect(result.metadata.gender).toBe('male');
    expect(result.metadata.activityLevel).toBe('moderate');
  });

  test('初期献立生成ロジック - 部分的なアレルギー情報でも正常に生成される', () => {
    // Precondition: アレルギー情報が部分的に入力されている状態
    const userInput = {
      userId: 'user-002',
      age: 28,
      gender: 'female',
      activityLevel: 'light',
      allergyInfo: [
        { allergen: 'peanut', severity: 'high' },
        // 他のアレルギーは未入力
      ],
    };

    // Expected: 部分的なアレルギー情報を反映した献立が生成される
    const result = generateInitialMenuWithIncompleteAllergy(userInput);

    expect(result).toBeDefined();
    expect(result.dishes.length).toBeGreaterThan(0);

    // Assertion: ピーナッツアレルギーが考慮されている
    result.dishes.forEach((dish: any) => {
      const hasPeanut = dish.ingredients.some((ing: any) => ing.name.toLowerCase().includes('peanut'));
      expect(hasPeanut).toBe(false);
    });

    // Assertion: 28歳女性・軽度活動レベルの推奨カロリー (1800-2000kcal)
    expect(result.nutritionSummary.calories).toBeGreaterThanOrEqual(1800);
    expect(result.nutritionSummary.calories).toBeLessThanOrEqual(2000);

    // Assertion: 女性向けタンパク質推奨量 (50-65g)
    expect(result.nutritionSummary.protein).toBeGreaterThanOrEqual(50);
    expect(result.nutritionSummary.protein).toBeLessThanOrEqual(65);
  });

  test('初期献立生成ロジック - 基本属性の欠落時はエラーが発生する', () => {
    // Precondition: 基本属性が不完全
    const invalidUserInput = {
      userId: 'user-003',
      age: undefined, // 必須項目が未定義
      gender: 'male',
      activityLevel: 'moderate',
      allergyInfo: [],
    };

    // Expected: エラーが発生する
    expect(() => generateInitialMenuWithIncompleteAllergy(invalidUserInput)).toThrow(/年齢/);
  });

  test('初期献立生成ロジック - 基本属性の不正な値でエラーが発生する', () => {
    // Precondition: 基本属性の値が不正
    const invalidUserInput = {
      userId: 'user-004',
      age: -5, // 不正な年齢値
      gender: 'male',
      activityLevel: 'moderate',
      allergyInfo: [],
    };

    // Expected: エラーが発生する
    expect(() => generateInitialMenuWithIncompleteAllergy(invalidUserInput)).toThrow(/年齢/);
  });

  test('初期献立生成ロジック - 活動レベルの不正な値でエラーが発生する', () => {
    // Precondition: 不正な活動レベル値
    const invalidUserInput = {
      userId: 'user-005',
      age: 40,
      gender: 'female',
      activityLevel: 'invalid_level', // 不正な活動レベル
      allergyInfo: [],
    };

    // Expected: エラーが発生する
    expect(() => generateInitialMenuWithIncompleteAllergy(invalidUserInput)).toThrow(/活動レベル/);
  });

  test('初期献立生成ロジック - 性別の不正な値でエラーが発生する', () => {
    // Precondition: 不正な性別値
    const invalidUserInput = {
      userId: 'user-006',
      age: 30,
      gender: 'other_invalid', // 不正な性別
      activityLevel: 'moderate',
      allergyInfo: [],
    };

    // Expected: エラーが発生する
    expect(() => generateInitialMenuWithIncompleteAllergy(invalidUserInput)).toThrow(/性別/);
  });
});