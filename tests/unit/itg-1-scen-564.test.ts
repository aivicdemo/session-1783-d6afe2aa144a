import { distributeRuleDocumentWithRetry } from '../../src/logic/it-1-1-1';

const fetchMock = require('jest-fetch-mock');

describe('ルール仕様書の配布と確認追跡機能', () => {
  // SCEN-564: [error] ルール仕様書の配布と確認追跡機能 - 配布失敗時にリトライ処理が実行される
  test('配布失敗時にリトライ処理が実行される', async () => {
    fetchMock.resetMocks();

    const distributionRequest = {
      ruleDocumentId: 'rule-doc-001',
      ruleVersion: '2024-Q1-v1',
      targetUserIds: ['user-001', 'user-002', 'user-003'],
      distributionTimestamp: new Date('2024-01-15T09:00:00Z'),
      maxRetryCount: 3,
      retryIntervalMs: 100,
    };

    const failureResponse = {
      success: false,
      errorCode: 'NETWORK_TIMEOUT',
      errorMessage: 'ネットワーク接続タイムアウト',
      timestamp: '2024-01-15T09:00:00Z',
    };

    // 初回と1回目、2回目のリトライは失敗
    fetchMock.mockResponseOnce(JSON.stringify(failureResponse), { status: 500 });
    fetchMock.mockResponseOnce(JSON.stringify(failureResponse), { status: 500 });
    fetchMock.mockResponseOnce(JSON.stringify(failureResponse), { status: 500 });
    // 3回目のリトライで成功
    fetchMock.mockResponseOnce(
      JSON.stringify({
        success: true,
        distributedUserCount: 3,
        failedUserIds: [],
        distributionId: 'dist-001',
        completedAt: '2024-01-15T09:00:01Z',
      }),
      { status: 200 }
    );

    const result = await distributeRuleDocumentWithRetry(distributionRequest);

    // 配布成功の検証
    expect(result.success).toBe(true);
    expect(result.distributedUserCount).toBe(3);
    expect(result.failedUserIds).toEqual([]);
    expect(result.distributionId).toBe('dist-001');

    // リトライ情報の検証
    expect(result.retryHistory).toBeDefined();
    expect(result.retryHistory.length).toBe(3); // 初回失敗含めて3回の失敗
    expect(result.retryHistory[0].attemptNumber).toBe(1);
    expect(result.retryHistory[0].errorCode).toBe('NETWORK_TIMEOUT');
    expect(result.retryHistory[0].timestamp).toBe('2024-01-15T09:00:00Z');

    expect(result.retryHistory[1].attemptNumber).toBe(2);
    expect(result.retryHistory[1].errorCode).toBe('NETWORK_TIMEOUT');

    expect(result.retryHistory[2].attemptNumber).toBe(3);
    expect(result.retryHistory[2].errorCode).toBe('NETWORK_TIMEOUT');

    // 成功のリトライ情報
    expect(result.successAttemptNumber).toBe(4);
    expect(result.totalRetryCount).toBe(3);

    // API呼び出し回数の検証 (初回 + リトライ3回)
    expect(fetchMock.calls().length).toBe(4);
  });

  test('最大リトライ回数超過時にエラーを投げる', async () => {
    fetchMock.resetMocks();

    const distributionRequest = {
      ruleDocumentId: 'rule-doc-002',
      ruleVersion: '2024-Q1-v1',
      targetUserIds: ['user-004', 'user-005'],
      distributionTimestamp: new Date('2024-01-15T10:00:00Z'),
      maxRetryCount: 2,
      retryIntervalMs: 50,
    };

    const failureResponse = {
      success: false,
      errorCode: 'SERVICE_UNAVAILABLE',
      errorMessage: 'サービス一時利用不可',
      timestamp: '2024-01-15T10:00:00Z',
    };

    // すべてのリトライが失敗
    fetchMock.mockResponseOnce(JSON.stringify(failureResponse), { status: 503 });
    fetchMock.mockResponseOnce(JSON.stringify(failureResponse), { status: 503 });
    fetchMock.mockResponseOnce(JSON.stringify(failureResponse), { status: 503 });

    expect(() =>
      distributeRuleDocumentWithRetry(distributionRequest)
    ).rejects.toThrow(/リトライ上限/);
  });

  test('配布失敗の詳細情報が確認追跡画面に記録される', async () => {
    fetchMock.resetMocks();

    const distributionRequest = {
      ruleDocumentId: 'rule-doc-003',
      ruleVersion: '2024-Q1-v1',
      targetUserIds: ['user-006'],
      distributionTimestamp: new Date('2024-01-15T11:00:00Z'),
      maxRetryCount: 1,
      retryIntervalMs: 50,
    };

    const failureResponse = {
      success: false,
      errorCode: 'PERMISSION_DENIED',
      errorMessage: '権限不足',
      timestamp: '2024-01-15T11:00:00Z',
    };

    fetchMock.mockResponseOnce(JSON.stringify(failureResponse), { status: 403 });
    fetchMock.mockResponseOnce(JSON.stringify(failureResponse), { status: 403 });

    expect(() =>
      distributeRuleDocumentWithRetry(distributionRequest)
    ).rejects.toThrow(/権限/);
  });

  test('リトライ履歴にタイムスタンプとリトライ間隔が正しく記録される', async () => {
    fetchMock.resetMocks();

    const distributionRequest = {
      ruleDocumentId: 'rule-doc-004',
      ruleVersion: '2024-Q1-v1',
      targetUserIds: ['user-007', 'user-008', 'user-009'],
      distributionTimestamp: new Date('2024-01-15T12:00:00Z'),
      maxRetryCount: 2,
      retryIntervalMs: 75,
    };

    const failureResponse = {
      success: false,
      errorCode: 'GATEWAY_TIMEOUT',
      errorMessage: 'ゲートウェイタイムアウト',
      timestamp: '2024-01-15T12:00:00Z',
    };

    // 最初の2回は失敗、3回目成功
    fetchMock.mockResponseOnce(JSON.stringify(failureResponse), { status: 504 });
    fetchMock.mockResponseOnce(JSON.stringify(failureResponse), { status: 504 });
    fetchMock.mockResponseOnce(
      JSON.stringify({
        success: true,
        distributedUserCount: 3,
        failedUserIds: [],
        distributionId: 'dist-004',
        completedAt: '2024-01-15T12:00:01Z',
      }),
      { status: 200 }
    );

    const result = await distributeRuleDocumentWithRetry(distributionRequest);

    expect(result.success).toBe(true);
    expect(result.retryHistory.length).toBe(2);

    // リトライ間隔の検証
    expect(result.retryHistory[0].retryIntervalMs).toBe(75);
    expect(result.retryHistory[1].retryIntervalMs).toBe(75);

    // タイムスタンプの検証（ISO形式で固定値）
    expect(result.retryHistory[0].timestamp).toMatch(/2024-01-15T12:00:/);
    expect(result.retryHistory[1].timestamp).toMatch(/2024-01-15T12:00:/);
  });

  test('ネットワークエラーが発生した場合、ネットワークキーワードを含むエラーを投げる', () => {
    fetchMock.resetMocks();

    const distributionRequest = {
      ruleDocumentId: 'rule-doc-005',
      ruleVersion: '2024-Q1-v1',
      targetUserIds: ['user-010'],
      distributionTimestamp: new Date('2024-01-15T13:00:00Z'),
      maxRetryCount: 1,
      retryIntervalMs: 50,
    };

    fetchMock.mockRejectOnce(new TypeError('네트워크 오류가 발생했습니다'));

    expect(() =>
      distributeRuleDocumentWithRetry(distributionRequest)
    ).rejects.toThrow(/ネットワーク/);
  });
});