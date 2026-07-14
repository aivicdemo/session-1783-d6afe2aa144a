import { validateMonthlyVerificationTiming } from '../../src/logic/it-7-2-1';

describe('月次検証タイミング判定機能 - 前月データ不完全時の処理', () => {
  test('SCEN-782: 前月のデータが不完全な場合に検証実行不可の判定を正確に返す', () => {
    // 不完全なデータセット: 必須フィールド欠落
    const incompleteDataset = {
      menus: [
        {
          menuId: 'menu-001',
          generatedAt: '2024-01-15T10:00:00Z',
          successFlag: true,
          // 必須フィールド: satisfactionScore が欠落
        },
      ],
      preparations: [
        {
          prepId: 'prep-001',
          estimatedTime: 30,
          // 必須フィールド: actualTime が欠落
        },
      ],
      evaluations: [
        {
          evalId: 'eval-001',
          satisfactionScore: null, // 不正な値（null）
        },
      ],
      recordedAt: '2024-01-31T23:59:59Z',
    };

    const result = validateMonthlyVerificationTiming(incompleteDataset);

    // 期待結果: 検証実行不可の判定
    expect(result.canExecuteVerification).toBe(false);

    // ステータスコードが示す不完全データの判定
    expect(result.statusCode).toBe('DATA_INCOMPLETE');

    // 不完全な項目の詳細がエラーメッセージに記録
    expect(result.errorMessage).toMatch(/satisfactionScore/);
    expect(result.errorMessage).toMatch(/actualTime/);

    // 警告メッセージが返される
    expect(result.warnings).toHaveLength(3);
    expect(result.warnings[0]).toMatch(/satisfactionScore/);
    expect(result.warnings[1]).toMatch(/actualTime/);
    expect(result.warnings[2]).toMatch(/不正な値/);

    // 検証スキップフラグが真に設定
    expect(result.skipVerification).toBe(true);

    // 検証対象月が正確に識別されている
    expect(result.targetMonth).toBe('2024-01');

    // ユーザーに通知するメッセージが生成
    expect(result.notificationMessage).toMatch(/データが不完全/);
    expect(result.notificationMessage).toMatch(/検証を実行できません/);
  });

  test('SCEN-782: 複数の不完全要因が同時に検出される場合、全て記録される', () => {
    const severelyIncompleteDataset = {
      menus: [],
      // 完全に空の献立データ
      preparations: null,
      // null 値
      evaluations: [
        {
          evalId: 'eval-001',
          // 複数の必須フィールド欠落
        },
      ],
      recordedAt: '2024-02-28T23:59:59Z',
    };

    const result = validateMonthlyVerificationTiming(severelyIncompleteDataset);

    expect(result.canExecuteVerification).toBe(false);
    expect(result.statusCode).toBe('DATA_INCOMPLETE');
    expect(result.skipVerification).toBe(true);

    // 複数の不完全要因が全て記録される
    expect(result.warnings.length).toBeGreaterThanOrEqual(3);

    // 各不完全要因が個別に記録
    const warningText = result.warnings.join('|');
    expect(warningText).toMatch(/メニュー/);
    expect(warningText).toMatch(/準備/);
    expect(warningText).toMatch(/評価/);

    expect(result.incompleteItemCount).toBe(3);
  });

  test('SCEN-782: 完全なデータセットの場合は検証実行可能と判定される', () => {
    const completeDataset = {
      menus: [
        {
          menuId: 'menu-001',
          generatedAt: '2024-01-15T10:00:00Z',
          successFlag: true,
          satisfactionScore: 4.5,
        },
      ],
      preparations: [
        {
          prepId: 'prep-001',
          estimatedTime: 30,
          actualTime: 28,
        },
      ],
      evaluations: [
        {
          evalId: 'eval-001',
          satisfactionScore: 4.5,
          completionRate: 0.95,
        },
      ],
      recordedAt: '2024-01-31T23:59:59Z',
    };

    const result = validateMonthlyVerificationTiming(completeDataset);

    expect(result.canExecuteVerification).toBe(true);
    expect(result.statusCode).toBe('READY_FOR_VERIFICATION');
    expect(result.skipVerification).toBe(false);
    expect(result.warnings).toHaveLength(0);
    expect(result.targetMonth).toBe('2024-01');
  });

  test('SCEN-782: 欠落している必須フィールドが明確に特定される', () => {
    const datasetWithMissingFields = {
      menus: [
        {
          menuId: 'menu-001',
          // generatedAt 欠落
          successFlag: true,
          satisfactionScore: 4.0,
        },
      ],
      preparations: [
        {
          // prepId 欠落
          estimatedTime: 30,
          actualTime: 28,
        },
      ],
      evaluations: [
        {
          evalId: 'eval-001',
          satisfactionScore: 4.5,
          // completionRate 欠落
        },
      ],
      recordedAt: '2024-01-31T23:59:59Z',
    };

    const result = validateMonthlyVerificationTiming(datasetWithMissingFields);

    expect(result.canExecuteVerification).toBe(false);
    expect(result.statusCode).toBe('DATA_INCOMPLETE');

    // 各欠落フィールドが個別に特定される
    expect(result.missingFields).toContain('menus[0].generatedAt');
    expect(result.missingFields).toContain('preparations[0].prepId');
    expect(result.missingFields).toContain('evaluations[0].completionRate');

    expect(result.missingFieldCount).toBe(3);
  });

  test('SCEN-782: 不正な値を含むレコードが検出される', () => {
    const datasetWithInvalidValues = {
      menus: [
        {
          menuId: 'menu-001',
          generatedAt: '2024-01-15T10:00:00Z',
          successFlag: true,
          satisfactionScore: 5.5, // 不正：範囲外（0～5）
        },
      ],
      preparations: [
        {
          prepId: 'prep-001',
          estimatedTime: -10, // 不正：負数
          actualTime: 28,
        },
      ],
      evaluations: [
        {
          evalId: 'eval-001',
          satisfactionScore: 'invalid', // 不正：文字列型
          completionRate: 1.5, // 不正：範囲外（0～1）
        },
      ],
      recordedAt: '2024-01-31T23:59:59Z',
    };

    const result = validateMonthlyVerificationTiming(datasetWithInvalidValues);

    expect(result.canExecuteVerification).toBe(false);
    expect(result.statusCode).toBe('DATA_INCOMPLETE');

    // 不正な値が全て検出される
    expect(result.invalidFields).toContain('menus[0].satisfactionScore');
    expect(result.invalidFields).toContain('preparations[0].estimatedTime');
    expect(result.invalidFields).toContain('evaluations[0].satisfactionScore');
    expect(result.invalidFields).toContain('evaluations[0].completionRate');

    expect(result.invalidFieldCount).toBe(4);
  });

  test('SCEN-782: 検証スキップ時にユーザー通知メッセージが適切に生成される', () => {
    const incompleteDataset = {
      menus: [
        {
          menuId: 'menu-001',
          // 必須フィールド欠落
        },
      ],
      preparations: [],
      evaluations: [],
      recordedAt: '2024-01-31T23:59:59Z',
    };

    const result = validateMonthlyVerificationTiming(incompleteDataset);

    expect(result.canExecuteVerification).toBe(false);
    expect(result.skipVerification).toBe(true);

    // ユーザーへの通知メッセージが明確
    expect(result.notificationMessage).toBeDefined();
    expect(result.notificationMessage.length).toBeGreaterThan(0);
    expect(result.notificationMessage).toMatch(/検証|実行|できません|不完全/);

    // エラーコードが明確に設定されている
    expect(result.errorCode).toBe('VERIFY_SKIP_INCOMPLETE_DATA');
  });
});