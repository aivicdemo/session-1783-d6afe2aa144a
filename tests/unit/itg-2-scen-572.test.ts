import { initiateCriticalAlgorithmReviewProcess } from '../../src/logic/it-1-br-2-1-2-1';

describe('栄養基準ロジック改善提案の優先度付けと開発チーム提出', () => {
  test('SCEN-572: 重大なアルゴリズム障害検出時に1秒以内に参加者確認プロセスが自動開始される', () => {
    // 前提: 栄養士がシステムにログイン済み、アルゴリズム改善レビュー会議の管理画面が開かれている状態
    const criticalErrorDetectedAt = new Date('2024-01-15T09:00:00Z');
    const systemLogTime = criticalErrorDetectedAt.getTime();

    // トリガー: 重大なアルゴリズム障害（エラーレベル：CRITICAL）をシステムに注入
    const criticalAlgorithmError = {
      severity: 'CRITICAL',
      errorCode: 'ALGO_001',
      message: 'Meal generation algorithm failure - nutritional constraints not satisfied',
      detectedAt: criticalErrorDetectedAt,
      affectedUsers: 1247,
    };

    // 参加者リストの定義
    const registeredParticipants = [
      {
        userId: 'P001',
        name: '栄養士A',
        role: 'nutritionist',
        email: 'nutritionist_a@example.com',
        status: 'available',
        delegateAssigned: null,
      },
      {
        userId: 'P002',
        name: 'PM担当者',
        role: 'product_manager',
        email: 'pm@example.com',
        status: 'available',
        delegateAssigned: null,
      },
      {
        userId: 'P003',
        name: 'アプリ開発チームリード',
        role: 'tech_lead',
        email: 'tech_lead@example.com',
        status: 'available',
        delegateAssigned: null,
      },
    ];

    // プロセス開始の入力
    const reviewProcessInput = {
      triggeredByCriticalError: true,
      errorSeverity: criticalAlgorithmError.severity,
      errorDetectedAt: criticalAlgorithmError.detectedAt,
      affectedUserCount: criticalAlgorithmError.affectedUsers,
      participantsList: registeredParticipants,
      autoStartEnabled: true,
      maxResponseTimeMs: 1000, // 1秒以内に開始する必要がある
    };

    // ビジネスロジック実行: 参加者確認プロセスの自動開始
    const processStartResult = initiateCriticalAlgorithmReviewProcess(reviewProcessInput);

    // 期待結果検証1: プロセスが自動開始されたことを確認
    expect(processStartResult.processStarted).toBe(true);

    // 期待結果検証2: 開始時刻と障害検出時刻の差分が1秒以内であることを確認
    const processStartedAt = new Date(processStartResult.processStartedAt).getTime();
    const errorDetectedAtMs = criticalAlgorithmError.detectedAt.getTime();
    const timeDiffMs = processStartedAt - errorDetectedAtMs;
    expect(timeDiffMs).toBeLessThanOrEqual(1000);
    expect(timeDiffMs).toBeGreaterThanOrEqual(0);

    // 期待結果検証3: 参加者確認画面が即座に表示されたことを検証
    expect(processStartResult.participantConfirmationScreenDisplayed).toBe(true);

    // 期待結果検証4: 登録済みの全参加者が正しく一覧表示されていることを確認
    expect(processStartResult.displayedParticipants).toHaveLength(3);
    expect(processStartResult.displayedParticipants).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          userId: 'P001',
          name: '栄養士A',
          role: 'nutritionist',
          status: 'available',
        }),
        expect.objectContaining({
          userId: 'P002',
          name: 'PM担当者',
          role: 'product_manager',
          status: 'available',
        }),
        expect.objectContaining({
          userId: 'P003',
          name: 'アプリ開発チームリード',
          role: 'tech_lead',
          status: 'available',
        }),
      ])
    );

    // 期待結果検証5: 代理割り当て機能が有効化されていることを確認
    expect(processStartResult.delegateAssignmentEnabled).toBe(true);
    expect(processStartResult.delegateAssignmentAvailable).toBe(true);

    // 期待結果検証6: システムログに自動開始のトリガーが記録されていることを確認
    expect(processStartResult.systemLog).toBeDefined();
    expect(processStartResult.systemLog.length).toBeGreaterThan(0);
    expect(processStartResult.systemLog).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          logType: 'CRITICAL_ERROR_DETECTED',
          timestamp: expect.any(String),
          message: expect.stringContaining('CRITICAL'),
        }),
        expect.objectContaining({
          logType: 'PROCESS_AUTO_INITIATED',
          timestamp: expect.any(String),
          triggeredBy: 'CRITICAL_ERROR',
        }),
      ])
    );

    // 期待結果検証7: プロセスのステータスが正しいことを確認
    expect(processStartResult.processStatus).toBe('PARTICIPANT_CONFIRMATION_PENDING');

    // 期待結果検証8: 初期状態では代理者が未割り当てであることを確認
    processStartResult.displayedParticipants.forEach((participant) => {
      expect(participant.delegateAssigned).toBeNull();
    });

    // 期待結果検証9: エラーレベルが CRITICAL であることが正しく反映されていることを確認
    expect(processStartResult.triggerErrorSeverity).toBe('CRITICAL');

    // 期待結果検証10: 影響を受けたユーザー数が記録されていることを確認
    expect(processStartResult.affectedUserCount).toBe(1247);
  });
});