import { detectMissingSegmentationAxis } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-683
  test('セグメント分類基準の3軸のいずれかが未定義の場合にバリデーションエラーが返される', () => {
    const input_1_axis_undefined = {
      cooking_time_axis: undefined,
      difficulty_axis: {
        level_1: '簡単',
        level_2: '普通',
        level_3: '複雑',
      },
      budget_axis: {
        tier_1: '低予算',
        tier_2: '中予算',
        tier_3: '高予算',
      },
    };

    expect(() => detectMissingSegmentationAxis(input_1_axis_undefined)).toThrow(
      /セグメント分類基準の3軸がすべて定義されていません/,
    );
  });

  test('セグメント分類基準の3軸がすべて定義されている場合に成功する', () => {
    const input_all_axes_defined = {
      cooking_time_axis: {
        short: '30分以下',
        medium: '31-60分',
        long: '60分以上',
      },
      difficulty_axis: {
        level_1: '簡単',
        level_2: '普通',
        level_3: '複雑',
      },
      budget_axis: {
        tier_1: '低予算',
        tier_2: '中予算',
        tier_3: '高予算',
      },
    };

    const result = detectMissingSegmentationAxis(input_all_axes_defined);

    expect(result).toEqual({
      status: 200,
      axes_validated: true,
      cooking_time_axis: {
        short: '30分以下',
        medium: '31-60分',
        long: '60分以上',
      },
      difficulty_axis: {
        level_1: '簡単',
        level_2: '普通',
        level_3: '複雑',
      },
      budget_axis: {
        tier_1: '低予算',
        tier_2: '中予算',
        tier_3: '高予算',
      },
    });
  });

  test('セグメント分類基準の2番目の軸が未定義の場合にバリデーションエラーが返される', () => {
    const input_2nd_axis_undefined = {
      cooking_time_axis: {
        short: '30分以下',
        medium: '31-60分',
        long: '60分以上',
      },
      difficulty_axis: undefined,
      budget_axis: {
        tier_1: '低予算',
        tier_2: '中予算',
        tier_3: '高予算',
      },
    };

    expect(() => detectMissingSegmentationAxis(input_2nd_axis_undefined)).toThrow(
      /セグメント分類基準の3軸がすべて定義されていません/,
    );
  });

  test('セグメント分類基準の3番目の軸が未定義の場合にバリデーションエラーが返される', () => {
    const input_3rd_axis_undefined = {
      cooking_time_axis: {
        short: '30分以下',
        medium: '31-60分',
        long: '60分以上',
      },
      difficulty_axis: {
        level_1: '簡単',
        level_2: '普通',
        level_3: '複雑',
      },
      budget_axis: undefined,
    };

    expect(() => detectMissingSegmentationAxis(input_3rd_axis_undefined)).toThrow(
      /セグメント分類基準の3軸がすべて定義されていません/,
    );
  });
});