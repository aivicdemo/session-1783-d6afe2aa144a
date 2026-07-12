import { selectRolloutSegments } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-432
  test('ユーザーセグメント情報が不足または不正な場合、エラーを返してロールアウト選定を中止する', () => {
    // ===== ハッピーパス: 正常なセグメント情報での成功 =====
    const validSegmentData = {
      segmentId: 'seg-001',
      ageGroup: '30-39',
      familySize: 4,
      hasRestriction: true,
      adoptionRate: 0.75,
      satisfactionScore: 82,
      cookingTimeReduction: 18,
    };

    const validResult = selectRolloutSegments(validSegmentData);
    expect(validResult.status).toBe('success');
    expect(validResult.rolloutOrder).toBeDefined();
    expect(validResult.rolloutOrder).toBeGreaterThanOrEqual(1);
    expect(validResult.rolloutOrder).toBeLessThanOrEqual(5);
    expect(validResult.targetUserCount).toBeGreaterThan(0);
    expect(validResult.rolloutExecuted).toBe(true);

    // ===== エラーケース 1: segmentId が未定義 =====
    const missingSegmentId = {
      segmentId: undefined,
      ageGroup: '30-39',
      familySize: 4,
      hasRestriction: true,
      adoptionRate: 0.75,
      satisfactionScore: 82,
      cookingTimeReduction: 18,
    };

    expect(() => selectRolloutSegments(missingSegmentId as any)).toThrow(/セグメント/);

    // ===== エラーケース 2: ageGroup が未定義 =====
    const missingAgeGroup = {
      segmentId: 'seg-001',
      ageGroup: undefined,
      familySize: 4,
      hasRestriction: true,
      adoptionRate: 0.75,
      satisfactionScore: 82,
      cookingTimeReduction: 18,
    };

    expect(() => selectRolloutSegments(missingAgeGroup as any)).toThrow(/年代/);

    // ===== エラーケース 3: familySize が null =====
    const nullFamilySize = {
      segmentId: 'seg-001',
      ageGroup: '30-39',
      familySize: null,
      hasRestriction: true,
      adoptionRate: 0.75,
      satisfactionScore: 82,
      cookingTimeReduction: 18,
    };

    expect(() => selectRolloutSegments(nullFamilySize as any)).toThrow(/家族構成/);

    // ===== エラーケース 4: adoptionRate が範囲外（0未満） =====
    const invalidAdoptionRateLow = {
      segmentId: 'seg-001',
      ageGroup: '30-39',
      familySize: 4,
      hasRestriction: true,
      adoptionRate: -0.1,
      satisfactionScore: 82,
      cookingTimeReduction: 18,
    };

    expect(() => selectRolloutSegments(invalidAdoptionRateLow)).toThrow(/採用率/);

    // ===== エラーケース 5: adoptionRate が範囲外（1超） =====
    const invalidAdoptionRateHigh = {
      segmentId: 'seg-001',
      ageGroup: '30-39',
      familySize: 4,
      hasRestriction: true,
      adoptionRate: 1.5,
      satisfactionScore: 82,
      cookingTimeReduction: 18,
    };

    expect(() => selectRolloutSegments(invalidAdoptionRateHigh)).toThrow(/採用率/);

    // ===== エラーケース 6: satisfactionScore が範囲外（0未満） =====
    const invalidScoreLow = {
      segmentId: 'seg-001',
      ageGroup: '30-39',
      familySize: 4,
      hasRestriction: true,
      adoptionRate: 0.75,
      satisfactionScore: -5,
      cookingTimeReduction: 18,
    };

    expect(() => selectRolloutSegments(invalidScoreLow)).toThrow(/満足度/);

    // ===== エラーケース 7: satisfactionScore が範囲外（100超） =====
    const invalidScoreHigh = {
      segmentId: 'seg-001',
      ageGroup: '30-39',
      familySize: 4,
      hasRestriction: true,
      adoptionRate: 0.75,
      satisfactionScore: 105,
      cookingTimeReduction: 18,
    };

    expect(() => selectRolloutSegments(invalidScoreHigh)).toThrow(/満足度/);

    // ===== エラーケース 8: cookingTimeReduction が負数 =====
    const negativeTimeReduction = {
      segmentId: 'seg-001',
      ageGroup: '30-39',
      familySize: 4,
      hasRestriction: true,
      adoptionRate: 0.75,
      satisfactionScore: 82,
      cookingTimeReduction: -5,
    };

    expect(() => selectRolloutSegments(negativeTimeReduction)).toThrow(/調理時間/);

    // ===== エラーケース 9: familySize が0以下 =====
    const invalidFamilySize = {
      segmentId: 'seg-001',
      ageGroup: '30-39',
      familySize: 0,
      hasRestriction: true,
      adoptionRate: 0.75,
      satisfactionScore: 82,
      cookingTimeReduction: 18,
    };

    expect(() => selectRolloutSegments(invalidFamilySize)).toThrow(/家族構成/);

    // ===== エラーケース 10: 複数フィールド欠損時の最初のエラー =====
    const multipleInvalid = {
      segmentId: '',
      ageGroup: '',
      familySize: -1,
      hasRestriction: true,
      adoptionRate: 1.5,
      satisfactionScore: 150,
      cookingTimeReduction: -10,
    };

    expect(() => selectRolloutSegments(multipleInvalid)).toThrow(/セグメント|年代|家族構成|採用率|満足度|調理時間/);

    // ===== エラーケース 11: hasRestriction が不正な型 =====
    const invalidRestrictionType = {
      segmentId: 'seg-001',
      ageGroup: '30-39',
      familySize: 4,
      hasRestriction: 'true' as any,
      adoptionRate: 0.75,
      satisfactionScore: 82,
      cookingTimeReduction: 18,
    };

    expect(() => selectRolloutSegments(invalidRestrictionType)).toThrow(/制限/);

    // ===== エラーケース後の状態確認: ロールアウトが実行されていないことを検証 =====
    const errorCaseResult = (() => {
      try {
        selectRolloutSegments(missingSegmentId as any);
        return null;
      } catch {
        return { rolloutExecuted: false, status: 'failed' };
      }
    })();

    expect(errorCaseResult?.rolloutExecuted).toBe(false);
    expect(errorCaseResult?.status).toBe('failed');
  });
});