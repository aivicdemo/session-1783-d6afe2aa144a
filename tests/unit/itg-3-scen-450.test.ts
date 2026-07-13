import { validateDemandForecastVerification } from '../../src/logic/it-1-br-3-2-1';

describe('需要予測精度検証の実行判定 - データ不完全時の検証実行不可判定', () => {
  // SCEN-450
  test('検証対象月の予測データと実績データが不完全な場合、検証実行不可と判定され、待機通知が発行される', () => {
    // 検証対象月: 当月（2024年1月）
    const verificationTargetMonth = '2024-01';

    // 予測データ: 部分的に欠落（例：週単位で複数週のデータが未入力）
    // 全4週中2週のデータのみ存在
    const forecastData = [
      {
        week: 1,
        forecastedDemand: 1200,
        category: 'vegetable'
      },
      {
        week: 2,
        forecastedDemand: 1100,
        category: 'vegetable'
      }
      // week 3, 4 は未入力
    ];

    // 実績データ: 部分的に欠落（例：月初の実績が未記録）
    // 月初3日分が未記録
    const actualData = [
      {
        day: 4,
        actualDemand: 150,
        category: 'vegetable'
      },
      {
        day: 5,
        actualDemand: 160,
        category: 'vegetable'
      }
      // day 1, 2, 3 は未記録
    ];

    // 検証パラメータ
    const verificationParams = {
      targetMonth: verificationTargetMonth,
      forecastDataset: forecastData,
      actualDataset: actualData,
      requiredForecastCompleteness: 1.0, // 100% の完全性が必須
      requiredActualCompleteness: 1.0 // 100% の完全性が必須
    };

    // 実行結果
    const result = validateDemandForecastVerification(verificationParams);

    // 期待結果: 検証実行不可と判定される
    expect(result.isVerificationExecutable).toBe(false);

    // 検証ステータスが「待機中」
    expect(result.verificationStatus).toBe('waiting');

    // エラー理由が「データ不完全」を含む
    expect(result.errorReason).toMatch(/データ不完全/);

    // 待機通知が発行される
    expect(result.notificationIssued).toBe(true);

    // 通知タイプが「待機通知」
    expect(result.notificationType).toBe('waiting_notification');

    // 通知メッセージが「データ完成後の再実行」を促す内容
    expect(result.notificationMessage).toMatch(/データ完成後|再実行/);

    // 予測データの完成度: 2週 / 4週 = 50%
    expect(result.forecastCompletenessPercentage).toBe(50);

    // 実績データの完成度: 27日 / 31日（1月の日数） = 87.1%
    expect(Math.round(result.actualCompletenessPercentage * 10) / 10).toBe(87.1);

    // 検証プロセスが開始されない
    expect(result.processStarted).toBe(false);

    // エラーメッセージが返される
    expect(result.errorMessage).toBeDefined();
    expect(result.errorMessage).toMatch(/予測データが不完全|実績データが不完全/);
  });
});