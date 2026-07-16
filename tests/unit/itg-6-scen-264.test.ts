import { classifyMealFeedbackReason } from '../../src/logic/it-8-1-2-1';

describe('献立却下修正理由自動分類機能', () => {
  // SCEN-264
  test('事前定義カテゴリに該当しない却下修正理由が入力された場合に分類エラーが発生する', () => {
    // Precondition: 献立却下修正理由自動分類機能の初期化を実行する
    const undefinedReason = '予測不可能な新規理由';
    const predefinedCategories = [
      '栄養バランス不適切',
      '家族好み未反映',
      '調理時間超過',
      '食材制限漏れ'
    ];

    // Trigger: 事前定義カテゴリに該当しない却下修正理由テキストを入力して分類処理を実行する
    // Expected Result: 分類エラーが発生し、適切なエラーメッセージと正しいステータスコードが返却される
    const result = classifyMealFeedbackReason({
      reason: undefinedReason,
      predefinedCategories: predefinedCategories,
      timestamp: new Date('2024-01-15T11:00:00Z').toISOString()
    });

    // Assertion 1: エラーハンドリングの動作を確認する
    expect(result.isSuccess).toBe(false);

    // Assertion 2: エラーステータスコードが返却される
    expect(result.statusCode).toBe(400);

    // Assertion 3: エラーメッセージが分類不可のカテゴリ情報を含む
    expect(result.errorMessage).toMatch(/分類不可/);

    // Assertion 4: エラーメッセージに入力された理由が含まれる
    expect(result.errorMessage).toMatch(/予測不可能な新規理由/);

    // Assertion 5: エラーログが正しく記録されている
    expect(result.errorLog).toBeDefined();
    expect(result.errorLog).toBeTruthy();

    // Assertion 6: 分類カテゴリが null またはエラー状態を示す値
    expect(result.classifiedCategory).toBeNull();

    // Assertion 7: エラーログに理由テキストが含まれている
    expect(result.errorLog).toMatch(/予測不可能な新規理由/);

    // Assertion 8: エラーログにタイムスタンプが含まれている
    expect(result.errorLog).toMatch(/2024-01-15/);

    // Assertion 9: 処理は停止していない（正常系と同じレスポンス構造を返している）
    expect(result).toHaveProperty('statusCode');
    expect(result).toHaveProperty('isSuccess');
    expect(result).toHaveProperty('errorMessage');
    expect(result).toHaveProperty('classifiedCategory');
    expect(result).toHaveProperty('errorLog');

    // Assertion 10: ステータスコードが400（Bad Request）を示す
    expect(result.statusCode).toBeGreaterThanOrEqual(400);
    expect(result.statusCode).toBeLessThan(500);
  });
});