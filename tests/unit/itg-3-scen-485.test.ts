import { evaluateDeploymentGate } from '../../src/logic/it-1-br-3-2-1';

describe('献立生成アルゴリズム新ルール本番デプロイの自動検証ゲート', () => {
  test('SCEN-485: テスト環境での検証結果が不明な状態の場合、条件付き実行判定が出力される', () => {
    // Arrange: テスト環境での検証結果を不明な状態に設定
    const verificationResult = {
      statusCode: 'UNKNOWN',
      passRate: 0.55, // 50% でもなく、50% の保留でもない状態
      validationMessage: 'Verification result is ambiguous',
      timestamp: new Date('2025-01-15T10:30:00Z'),
    };

    // Act: 条件付き実行判定ゲートの評価ロジックを呼び出す
    const deploymentGateResult = evaluateDeploymentGate(verificationResult);

    // Assert: 検証結果が不明な状態の場合、条件付き実行ステータスが出力される
    expect(deploymentGateResult.status).toBe('CONDITIONAL_EXECUTION');
    
    // 本番デプロイを一時保留する旨のメッセージが返却される
    expect(deploymentGateResult.message).toMatch(/条件付き実行|保留|ambiguous|UNKNOWN/i);
    
    // 不明状態であることが明確に識別可能な状態で出力される
    expect(deploymentGateResult.verificationStatus).toBe('UNKNOWN');
    
    // エラーが発生していない
    expect(deploymentGateResult.hasError).toBe(false);
    
    // 本番デプロイ前の判定フラグが適切に設定されている
    expect(deploymentGateResult.canProceedToProduction).toBe(false);
    
    // 本番デプロイ判定の理由が明確に記録されている
    expect(deploymentGateResult.reason).toMatch(/不明|ambiguous|unclear|UNKNOWN/i);
  });
});