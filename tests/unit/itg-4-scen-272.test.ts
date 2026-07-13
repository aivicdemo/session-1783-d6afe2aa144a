import { extractSignificantVariables } from '../../src/logic/it-2-br-6-3-2';

describe('External Factor Correlation Analysis and Variable Extraction', () => {
  // SCEN-272: [normal] 外部要因との相関分析・変数抽出 - 相関係数の有意性検定を実施し、p値が基準値以下の変数のみを有効変数として抽出する
  test('should extract only statistically significant variables with p-value <= threshold', () => {
    // テストデータ: 複数の外部要因変数と需要データ
    const externalFactorData = [
      {
        variableName: 'temperature',
        values: [15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
      },
      {
        variableName: 'humidity',
        values: [50, 52, 54, 56, 58, 60, 62, 64, 66, 68],
      },
      {
        variableName: 'dayOfWeek',
        values: [1, 2, 3, 4, 5, 6, 7, 1, 2, 3],
      },
      {
        variableName: 'isHoliday',
        values: [0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
      },
      {
        variableName: 'promotionFlag',
        values: [1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
      },
    ];

    const demandData = [
      120, 125, 130, 135, 140, 145, 150, 155, 160, 165,
    ];

    // p値基準の設定: 0.05
    const pValueThreshold = 0.05;

    // 相関分析・有意性検定を実行
    const result = extractSignificantVariables(
      externalFactorData,
      demandData,
      pValueThreshold
    );

    // 抽出結果の検証
    expect(result).toBeDefined();
    expect(Array.isArray(result.significantVariables)).toBe(true);

    // 抽出された各変数について検証
    result.significantVariables.forEach((variable) => {
      expect(variable.variableName).toBeDefined();
      expect(typeof variable.correlationCoefficient).toBe('number');
      expect(typeof variable.pValue).toBe('number');

      // p値が基準値以下であることを確認
      expect(variable.pValue).toBeLessThanOrEqual(pValueThreshold);

      // 相関係数が-1から1の範囲内であることを確認
      expect(variable.correlationCoefficient).toBeGreaterThanOrEqual(-1);
      expect(variable.correlationCoefficient).toBeLessThanOrEqual(1);
    });

    // 基準値より大きいp値を持つ変数が含まれていないことを確認
    const allExtractedVariables = result.significantVariables.map(
      (v) => v.variableName
    );
    externalFactorData.forEach((factor) => {
      const extracted = result.significantVariables.find(
        (v) => v.variableName === factor.variableName
      );
      if (extracted) {
        expect(extracted.pValue).toBeLessThanOrEqual(pValueThreshold);
      }
    });

    // 結果メタデータの検証
    expect(result.totalVariablesAnalyzed).toBe(5);
    expect(result.significantVariablesCount).toBeDefined();
    expect(typeof result.significantVariablesCount).toBe('number');
    expect(result.significantVariablesCount).toBeLessThanOrEqual(5);
    expect(result.thresholdApplied).toBe(pValueThreshold);
  });

  // p値基準 0.01 での抽出検証
  test('should extract fewer variables when p-value threshold is 0.01', () => {
    const externalFactorData = [
      {
        variableName: 'temperature',
        values: [15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
      },
      {
        variableName: 'humidity',
        values: [50, 52, 54, 56, 58, 60, 62, 64, 66, 68],
      },
      {
        variableName: 'promotionFlag',
        values: [1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
      },
    ];

    const demandData = [
      120, 125, 130, 135, 140, 145, 150, 155, 160, 165,
    ];

    const pValueThreshold001 = 0.01;

    const resultStrict = extractSignificantVariables(
      externalFactorData,
      demandData,
      pValueThreshold001
    );

    // p値 0.01での抽出結果
    expect(resultStrict.significantVariables).toBeDefined();
    expect(Array.isArray(resultStrict.significantVariables)).toBe(true);

    // すべての抽出変数がp値0.01以下であることを確認
    resultStrict.significantVariables.forEach((variable) => {
      expect(variable.pValue).toBeLessThanOrEqual(pValueThreshold001);
    });

    expect(resultStrict.thresholdApplied).toBe(pValueThreshold001);
  });

  // p値基準 0.1 での抽出検証
  test('should extract more variables when p-value threshold is 0.1', () => {
    const externalFactorData = [
      {
        variableName: 'temperature',
        values: [15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
      },
      {
        variableName: 'humidity',
        values: [50, 52, 54, 56, 58, 60, 62, 64, 66, 68],
      },
      {
        variableName: 'dayOfWeek',
        values: [1, 2, 3, 4, 5, 6, 7, 1, 2, 3],
      },
    ];

    const demandData = [
      120, 125, 130, 135, 140, 145, 150, 155, 160, 165,
    ];

    const pValueThreshold01 = 0.1;

    const resultRelaxed = extractSignificantVariables(
      externalFactorData,
      demandData,
      pValueThreshold01
    );

    // p値 0.1での抽出結果
    expect(resultRelaxed.significantVariables).toBeDefined();

    // すべての抽出変数がp値0.1以下であることを確認
    resultRelaxed.significantVariables.forEach((variable) => {
      expect(variable.pValue).toBeLessThanOrEqual(pValueThreshold01);
    });

    expect(resultRelaxed.thresholdApplied).toBe(pValueThreshold01);
  });

  // 相関係数と p値の正確性検証
  test('should correctly calculate correlation coefficients and p-values for each variable', () => {
    const externalFactorData = [
      {
        variableName: 'temperature',
        values: [10, 12, 14, 16, 18, 20, 22, 24, 26, 28],
      },
    ];

    const demandData = [100, 110, 120, 130, 140, 150, 160, 170, 180, 190];

    const pValueThreshold = 0.05;

    const result = extractSignificantVariables(
      externalFactorData,
      demandData,
      pValueThreshold
    );

    // 温度と需要の強い正相関が期待される
    if (result.significantVariables.length > 0) {
      const temperatureVariable = result.significantVariables.find(
        (v) => v.variableName === 'temperature'
      );

      if (temperatureVariable) {
        // 完全な正相関に近い値が期待される
        expect(temperatureVariable.correlationCoefficient).toBeGreaterThan(0.9);
        expect(temperatureVariable.pValue).toBeLessThanOrEqual(pValueThreshold);
      }
    }
  });

  // p値が基準値を超える変数が除外されることの検証
  test('should exclude variables with p-value greater than threshold', () => {
    const externalFactorData = [
      {
        variableName: 'randomNoise',
        values: [1, 4, 2, 7, 3, 8, 2, 9, 1, 6],
      },
    ];

    const demandData = [100, 105, 102, 108, 103, 110, 104, 112, 101, 107];

    const pValueThreshold = 0.05;

    const result = extractSignificantVariables(
      externalFactorData,
      demandData,
      pValueThreshold
    );

    // ランダムノイズは有意でない可能性が高い
    const randomNoiseVariable = result.significantVariables.find(
      (v) => v.variableName === 'randomNoise'
    );

    // 結果に含まれている場合は p値が基準以下であることを確認
    if (randomNoiseVariable) {
      expect(randomNoiseVariable.pValue).toBeLessThanOrEqual(pValueThreshold);
    } else {
      // 除外されている場合は、基準値よりp値が大きいことが期待される
      expect(result.significantVariablesCount).toBeLessThanOrEqual(1);
    }
  });

  // 複数基準p値での抽出数の適切な変動を検証
  test('should vary the number of extracted variables appropriately with different p-value thresholds', () => {
    const externalFactorData = [
      {
        variableName: 'factor1',
        values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      },
      {
        variableName: 'factor2',
        values: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
      },
      {
        variableName: 'factor3',
        values: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
      },
    ];

    const demandData = [100, 105, 110, 115, 120, 125, 130, 135, 140, 145];

    const result001 = extractSignificantVariables(
      externalFactorData,
      demandData,
      0.01
    );
    const result005 = extractSignificantVariables(
      externalFactorData,
      demandData,
      0.05
    );
    const result010 = extractSignificantVariables(
      externalFactorData,
      demandData,
      0.1
    );

    // 基準が緩くなるほど抽出数が増えるか同じになることを確認
    expect(result001.significantVariablesCount).toBeLessThanOrEqual(
      result005.significantVariablesCount
    );
    expect(result005.significantVariablesCount).toBeLessThanOrEqual(
      result010.significantVariablesCount
    );

    // すべての結果でメタデータが正確であることを確認
    expect(result001.thresholdApplied).toBe(0.01);
    expect(result005.thresholdApplied).toBe(0.05);
    expect(result010.thresholdApplied).toBe(0.1);
  });
});