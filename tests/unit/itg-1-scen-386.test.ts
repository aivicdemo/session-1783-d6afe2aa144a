import { analyzeDiscrepancy } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-386: [error] 需要予測精度の乖離分析機能 - 実績データがNULLまたは不正な値を含む場合、乖離分析がエラーハンドリングされる
  test('実績データにNULL値または不正な値が含まれる場合、適切なエラーメッセージを表示してアプリケーションが正常に復帰する', () => {
    // NULL値を含むデータセット
    const datasetWithNull = {
      predictedDemand: [100, 150, 200, null, 180],
      actualDemand: [95, 160, 190, 210, 185],
      category: 'protein',
      period: '2024-01-15',
    };

    // NULL値を含む場合、エラーをスロー
    expect(() => analyzeDiscrepancy(datasetWithNull)).toThrow(/実績データ/);

    // 負の数値を含むデータセット
    const datasetWithNegative = {
      predictedDemand: [100, 150, 200, 180, 170],
      actualDemand: [95, -160, 190, 210, 185],
      category: 'vegetable',
      period: '2024-01-15',
    };

    expect(() => analyzeDiscrepancy(datasetWithNegative)).toThrow(/不正な値/);

    // 特殊文字を含むデータセット
    const datasetWithSpecialChar = {
      predictedDemand: [100, 150, '##', 180, 170],
      actualDemand: [95, 160, 190, 210, 185],
      category: 'fruit',
      period: '2024-01-15',
    };

    expect(() => analyzeDiscrepancy(datasetWithSpecialChar as any)).toThrow(/不正な値/);

    // テキスト形式の数値を含むデータセット
    const datasetWithTextNumber = {
      predictedDemand: [100, 150, 200, '180', 170],
      actualDemand: [95, 160, 190, 210, 185],
      category: 'dairy',
      period: '2024-01-15',
    };

    expect(() => analyzeDiscrepancy(datasetWithTextNumber as any)).toThrow(/不正な値/);

    // 正常なデータセットでは成功して結果を返す
    const validDataset = {
      predictedDemand: [100, 150, 200, 180, 170],
      actualDemand: [95, 160, 190, 210, 185],
      category: 'protein',
      period: '2024-01-15',
    };

    const result = analyzeDiscrepancy(validDataset);

    // 戻り値は乖離分析結果オブジェクト
    expect(result).toBeDefined();
    expect(result).toHaveProperty('meanAbsoluteError');
    expect(result).toHaveProperty('rootMeanSquaredError');
    expect(result).toHaveProperty('discrepancyRate');

    // 計算値の検証
    // MAE = (|100-95| + |150-160| + |200-190| + |180-210| + |170-185|) / 5
    //     = (5 + 10 + 10 + 30 + 15) / 5 = 70 / 5 = 14
    expect(result.meanAbsoluteError).toBe(14);

    // RMSE = sqrt(((100-95)^2 + (150-160)^2 + (200-190)^2 + (180-210)^2 + (170-185)^2) / 5)
    //      = sqrt((25 + 100 + 100 + 900 + 225) / 5)
    //      = sqrt(1350 / 5) = sqrt(270) ≈ 16.43
    expect(Math.round(result.rootMeanSquaredError * 100) / 100).toBe(16.43);

    // 乖離率 = MAE / 平均実績値 * 100
    // 平均実績値 = (95 + 160 + 190 + 210 + 185) / 5 = 840 / 5 = 168
    // 乖離率 = 14 / 168 * 100 ≈ 8.33%
    expect(Math.round(result.discrepancyRate * 100) / 100).toBe(8.33);

    // 複数回の再実行に対応できることを確認
    const secondResult = analyzeDiscrepancy(validDataset);
    expect(secondResult.meanAbsoluteError).toBe(result.meanAbsoluteError);
    expect(secondResult.rootMeanSquaredError).toBe(result.rootMeanSquaredError);
    expect(secondResult.discrepancyRate).toBe(result.discrepancyRate);

    // アプリケーション状態が正常に復帰している（エラー後も次の処理が実行可能）
    const correctedDataset = {
      predictedDemand: [105, 155, 205, 175, 165],
      actualDemand: [100, 165, 195, 215, 190],
      category: 'protein',
      period: '2024-01-16',
    };

    const correctedResult = analyzeDiscrepancy(correctedDataset);
    expect(correctedResult).toBeDefined();
    expect(correctedResult.meanAbsoluteError).toBe(12);
  });
});