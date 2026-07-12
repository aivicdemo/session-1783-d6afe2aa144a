import { defineInterviewSelectionCriteria } from '../../src/logic/it-1-1-1';

describe('インタビュー対象者選定基準決定機能', () => {
  // SCEN-641: [error] インタビュー対象者選定基準決定機能 - 入力パラメータが不足している場合にバリデーションエラーが発生する
  test('必須入力パラメータが不足している場合、バリデーションエラーが発生すること', () => {
    // ===== ハッピーパス: すべてのパラメータが揃っている場合 =====
    const validInput = {
      ageRangeMin: 30,
      ageRangeMax: 60,
      hasFamilyAllergy: true,
      hasDietaryRestriction: false,
      minSampleSize: 5,
    };

    const validResult = defineInterviewSelectionCriteria(validInput);
    expect(validResult).toEqual({
      ageRangeMin: 30,
      ageRangeMax: 60,
      hasFamilyAllergy: true,
      hasDietaryRestriction: false,
      minSampleSize: 5,
      selectionCriteriaId: expect.any(String),
      createdAt: expect.any(String),
    });

    // ===== エラーケース 1: 年齢下限が不足 =====
    const missingAgeMin = {
      ageRangeMin: undefined,
      ageRangeMax: 60,
      hasFamilyAllergy: true,
      hasDietaryRestriction: false,
      minSampleSize: 5,
    };

    expect(() => defineInterviewSelectionCriteria(missingAgeMin as any))
      .toThrow(/年齢範囲/);

    // ===== エラーケース 2: 年齢上限が不足 =====
    const missingAgeMax = {
      ageRangeMin: 30,
      ageRangeMax: undefined,
      hasFamilyAllergy: true,
      hasDietaryRestriction: false,
      minSampleSize: 5,
    };

    expect(() => defineInterviewSelectionCriteria(missingAgeMax as any))
      .toThrow(/年齢範囲/);

    // ===== エラーケース 3: アレルギー情報が不足 =====
    const missingAllergyInfo = {
      ageRangeMin: 30,
      ageRangeMax: 60,
      hasFamilyAllergy: undefined,
      hasDietaryRestriction: false,
      minSampleSize: 5,
    };

    expect(() => defineInterviewSelectionCriteria(missingAllergyInfo as any))
      .toThrow(/アレルギー/);

    // ===== エラーケース 4: 食事制限情報が不足 =====
    const missingRestrictionInfo = {
      ageRangeMin: 30,
      ageRangeMax: 60,
      hasFamilyAllergy: true,
      hasDietaryRestriction: undefined,
      minSampleSize: 5,
    };

    expect(() => defineInterviewSelectionCriteria(missingRestrictionInfo as any))
      .toThrow(/食事制限/);

    // ===== エラーケース 5: 最小サンプル数が不足 =====
    const missingSampleSize = {
      ageRangeMin: 30,
      ageRangeMax: 60,
      hasFamilyAllergy: true,
      hasDietaryRestriction: false,
      minSampleSize: undefined,
    };

    expect(() => defineInterviewSelectionCriteria(missingSampleSize as any))
      .toThrow(/サンプル数/);

    // ===== エラーケース 6: 複数の必須パラメータが不足 =====
    const multipleParamsMissing = {
      ageRangeMin: undefined,
      ageRangeMax: undefined,
      hasFamilyAllergy: undefined,
      hasDietaryRestriction: false,
      minSampleSize: 5,
    };

    expect(() => defineInterviewSelectionCriteria(multipleParamsMissing as any))
      .toThrow(/必須項目/);

    // ===== エラーケース 7: すべてのパラメータが undefined =====
    const allParamsMissing = {
      ageRangeMin: undefined,
      ageRangeMax: undefined,
      hasFamilyAllergy: undefined,
      hasDietaryRestriction: undefined,
      minSampleSize: undefined,
    };

    expect(() => defineInterviewSelectionCriteria(allParamsMissing as any))
      .toThrow(/必須項目/);

    // ===== 境界値テスト: 年齢範囲の逆転 =====
    const invalidAgeRange = {
      ageRangeMin: 60,
      ageRangeMax: 30,
      hasFamilyAllergy: true,
      hasDietaryRestriction: false,
      minSampleSize: 5,
    };

    expect(() => defineInterviewSelectionCriteria(invalidAgeRange))
      .toThrow(/年齢範囲/);

    // ===== 境界値テスト: 最小サンプル数が 0 =====
    const invalidSampleSize = {
      ageRangeMin: 30,
      ageRangeMax: 60,
      hasFamilyAllergy: true,
      hasDietaryRestriction: false,
      minSampleSize: 0,
    };

    expect(() => defineInterviewSelectionCriteria(invalidSampleSize))
      .toThrow(/サンプル数/);

    // ===== 境界値テスト: 最小サンプル数が負数 =====
    const negativeSampleSize = {
      ageRangeMin: 30,
      ageRangeMax: 60,
      hasFamilyAllergy: true,
      hasDietaryRestriction: false,
      minSampleSize: -1,
    };

    expect(() => defineInterviewSelectionCriteria(negativeSampleSize))
      .toThrow(/サンプル数/);

    // ===== 正常系確認: 最小値でのサンプル数 =====
    const minSampleSizeValid = {
      ageRangeMin: 20,
      ageRangeMax: 70,
      hasFamilyAllergy: false,
      hasDietaryRestriction: true,
      minSampleSize: 1,
    };

    const minSampleResult = defineInterviewSelectionCriteria(minSampleSizeValid);
    expect(minSampleResult.minSampleSize).toBe(1);
    expect(minSampleResult.selectionCriteriaId).toBeDefined();

    // ===== 正常系確認: 大きなサンプル数 =====
    const largeSampleSizeValid = {
      ageRangeMin: 25,
      ageRangeMax: 65,
      hasFamilyAllergy: true,
      hasDietaryRestriction: true,
      minSampleSize: 100,
    };

    const largeSampleResult = defineInterviewSelectionCriteria(largeSampleSizeValid);
    expect(largeSampleResult.minSampleSize).toBe(100);
    expect(largeSampleResult.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  });
});