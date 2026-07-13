import { validateDeploymentInput } from '../../src/logic/it-1-br-3-2-1';

describe('献立生成アルゴリズム新ルール本番デプロイの自動検証ゲート', () => {
  // SCEN-484
  test('入力データが不正な場合、デプロイ処理が中断され適切なエラーメッセージが返される', () => {
    // null値のテスト
    expect(() =>
      validateDeploymentInput({
        ruleVersion: null as any,
        seasonPatterns: [],
        discountThreshold: 10,
        salesPeriod: '2024-01-01',
      })
    ).toThrow(/ルールバージョン/);

    // 空文字列のテスト
    expect(() =>
      validateDeploymentInput({
        ruleVersion: '',
        seasonPatterns: [],
        discountThreshold: 10,
        salesPeriod: '2024-01-01',
      })
    ).toThrow(/ルールバージョン/);

    // 型の不一致（文字列が要求されている場合に数値を送信）
    expect(() =>
      validateDeploymentInput({
        ruleVersion: 'v1.2.0',
        seasonPatterns: [],
        discountThreshold: '10' as any,
        salesPeriod: '2024-01-01',
      })
    ).toThrow(/割引率/);

    // 範囲外の値（割引率が0-100の範囲外）
    expect(() =>
      validateDeploymentInput({
        ruleVersion: 'v1.2.0',
        seasonPatterns: [],
        discountThreshold: 150,
        salesPeriod: '2024-01-01',
      })
    ).toThrow(/範囲/);

    // 負の値のテスト
    expect(() =>
      validateDeploymentInput({
        ruleVersion: 'v1.2.0',
        seasonPatterns: [],
        discountThreshold: -5,
        salesPeriod: '2024-01-01',
      })
    ).toThrow(/範囲/);

    // seasonPatternsが配列でない場合
    expect(() =>
      validateDeploymentInput({
        ruleVersion: 'v1.2.0',
        seasonPatterns: 'not-array' as any,
        discountThreshold: 10,
        salesPeriod: '2024-01-01',
      })
    ).toThrow(/季節パターン/);

    // salesPeriodが空文字列の場合
    expect(() =>
      validateDeploymentInput({
        ruleVersion: 'v1.2.0',
        seasonPatterns: [],
        discountThreshold: 10,
        salesPeriod: '',
      })
    ).toThrow(/販売期間/);

    // 有効な入力データでは検証成功し、デプロイ準備完了のメッセージが返される
    const validInput = {
      ruleVersion: 'v1.2.0',
      seasonPatterns: ['spring', 'summer', 'autumn', 'winter'],
      discountThreshold: 15,
      salesPeriod: '2024-01-01T00:00:00Z',
    };

    const result = validateDeploymentInput(validInput);
    expect(result).toEqual({
      isValid: true,
      message: 'デプロイ検証完了',
      deploymentId: expect.any(String),
      timestamp: expect.any(String),
    });

    // デプロイIDが生成されていることを確認
    expect(result.deploymentId).toBeTruthy();
    expect(result.deploymentId.length).toBeGreaterThan(0);
  });
});