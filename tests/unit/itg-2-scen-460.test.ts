import { validateNutritionVerificationCycle } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザー食事記録と栄養摂取量の推移分析・栄養基準ロジック検証', () => {
  // SCEN-460: [error] 検証タイミング判定機能 - 検証周期情報が無効な場合にエラーが適切に発生する
  test('検証周期情報が無効な場合にValidationErrorが発生し、エラーメッセージと詳細情報が適切に記録される', () => {
    // テストケース1: 検証周期情報がnullの場合
    expect(() => {
      validateNutritionVerificationCycle({
        verification_cycle_id: 'vc_001',
        verification_cycle: null as any,
        verification_frequency: 'monthly',
        last_verification_date: new Date('2024-01-15T09:00:00Z'),
        next_verification_date: new Date('2024-02-15T09:00:00Z'),
      });
    }).toThrow(/検証周期情報/);

    // テストケース2: 検証周期情報がundefinedの場合
    expect(() => {
      validateNutritionVerificationCycle({
        verification_cycle_id: 'vc_002',
        verification_cycle: undefined as any,
        verification_frequency: 'quarterly',
        last_verification_date: new Date('2024-01-15T09:00:00Z'),
        next_verification_date: new Date('2024-04-15T09:00:00Z'),
      });
    }).toThrow(/検証周期情報/);

    // テストケース3: 検証周期情報が空文字列の場合
    expect(() => {
      validateNutritionVerificationCycle({
        verification_cycle_id: 'vc_003',
        verification_cycle: '' as any,
        verification_frequency: 'monthly',
        last_verification_date: new Date('2024-01-15T09:00:00Z'),
        next_verification_date: new Date('2024-02-15T09:00:00Z'),
      });
    }).toThrow(/検証周期情報/);

    // テストケース4: 検証周期情報が不正な形式（数値）の場合
    expect(() => {
      validateNutritionVerificationCycle({
        verification_cycle_id: 'vc_004',
        verification_cycle: 12345 as any,
        verification_frequency: 'monthly',
        last_verification_date: new Date('2024-01-15T09:00:00Z'),
        next_verification_date: new Date('2024-02-15T09:00:00Z'),
      });
    }).toThrow(/検証周期情報/);

    // テストケース5: 検証周期情報が不正な形式（オブジェクト型だが必須フィールド欠落）の場合
    expect(() => {
      validateNutritionVerificationCycle({
        verification_cycle_id: 'vc_005',
        verification_cycle: { invalid: 'object' } as any,
        verification_frequency: 'monthly',
        last_verification_date: new Date('2024-01-15T09:00:00Z'),
        next_verification_date: new Date('2024-02-15T09:00:00Z'),
      });
    }).toThrow(/検証周期情報/);

    // テストケース6: 検証周期の値が無効な場合（許可されていない値）
    expect(() => {
      validateNutritionVerificationCycle({
        verification_cycle_id: 'vc_006',
        verification_cycle: 'invalid_cycle',
        verification_frequency: 'monthly',
        last_verification_date: new Date('2024-01-15T09:00:00Z'),
        next_verification_date: new Date('2024-02-15T09:00:00Z'),
      });
    }).toThrow(/検証周期情報/);

    // テストケース7: 正常な検証周期情報が渡された場合は成功
    const validResult = validateNutritionVerificationCycle({
      verification_cycle_id: 'vc_007',
      verification_cycle: 'monthly',
      verification_frequency: 'monthly',
      last_verification_date: new Date('2024-01-15T09:00:00Z'),
      next_verification_date: new Date('2024-02-15T09:00:00Z'),
    });

    expect(validResult).toEqual({
      is_valid: true,
      verification_cycle_id: 'vc_007',
      next_verification_date: new Date('2024-02-15T09:00:00Z'),
      verification_frequency: 'monthly',
    });

    // テストケース8: 正常な四半期周期の検証周期情報が渡された場合
    const quarterlyResult = validateNutritionVerificationCycle({
      verification_cycle_id: 'vc_008',
      verification_cycle: 'quarterly',
      verification_frequency: 'quarterly',
      last_verification_date: new Date('2024-01-15T09:00:00Z'),
      next_verification_date: new Date('2024-04-15T09:00:00Z'),
    });

    expect(quarterlyResult).toEqual({
      is_valid: true,
      verification_cycle_id: 'vc_008',
      next_verification_date: new Date('2024-04-15T09:00:00Z'),
      verification_frequency: 'quarterly',
    });
  });
});