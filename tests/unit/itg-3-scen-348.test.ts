import { generateMenuWithMissingEvaluationData } from '../../src/logic/it-1-br-3-2-1';

const fetchMock = require('jest-fetch-mock');

describe('購入実績の記録と月次食費削減効果の自動集計・分析機能', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    jest.clearAllMocks();
  });

  // SCEN-348
  test('評価データが完全に欠落している状態で献立生成がトリガーされた場合、エラーハンドリングが適切に機能する', async () => {
    // セットアップ: 評価データが存在しない状態を表現
    const user_id = 'user_001';
    const family_id = 'family_001';
    const request_timestamp = new Date('2024-01-15T11:00:00Z');

    // 献立生成APIが評価データ欠落エラーを返す状態をモック
    fetchMock.mockResponseOnce(
      JSON.stringify({
        status: 400,
        error_code: 'EVALUATION_DATA_NOT_FOUND',
        message: '評価データが見つかりません',
        details: '献立生成に必要な評価データが存在しません',
        timestamp: request_timestamp.toISOString(),
      }),
      { status: 400 }
    );

    // 献立生成を試行する際に評価データ欠落エラーが発生することを確認
    try {
      const result = await generateMenuWithMissingEvaluationData({
        user_id,
        family_id,
        request_timestamp,
      });

      // エラーが発生して catch に到達することが期待値
      fail('エラーが発生しなかった');
    } catch (error: any) {
      // エラーステータスコードが 400 または 422 であることを確認
      expect(error.status).toBe(400);

      // エラーコードが正しいことを確認
      expect(error.error_code).toBe('EVALUATION_DATA_NOT_FOUND');

      // エラーメッセージに業務的キーワードが含まれることを確認
      expect(error.message).toMatch(/評価データ/);
      expect(error.details).toMatch(/献立生成に必要な評価データが存在しません/);

      // エラーログが記録されていることを確認（ログ内容の型チェック）
      expect(error.timestamp).toBeDefined();
      expect(typeof error.timestamp).toBe('string');
    }

    // 2回目のリクエストが正常に処理できることを確認（システム安定性検証）
    // 今回は評価データが存在する状態を表現
    const evaluation_data = [
      {
        evaluation_id: 'eval_001',
        menu_id: 'menu_001',
        satisfaction_score: 85,
        completion_rate: 90,
        family_member_id: 'member_001',
        evaluation_date: new Date('2024-01-14T18:00:00Z'),
      },
    ];

    fetchMock.mockResponseOnce(
      JSON.stringify({
        status: 200,
        menu_candidates: [
          {
            menu_id: 'menu_002',
            dishes: ['pasta', 'salad', 'bread'],
            total_satisfaction_score: 87,
            completion_rate: 92,
          },
        ],
      }),
      { status: 200 }
    );

    const second_request_result = await generateMenuWithMissingEvaluationData({
      user_id,
      family_id,
      request_timestamp: new Date('2024-01-15T12:00:00Z'),
      evaluation_data,
    });

    // 2回目のリクエストが正常に処理されたことを確認
    expect(second_request_result.status).toBe(200);
    expect(second_request_result.menu_candidates).toBeDefined();
    expect(Array.isArray(second_request_result.menu_candidates)).toBe(true);
    expect(second_request_result.menu_candidates.length).toBeGreaterThan(0);

    // 献立候補が妥当な構造を持つことを確認
    const first_candidate = second_request_result.menu_candidates[0];
    expect(first_candidate.menu_id).toBeDefined();
    expect(Array.isArray(first_candidate.dishes)).toBe(true);
    expect(typeof first_candidate.total_satisfaction_score).toBe('number');
    expect(typeof first_candidate.completion_rate).toBe('number');

    // 満足度スコアが有効範囲内（0～100）であることを確認
    expect(first_candidate.total_satisfaction_score).toBeGreaterThanOrEqual(0);
    expect(first_candidate.total_satisfaction_score).toBeLessThanOrEqual(100);
    expect(first_candidate.completion_rate).toBeGreaterThanOrEqual(0);
    expect(first_candidate.completion_rate).toBeLessThanOrEqual(100);

    // API が2回呼び出されたことを確認
    expect(fetchMock.mock.calls.length).toBe(2);
  });
});