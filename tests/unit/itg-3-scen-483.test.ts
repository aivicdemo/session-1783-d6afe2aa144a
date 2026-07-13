import { validateDeploymentGate } from '../../src/logic/it-1-br-3-2-1';

describe('購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  // SCEN-483: 献立生成アルゴリズム新ルール本番デプロイの自動検証ゲート - テスト環境での検証結果に失敗項目がある場合ロールバック判定が出力される
  test('should output rollback decision as true with failure details when validation has failures', () => {
    const testValidationResults = [
      {
        validationItemId: 'VAL-001',
        itemName: '栄養基準との抵触チェック',
        status: 'PASSED',
        timestamp: '2024-01-15T10:00:00Z',
        details: 'No conflicts detected'
      },
      {
        validationItemId: 'VAL-002',
        itemName: '家族食事評価データ整合性検証',
        status: 'FAILED',
        timestamp: '2024-01-15T10:05:00Z',
        details: 'Inconsistency detected in family preference data'
      },
      {
        validationItemId: 'VAL-003',
        itemName: '過去献立矛盾チェック',
        status: 'FAILED',
        timestamp: '2024-01-15T10:10:00Z',
        details: 'Contradiction found with historical menu patterns'
      },
      {
        validationItemId: 'VAL-004',
        itemName: 'アレルギー制約チェック',
        status: 'PASSED',
        timestamp: '2024-01-15T10:15:00Z',
        details: 'All allergy constraints satisfied'
      }
    ];

    const result = validateDeploymentGate(testValidationResults);

    expect(result.shouldRollback).toBe(true);
    expect(result.failureCount).toBe(2);
    expect(result.passedCount).toBe(2);
    expect(result.totalValidationItems).toBe(4);
    expect(Array.isArray(result.failureDetails)).toBe(true);
    expect(result.failureDetails.length).toBe(2);

    const firstFailure = result.failureDetails[0];
    expect(firstFailure.validationItemId).toBe('VAL-002');
    expect(firstFailure.itemName).toBe('家族食事評価データ整合性検証');
    expect(firstFailure.failureReason).toBe('Inconsistency detected in family preference data');
    expect(firstFailure.timestamp).toBe('2024-01-15T10:05:00Z');

    const secondFailure = result.failureDetails[1];
    expect(secondFailure.validationItemId).toBe('VAL-003');
    expect(secondFailure.itemName).toBe('過去献立矛盾チェック');
    expect(secondFailure.failureReason).toBe('Contradiction found with historical menu patterns');
    expect(secondFailure.timestamp).toBe('2024-01-15T10:10:00Z');

    expect(result.message).toContain('ロールバック');
    expect(result.message).toContain('2');
    expect(typeof result.generatedAt).toBe('string');
  });

  test('should output rollback decision as false when all validation items pass', () => {
    const testValidationResults = [
      {
        validationItemId: 'VAL-001',
        itemName: '栄養基準との抵触チェック',
        status: 'PASSED',
        timestamp: '2024-01-15T10:00:00Z',
        details: 'No conflicts detected'
      },
      {
        validationItemId: 'VAL-002',
        itemName: '家族食事評価データ整合性検証',
        status: 'PASSED',
        timestamp: '2024-01-15T10:05:00Z',
        details: 'All preference data is consistent'
      },
      {
        validationItemId: 'VAL-003',
        itemName: '過去献立矛盾チェック',
        status: 'PASSED',
        timestamp: '2024-01-15T10:10:00Z',
        details: 'No contradictions with historical patterns'
      }
    ];

    const result = validateDeploymentGate(testValidationResults);

    expect(result.shouldRollback).toBe(false);
    expect(result.failureCount).toBe(0);
    expect(result.passedCount).toBe(3);
    expect(result.totalValidationItems).toBe(3);
    expect(result.failureDetails.length).toBe(0);
    expect(result.message).toContain('成功');
  });

  test('should throw error when validation results array is empty', () => {
    expect(() => validateDeploymentGate([])).toThrow(/検証結果/);
  });

  test('should throw error when required fields are missing in validation item', () => {
    const invalidResults = [
      {
        validationItemId: 'VAL-001',
        itemName: '栄養基準との抵触チェック',
        // status is missing
        timestamp: '2024-01-15T10:00:00Z',
        details: 'No conflicts detected'
      }
    ];

    expect(() => validateDeploymentGate(invalidResults as any)).toThrow(/フィールド/);
  });
});