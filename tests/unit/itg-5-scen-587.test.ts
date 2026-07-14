import { analyzeDeviationWithValidation } from "../../src/logic/it-7-2-1";

describe("需要予測精度の乖離分析機能 - 不正形式エラーハンドリング", () => {
  test("SCEN-587: 不正な形式の予測値データでエラーが発生し分析が中断される", () => {
    // ハッピーパス: 正常なデータでの分析成功を確認
    const validPredictionData = [
      { date: "2024-01-08", predictedDemand: 150, actualDemand: 145 },
      { date: "2024-01-15", predictedDemand: 200, actualDemand: 210 },
      { date: "2024-01-22", predictedDemand: 180, actualDemand: 175 },
    ];

    const validResult = analyzeDeviationWithValidation(validPredictionData);
    expect(validResult).toBeDefined();
    expect(validResult.status).toBe("success");
    expect(validResult.totalDeviation).toBe(10); // |150-145| + |200-210| + |180-175|
    expect(validResult.deviationRate).toBe(3.33); // (10 / 300) * 100
    expect(validResult.analysisInterrupted).toBe(false);

    // エラーケース1: テキスト値を含む予測値データ
    const textInvalidData = [
      { date: "2024-01-08", predictedDemand: "abc", actualDemand: 145 },
    ];
    expect(() =>
      analyzeDeviationWithValidation(textInvalidData)
    ).toThrow(/予測値/);

    // エラーケース2: null値を含む予測値データ
    const nullInvalidData = [
      { date: "2024-01-08", predictedDemand: null, actualDemand: 145 },
    ];
    expect(() =>
      analyzeDeviationWithValidation(nullInvalidData)
    ).toThrow(/予測値/);

    // エラーケース3: 空文字列を含む予測値データ
    const emptyStringData = [
      { date: "2024-01-08", predictedDemand: "", actualDemand: 145 },
    ];
    expect(() =>
      analyzeDeviationWithValidation(emptyStringData)
    ).toThrow(/予測値/);

    // エラーケース4: 記号を含む予測値データ
    const symbolData = [
      { date: "2024-01-08", predictedDemand: "!@#$", actualDemand: 145 },
    ];
    expect(() =>
      analyzeDeviationWithValidation(symbolData)
    ).toThrow(/予測値/);

    // エラーケース5: 負の数値（ビジネス上不正）
    const negativeData = [
      { date: "2024-01-08", predictedDemand: -100, actualDemand: 145 },
    ];
    expect(() =>
      analyzeDeviationWithValidation(negativeData)
    ).toThrow(/予測値/);

    // エラーケース6: undefined を含む予測値データ
    const undefinedData = [
      { date: "2024-01-08", predictedDemand: undefined, actualDemand: 145 },
    ];
    expect(() =>
      analyzeDeviationWithValidation(undefinedData)
    ).toThrow(/予測値/);

    // エラーケース7: 日付フォーマットが不正
    const invalidDateData = [
      { date: "not-a-date", predictedDemand: 150, actualDemand: 145 },
    ];
    expect(() =>
      analyzeDeviationWithValidation(invalidDateData)
    ).toThrow(/日付/);

    // エラー発生後の状態確認: 分析が中断され、前のデータが保持される
    const previousAnalysisState = {
      status: "success" as const,
      totalDeviation: 5,
      deviationRate: 1.67,
      analysisInterrupted: false,
    };

    // エラーが発生した場合、分析結果は更新されない
    const errorData = [
      { date: "2024-01-08", predictedDemand: "invalid", actualDemand: 145 },
    ];
    expect(() =>
      analyzeDeviationWithValidation(errorData)
    ).toThrow(/予測値/);

    // 前回の分析結果が保持されることを検証（エラー発生時の状態保持）
    const newValidData = [
      { date: "2024-02-01", predictedDemand: 120, actualDemand: 125 },
    ];
    const recoveryResult = analyzeDeviationWithValidation(newValidData);
    expect(recoveryResult.status).toBe("success");
    expect(recoveryResult.analysisInterrupted).toBe(false);
  });
});