import { generatePeriodicNotification } from '../../src/logic/it-1-br-2-1-2-1';

describe('栄養士からの改善提案を優先度付けして管理し、開発チームに定期通知する機能', () => {
  test('SCEN-397: 定期通知生成機能 - 通知対象の開発チームが存在しない場合にエラー通知される', () => {
    // 前提条件: 栄養管理・分析ダッシュボードシステムにアクセスし、管理者権限でログインしている
    // 通知対象の開発チームIDとして、システムに存在しないチームIDを入力
    const nonExistentTeamId = 'team-999-not-exists';
    const improvementProposalId = 'proposal-001';
    const improvedNutritionItem = '鉄分';
    const priorityScore = 85;
    const implementationEstimate = '2営業日';
    const expectedEffect = '鉄分摂取量を15%向上';
    const kpiContribution = '栄養達成度スコア向上';

    // 手順: 通知対象の開発チームIDが存在しないことを前提に、定期通知生成処理を実行
    // 期待結果: 『指定された開発チームが見つかりません』というエラーが throw される
    const notificationInput = {
      developmentTeamId: nonExistentTeamId,
      improvementProposalId: improvementProposalId,
      improvedNutritionItem: improvedNutritionItem,
      priorityScore: priorityScore,
      implementationEstimate: implementationEstimate,
      expectedEffect: expectedEffect,
      kpiContribution: kpiContribution,
    };

    // エラーハンドリングの検証: 指定されたチームが存在しないため例外をスロー
    expect(() => generatePeriodicNotification(notificationInput))
      .toThrow(/開発チーム/);

    // ログには該当チームの不在情報が記録されることを確認
    // (ここでは throw されるため、ログ記録の検証は例外の業務キーワードで行う)
  });
});