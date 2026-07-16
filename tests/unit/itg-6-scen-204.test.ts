import { evaluateUserFeedbackSampleSize } from '../../src/logic/it-8-1-1-1';

describe('ユーザーフィードバック最小サンプル数判定機能', () => {
  // SCEN-204
  test('収集フィードバック数が最小要件数未満の場合、追加収集指示が正常に出力される', () => {
    // 前提条件: 栄養士がユーザーフィードバック（食事制限・アレルギー対応要望）を収集・整理する業務フェーズ
    // 発生条件: 月次栄養基準検証完了またはユーザーフィードバック集約のタイミングで、
    //           栄養士が栄養管理ダッシュボードから新規フィードバックを確認した時点

    // テスト入力: 最小要件数が10件の場合、5件のフィードバックを入力
    const minimum_required_count = 10;
    const collected_feedback_count = 5;
    const shortfall_count = minimum_required_count - collected_feedback_count;

    // 機能実行
    const result = evaluateUserFeedbackSampleSize({
      collectedCount: collected_feedback_count,
      minimumRequired: minimum_required_count,
    });

    // 期待結果:
    // 1. 収集フィードバック数が最小要件数未満であることが判定される
    expect(result.isSufficientSample).toBe(false);

    // 2. 追加フィードバック収集の指示メッセージが正常に出力される
    expect(result.instructionMessage).toBeDefined();
    expect(typeof result.instructionMessage).toBe('string');

    // 3. メッセージには不足件数が明確に記載されている
    expect(result.instructionMessage).toMatch(/5/);

    // 4. メッセージに次のステップが明確に記載されている
    expect(result.instructionMessage).toMatch(/追加収集/);

    // 5. 不足件数が正確に計算されている
    expect(result.shortfallCount).toBe(shortfall_count);

    // 6. ステータスが「追加収集必要」として正しく設定されている
    expect(result.status).toBe('collection_required');

    // 7. 追加で、正常に進行するケース（最小要件数以上のフィードバック）も検証
    const sufficient_feedback_count = 10;
    const result_sufficient = evaluateUserFeedbackSampleSize({
      collectedCount: sufficient_feedback_count,
      minimumRequired: minimum_required_count,
    });

    // - 十分なサンプル数が判定される
    expect(result_sufficient.isSufficientSample).toBe(true);

    // - ステータスが「改善課題リスト作成へ進める」に設定される
    expect(result_sufficient.status).toBe('proceed_to_improvement_list');

    // - 不足件数は0
    expect(result_sufficient.shortfallCount).toBe(0);

    // 8. 境界値テスト: ちょうど最小要件数のケース
    const boundary_feedback_count = 10;
    const result_boundary = evaluateUserFeedbackSampleSize({
      collectedCount: boundary_feedback_count,
      minimumRequired: minimum_required_count,
    });

    // - 最小要件数と同一の場合は十分と判定される
    expect(result_boundary.isSufficientSample).toBe(true);
    expect(result_boundary.status).toBe('proceed_to_improvement_list');

    // 9. エラーケース: 最小要件数が不正な値の場合
    expect(() =>
      evaluateUserFeedbackSampleSize({
        collectedCount: 5,
        minimumRequired: 0,
      })
    ).toThrow(/最小要件数/);

    // 10. エラーケース: 収集フィードバック数が負数の場合
    expect(() =>
      evaluateUserFeedbackSampleSize({
        collectedCount: -1,
        minimumRequired: 10,
      })
    ).toThrow(/フィードバック数/);

    // 11. 不足件数の詳細情報が正確に返される
    expect(result.nextStepInstructions).toBeDefined();
    expect(Array.isArray(result.nextStepInstructions)).toBe(true);
    expect(result.nextStepInstructions.length).toBeGreaterThan(0);
  });
});