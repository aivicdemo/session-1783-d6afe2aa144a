import { recordDietaryRestrictionChangeAuditLog } from '../../src/logic/it-7-2-1';

describe('献立生成の成功率・調理時間短縮度・ユーザー満足度スコアなどの行動指標を週次で自動集計し、アルゴリズム改善前後の効果差を定量比較するダッシュボード機能', () => {
  // SCEN-659: [error] 食事制限条件変更の監査ログ記録機能 - 変更者情報が不完全な場合にログ記録が失敗する
  test('変更者情報が不完全な場合、監査ログ記録が失敗し適切なエラーが返される', () => {
    // テスト前提: 食事制限条件の変更が実施され、変更内容と変更者情報を監査ログに記録する必要がある状態
    // 発火条件: 変更者情報（ユーザーID、ユーザー名など）の一部が不完全（空 or undefined）の場合
    // 期待結果: 監査ログ記録が失敗し、変更内容は保存されないか部分的状態で保存される。
    //          エラーメッセージ「変更者情報が不足しています。管理者に連絡してください」が返される。

    // ケース1: ユーザーID が undefined の場合
    const incompleteChangerInfo_1 = {
      changer_user_id: undefined,
      changer_user_name: '田中太郎',
      changer_email: 'tanaka@example.com',
    };

    const changeRecord_1 = {
      change_content: 'アレルギー情報を小麦から卵に更新',
      timestamp: new Date('2024-01-15T11:00:00Z'),
      dietary_restriction_id: 12345,
    };

    expect(() =>
      recordDietaryRestrictionChangeAuditLog(changeRecord_1, incompleteChangerInfo_1)
    ).toThrow(/変更者情報/);

    // ケース2: ユーザー名が空文字列の場合
    const incompleteChangerInfo_2 = {
      changer_user_id: 'user_001',
      changer_user_name: '',
      changer_email: 'tanaka@example.com',
    };

    expect(() =>
      recordDietaryRestrictionChangeAuditLog(changeRecord_1, incompleteChangerInfo_2)
    ).toThrow(/変更者情報/);

    // ケース3: メールアドレスが未設定の場合
    const incompleteChangerInfo_3 = {
      changer_user_id: 'user_001',
      changer_user_name: '田中太郎',
      changer_email: null,
    };

    expect(() =>
      recordDietaryRestrictionChangeAuditLog(changeRecord_1, incompleteChangerInfo_3)
    ).toThrow(/変更者情報/);

    // ケース4: 完全な変更者情報で成功する場合
    const completeChangerInfo = {
      changer_user_id: 'user_001',
      changer_user_name: '田中太郎',
      changer_email: 'tanaka@example.com',
    };

    const result = recordDietaryRestrictionChangeAuditLog(
      changeRecord_1,
      completeChangerInfo
    );

    // 成功時は監査ログレコードが返される
    expect(result).toEqual({
      audit_log_id: expect.any(String),
      change_content: 'アレルギー情報を小麦から卵に更新',
      timestamp: new Date('2024-01-15T11:00:00Z'),
      changer_user_id: 'user_001',
      changer_user_name: '田中太郎',
      changer_email: 'tanaka@example.com',
      dietary_restriction_id: 12345,
      is_saved: true,
      error_message: null,
    });

    // ケース5: 複数の変更者情報が不足している場合
    const multipleIncompleteChangerInfo = {
      changer_user_id: undefined,
      changer_user_name: '',
      changer_email: 'tanaka@example.com',
    };

    expect(() =>
      recordDietaryRestrictionChangeAuditLog(
        changeRecord_1,
        multipleIncompleteChangerInfo
      )
    ).toThrow(/変更者情報/);
  });
});