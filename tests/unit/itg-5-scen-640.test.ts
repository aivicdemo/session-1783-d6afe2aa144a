import { calculateMealPreferenceReflectionStatus } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズムの週次集計と改善効果比較', () => {
  test('SCEN-640: 初期段階献立生成機能 - 評価データが29件の境界値で嗜好学習が反映されない', () => {
    // Setup: 評価データ28件時の献立生成結果（基準値）
    const mealData28Records = {
      userId: 'user-001',
      familyId: 'family-001',
      evaluationRecordsCount: 28,
      algorithm: 'v1.0',
      preferenceLearningThreshold: 30,
    };

    const result28 = calculateMealPreferenceReflectionStatus(mealData28Records);
    expect(result28).toEqual({
      recordCount: 28,
      isPreferenceLearningApplied: false,
      reflectionStatus: 'NOT_APPLIED',
      generatedMealPattern: 'baseline_pattern_001',
      satisfactionScore: 72.5,
    });

    // Setup: 評価データ29件時の献立生成結果（境界値直前）
    const mealData29Records = {
      userId: 'user-001',
      familyId: 'family-001',
      evaluationRecordsCount: 29,
      algorithm: 'v1.0',
      preferenceLearningThreshold: 30,
    };

    const result29 = calculateMealPreferenceReflectionStatus(mealData29Records);
    // 29件ではまだ嗜好学習が反映されない（閾値は30件以上）
    expect(result29).toEqual({
      recordCount: 29,
      isPreferenceLearningApplied: false,
      reflectionStatus: 'NOT_APPLIED',
      generatedMealPattern: 'baseline_pattern_001',
      satisfactionScore: 72.5,
    });

    // 28件と29件の献立パターンが同一であることを確認（嗜好学習が反映されていない証拠）
    expect(result28.generatedMealPattern).toBe(result29.generatedMealPattern);
    expect(result28.satisfactionScore).toBe(result29.satisfactionScore);

    // Setup: 評価データ30件時の献立生成結果（閾値達成）
    const mealData30Records = {
      userId: 'user-001',
      familyId: 'family-001',
      evaluationRecordsCount: 30,
      algorithm: 'v1.0',
      preferenceLearningThreshold: 30,
    };

    const result30 = calculateMealPreferenceReflectionStatus(mealData30Records);
    // 30件で嗜好学習が反映される
    expect(result30).toEqual({
      recordCount: 30,
      isPreferenceLearningApplied: true,
      reflectionStatus: 'APPLIED',
      generatedMealPattern: 'preference_adapted_pattern_001',
      satisfactionScore: 78.3,
    });

    // 30件時の献立パターンが28,29件と異なることを確認（嗜好学習が反映された証拠）
    expect(result30.generatedMealPattern).not.toBe(result28.generatedMealPattern);
    expect(result30.satisfactionScore).toBeGreaterThan(result28.satisfactionScore);

    // Setup: 評価データ31件時の献立生成結果（閾値超過）
    const mealData31Records = {
      userId: 'user-001',
      familyId: 'family-001',
      evaluationRecordsCount: 31,
      algorithm: 'v1.0',
      preferenceLearningThreshold: 30,
    };

    const result31 = calculateMealPreferenceReflectionStatus(mealData31Records);
    // 31件でも嗜好学習が反映される
    expect(result31).toEqual({
      recordCount: 31,
      isPreferenceLearningApplied: true,
      reflectionStatus: 'APPLIED',
      generatedMealPattern: 'preference_adapted_pattern_002',
      satisfactionScore: 79.1,
    });

    // 30件と31件は両者とも嗜好学習が反映されている
    expect(result30.isPreferenceLearningApplied).toBe(true);
    expect(result31.isPreferenceLearningApplied).toBe(true);

    // 満足度スコアが段階的に改善されていることを確認
    expect(result28.satisfactionScore).toBe(72.5);
    expect(result29.satisfactionScore).toBe(72.5); // 29件でも変わらない
    expect(result30.satisfactionScore).toBe(78.3); // 30件で向上
    expect(result31.satisfactionScore).toBeGreaterThan(result30.satisfactionScore); // さらに向上

    // 境界値ケース: 評価データ数が不正な場合のエラーチェック
    const invalidMealDataNegative = {
      userId: 'user-001',
      familyId: 'family-001',
      evaluationRecordsCount: -1,
      algorithm: 'v1.0',
      preferenceLearningThreshold: 30,
    };

    expect(() => calculateMealPreferenceReflectionStatus(invalidMealDataNegative)).toThrow(/評価データ数/);

    // 境界値ケース: 閾値が不正な場合のエラーチェック
    const invalidMealDataThreshold = {
      userId: 'user-001',
      familyId: 'family-001',
      evaluationRecordsCount: 30,
      algorithm: 'v1.0',
      preferenceLearningThreshold: -5,
    };

    expect(() => calculateMealPreferenceReflectionStatus(invalidMealDataThreshold)).toThrow(/閾値/);
  });
});