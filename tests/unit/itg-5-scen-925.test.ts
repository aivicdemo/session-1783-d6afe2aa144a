import { defineUserSegmentClassificationCriteria } from '../../src/logic/it-7-2-1';

describe('ユーザーセグメント分類基準定義機能', () => {
  // SCEN-925
  test('3軸のうち1つ以上が未定義の場合にセグメント分類基準の定義がエラーとなる', () => {
    // パターン1: 軸1のみ定義、軸2と軸3は未定義
    expect(() =>
      defineUserSegmentClassificationCriteria({
        axis1_ageGroup: 'adult',
        axis2_familyComposition: undefined,
        axis3_dietaryRestrictionFlag: undefined,
      })
    ).toThrow(/軸/);

    // パターン2: 軸1と軸2のみ定義、軸3は未定義
    expect(() =>
      defineUserSegmentClassificationCriteria({
        axis1_ageGroup: 'adult',
        axis2_familyComposition: 'family_with_children',
        axis3_dietaryRestrictionFlag: undefined,
      })
    ).toThrow(/軸/);

    // パターン3: 軸1は未定義、軸2と軸3は定義
    expect(() =>
      defineUserSegmentClassificationCriteria({
        axis1_ageGroup: undefined,
        axis2_familyComposition: 'family_with_children',
        axis3_dietaryRestrictionFlag: true,
      })
    ).toThrow(/軸/);

    // ハッピーパス: すべての軸が定義されている場合は成功
    const result = defineUserSegmentClassificationCriteria({
      axis1_ageGroup: 'adult',
      axis2_familyComposition: 'family_with_children',
      axis3_dietaryRestrictionFlag: true,
    });

    expect(result).toEqual({
      axis1_ageGroup: 'adult',
      axis2_familyComposition: 'family_with_children',
      axis3_dietaryRestrictionFlag: true,
      status: 'defined',
    });
  });
});