import { validateMealSatisfactionScore } from '../../src/logic/it-1-br-1783670064270-1-1-1';

describe('献立提案後の家族成員による食事評価入力機能', () => {
  // SCEN-417: [edge] 満足度スコア範囲検証機能 - 満足度スコアに1または5が入力された場合、境界値として正常に受け入れられる
  test('満足度スコアの境界値（1および5）が正常に受け入れられ、後続処理が実行される', () => {
    // ハッピーパス: 最小値1を入力
    const result_min = validateMealSatisfactionScore({
      satisfaction_score: 1,
      family_member_id: 'FM001',
      meal_id: 'MEAL20240115001',
      timestamp: '2024-01-15T19:30:00Z',
    });
    expect(result_min).toEqual({
      is_valid: true,
      satisfaction_score: 1,
      family_member_id: 'FM001',
      meal_id: 'MEAL20240115001',
      timestamp: '2024-01-15T19:30:00Z',
      error_message: null,
    });

    // ハッピーパス: 最大値5を入力
    const result_max = validateMealSatisfactionScore({
      satisfaction_score: 5,
      family_member_id: 'FM002',
      meal_id: 'MEAL20240115002',
      timestamp: '2024-01-15T20:00:00Z',
    });
    expect(result_max).toEqual({
      is_valid: true,
      satisfaction_score: 5,
      family_member_id: 'FM002',
      meal_id: 'MEAL20240115002',
      timestamp: '2024-01-15T20:00:00Z',
      error_message: null,
    });

    // 中間値（3）も正常に処理される
    const result_mid = validateMealSatisfactionScore({
      satisfaction_score: 3,
      family_member_id: 'FM003',
      meal_id: 'MEAL20240115003',
      timestamp: '2024-01-15T20:30:00Z',
    });
    expect(result_mid).toEqual({
      is_valid: true,
      satisfaction_score: 3,
      family_member_id: 'FM003',
      meal_id: 'MEAL20240115003',
      timestamp: '2024-01-15T20:30:00Z',
      error_message: null,
    });

    // 範囲外下限（0）はエラーになる
    expect(() =>
      validateMealSatisfactionScore({
        satisfaction_score: 0,
        family_member_id: 'FM004',
        meal_id: 'MEAL20240115004',
        timestamp: '2024-01-15T21:00:00Z',
      })
    ).toThrow(/満足度スコア/);

    // 範囲外上限（6）はエラーになる
    expect(() =>
      validateMealSatisfactionScore({
        satisfaction_score: 6,
        family_member_id: 'FM005',
        meal_id: 'MEAL20240115005',
        timestamp: '2024-01-15T21:30:00Z',
      })
    ).toThrow(/満足度スコア/);

    // 小数値（3.5）はエラーになる
    expect(() =>
      validateMealSatisfactionScore({
        satisfaction_score: 3.5,
        family_member_id: 'FM006',
        meal_id: 'MEAL20240115006',
        timestamp: '2024-01-15T22:00:00Z',
      })
    ).toThrow(/整数/);

    // 必須フィールド欠落時のエラー
    expect(() =>
      validateMealSatisfactionScore({
        satisfaction_score: 1,
        family_member_id: '',
        meal_id: 'MEAL20240115007',
        timestamp: '2024-01-15T22:30:00Z',
      })
    ).toThrow(/family_member_id/);
  });
});