import { detectAndExcludeAnomalies } from '../../src/logic/it-7-2-1';

describe('ユーザーデータの欠損値・異常値検出と除外処理', () => {
  // SCEN-899
  test('全レコードが欠損値または異常値で構成される場合、分析不可の警告が発生し処理が中断される', () => {
    const invalidDataset = [
      { userId: null, successRate: null, cookingTimeReduction: undefined, satisfactionScore: undefined },
      { userId: null, successRate: NaN, cookingTimeReduction: -1, satisfactionScore: 999999 },
      { userId: undefined, successRate: null, cookingTimeReduction: -100, satisfactionScore: -50 },
      { userId: '', successRate: undefined, cookingTimeReduction: null, satisfactionScore: null },
      { userId: null, successRate: -999, cookingTimeReduction: undefined, satisfactionScore: 999999 },
      { userId: undefined, successRate: null, cookingTimeReduction: -1, satisfactionScore: NaN },
      { userId: null, successRate: undefined, cookingTimeReduction: null, satisfactionScore: -200 },
      { userId: '', successRate: NaN, cookingTimeReduction: -50, satisfactionScore: undefined },
      { userId: undefined, successRate: null, cookingTimeReduction: undefined, satisfactionScore: null },
      { userId: null, successRate: null, cookingTimeReduction: 999999, satisfactionScore: -999 },
      { userId: undefined, successRate: undefined, cookingTimeReduction: null, satisfactionScore: NaN },
    ];

    expect(() => detectAndExcludeAnomalies(invalidDataset)).toThrow(/分析に必要な有効なデータが不足/);
  });
});