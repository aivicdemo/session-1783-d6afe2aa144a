import { recordRejectReasonForImprovementProposal } from '../../src/logic/it-7-3-1';

const fetchMock = require('jest-fetch-mock');

describe('献立却下・修正理由の分類と失敗パターン特定 - 改善提案却下・保留理由記録', () => {
  test('SCEN-743: カテゴリ外の却下・保留理由でエラーが発生する', async () => {
    fetchMock.enableMocks();
    fetchMock.resetMocks();

    const improvementProposalId = 'proposal_test_001';
    const invalidReasonCategory = 'invalid_reason';
    const invalidReason = '未定義カテゴリ';

    // カテゴリ外の値を入力した場合のエラーレスポンスをモック
    fetchMock.mockResponseOnce(
      JSON.stringify({
        error: true,
        message: '指定された理由カテゴリが無効です',
        statusCode: 400,
      }),
      { status: 400 }
    );

    // エラーが発生することを確認
    await expect(
      recordRejectReasonForImprovementProposal({
        improvement_proposal_id: improvementProposalId,
        reason_category: invalidReasonCategory,
        reason_text: invalidReason,
      })
    ).rejects.toThrow(/カテゴリ/);

    // fetchが正しく呼ばれたことを確認
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/improvement-proposals/record-reject-reason'),
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  test('SCEN-743: 422ステータスコードでカテゴリバリデーションエラーが返却される', async () => {
    fetchMock.enableMocks();
    fetchMock.resetMocks();

    const improvementProposalId = 'proposal_test_002';
    const invalidReasonCategory = 'unknown_status';

    // 422 Unprocessable Entity レスポンスをモック
    fetchMock.mockResponseOnce(
      JSON.stringify({
        error: true,
        message: '指定された理由カテゴリが無効です',
        statusCode: 422,
      }),
      { status: 422 }
    );

    // エラーが発生し、422ステータスが含まれることを確認
    await expect(
      recordRejectReasonForImprovementProposal({
        improvement_proposal_id: improvementProposalId,
        reason_category: invalidReasonCategory,
        reason_text: 'テスト理由',
      })
    ).rejects.toThrow(/理由カテゴリ/);

    const lastCall = fetchMock.mock.calls[fetchMock.mock.calls.length - 1];
    expect(lastCall).toBeDefined();
  });

  test('SCEN-743: 有効なカテゴリ値で正常に記録される', async () => {
    fetchMock.enableMocks();
    fetchMock.resetMocks();

    const improvementProposalId = 'proposal_test_003';
    const validReasonCategory = 'algorithm_improvement';
    const reasonText = '栄養バランスロジックの改善が必要';

    // 正常なレスポンスをモック
    fetchMock.mockResponseOnce(
      JSON.stringify({
        success: true,
        improvement_proposal_id: improvementProposalId,
        reason_category: validReasonCategory,
        reason_text: reasonText,
        recorded_at: '2024-01-15T11:30:00Z',
      }),
      { status: 200 }
    );

    const result = await recordRejectReasonForImprovementProposal({
      improvement_proposal_id: improvementProposalId,
      reason_category: validReasonCategory,
      reason_text: reasonText,
    });

    expect(result).toEqual({
      success: true,
      improvement_proposal_id: improvementProposalId,
      reason_category: validReasonCategory,
      reason_text: reasonText,
      recorded_at: '2024-01-15T11:30:00Z',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test('SCEN-743: 複数のカテゴリ外値でそれぞれエラーが発生する', async () => {
    fetchMock.enableMocks();

    const invalidCategories = [
      'invalid_category_1',
      'unknown_type',
      'random_value',
    ];

    for (const category of invalidCategories) {
      fetchMock.resetMocks();
      fetchMock.mockResponseOnce(
        JSON.stringify({
          error: true,
          message: '指定された理由カテゴリが無効です',
          statusCode: 400,
        }),
        { status: 400 }
      );

      await expect(
        recordRejectReasonForImprovementProposal({
          improvement_proposal_id: 'proposal_test_boundary',
          reason_category: category,
          reason_text: 'テスト理由',
        })
      ).rejects.toThrow(/カテゴリ/);
    }
  });
});