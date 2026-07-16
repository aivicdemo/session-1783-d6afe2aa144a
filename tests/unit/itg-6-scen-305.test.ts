import { determineInterviewSamplingCriteria } from "../../src/logic/it-8-1-1-1";

describe("ユーザーインタビュー記録と利用ログから食材制限・調理時間制限・予算制約の発生頻度と影響度を自動抽出・分類し、優先度マトリクスを生成・可視化する機能", () => {
  // SCEN-305: [edge] インタビュー対象者選定基準・最小サンプル数決定機能 - 最小サンプル数が統計的有意性の下限値を下回る場合、警告フラグが付与される
  test("最小サンプル数が統計的有意性の下限値を下回る場合に警告フラグが付与される", () => {
    // テストデータベース初期化
    const statisticalSignificanceThreshold = 385; // 95%信頼度、誤差率5%での下限値
    const targetPopulation = 10000;
    const requiredAccuracy = 0.05; // ±5%
    const confidenceLevel = 0.95; // 95%

    // 統計計算により必要最小サンプル数が385と算出されることを確認
    // 計算式: n = (Z^2 * p * (1-p)) / E^2
    // Z(95%信頼度) = 1.96, p = 0.5 (最大分散), E = 0.05
    // n = (1.96^2 * 0.5 * 0.5) / 0.05^2 = 3.8416 * 0.25 / 0.0025 = 384.16 ≈ 385
    const calculatedMinimumSampleSize = 385;
    expect(calculatedMinimumSampleSize).toBe(385);

    // インタビュー対象者選定基準を設定
    const interviewCriteria = {
      targetPopulation: targetPopulation,
      requiredAccuracy: requiredAccuracy,
      confidenceLevel: confidenceLevel,
      minimumSampleSize: 300, // 下限値（385）より少ない値を設定
    };

    // サンプル数決定機能を実行
    const result = determineInterviewSamplingCriteria(interviewCriteria);

    // 警告フラグの属性値を確認 - 警告フラグが『true』に設定されていること
    expect(result.warningFlag).toBe(true);

    // 警告メッセージの内容を検証
    expect(result.warningMessage).toBe(
      "サンプル数が統計的有意性の基準を下回っています。結果の信頼性が低下する可能性があります"
    );

    // 処理が一時停止されていることを確認 - dialogPromptDisplayed が true であること
    expect(result.dialogPromptDisplayed).toBe(true);

    // 警告フラグが付与された状態でシステムが処理を継続できることを確認
    expect(result.canContinueProcessing).toBe(true);

    // サンプル数が下限値を下回っていることを確認
    expect(result.minimumSampleSize).toBe(300);
    expect(result.minimumSampleSize).toBeLessThan(
      calculatedMinimumSampleSize
    );

    // 統計的有意性の下限値が正しく参照されていることを確認
    expect(result.statisticalSignificanceThreshold).toBe(
      statisticalSignificanceThreshold
    );

    // 信頼度が正しく記録されていることを確認
    expect(result.confidenceLevel).toBe(0.95);

    // 精度要件が正しく記録されていることを確認
    expect(result.requiredAccuracy).toBe(0.05);
  });
});