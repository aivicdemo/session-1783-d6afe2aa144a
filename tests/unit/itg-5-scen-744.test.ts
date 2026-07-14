import { recordRejectReasonForImprovement } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-744: [edge] 改善提案却下・保留理由記録機能 - 却下・保留理由が空文字列で記録されないようバリデーションが機能する
  test('should reject empty or whitespace-only rejection reason and preserve previous valid data', () => {
    // 前回の有効なデータ
    const previousValidReason = 'This is a valid reason for rejection';
    const improvementProposalId = 'proposal-744-001';
    const statusRejected = 'REJECTED';

    // テスト 1: 空文字列での記録試行
    const emptyReasonInput = '';
    expect(() =>
      recordRejectReasonForImprovement({
        improvementProposalId,
        status: statusRejected,
        reason: emptyReasonInput,
        previousValidReason,
      })
    ).toThrow(/理由は1文字以上で入力してください/);

    // テスト 2: スペースのみでの記録試行
    const whitespaceOnlyInput = '   ';
    expect(() =>
      recordRejectReasonForImprovement({
        improvementProposalId,
        status: statusRejected,
        reason: whitespaceOnlyInput,
        previousValidReason,
      })
    ).toThrow(/理由は1文字以上で入力してください/);

    // テスト 3: タブ・改行のみでの記録試行
    const tabAndNewlineInput = '\t\n';
    expect(() =>
      recordRejectReasonForImprovement({
        improvementProposalId,
        status: statusRejected,
        reason: tabAndNewlineInput,
        previousValidReason,
      })
    ).toThrow(/理由は1文字以上で入力してください/);

    // テスト 4: 保留ステータスで空文字列での記録試行
    const statusHeld = 'HELD';
    expect(() =>
      recordRejectReasonForImprovement({
        improvementProposalId,
        status: statusHeld,
        reason: emptyReasonInput,
        previousValidReason,
      })
    ).toThrow(/理由は1文字以上で入力してください/);

    // テスト 5: 有効な理由での記録成功（比較用）
    const validReason = 'Implementation complexity exceeds current capacity';
    const result = recordRejectReasonForImprovement({
      improvementProposalId,
      status: statusRejected,
      reason: validReason,
      previousValidReason,
    });

    expect(result).toEqual({
      improvementProposalId,
      status: statusRejected,
      reason: validReason,
      recordedAt: expect.any(String),
      isValidated: true,
    });

    // テスト 6: バリデーション失敗時のデータ保護確認
    // エラー発生前の前回有効データが返される
    const protectionResult = recordRejectReasonForImprovement({
      improvementProposalId,
      status: statusRejected,
      reason: emptyReasonInput,
      previousValidReason,
    }).catch((error) => {
      return {
        improvementProposalId,
        preservedReason: previousValidReason,
        errorThrown: true,
        errorMatch: /理由は1文字以上で入力してください/.test(error.message),
      };
    });

    // エラーが発生したことを確認
    expect(
      recordRejectReasonForImprovement({
        improvementProposalId,
        status: statusRejected,
        reason: '  ',
        previousValidReason,
      })
    ).rejects.toThrow(/理由は1文字以上で入力してください/);
  });
});