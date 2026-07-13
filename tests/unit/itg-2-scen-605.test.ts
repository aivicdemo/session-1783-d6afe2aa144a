import { notifyDevelopmentTeamRegularly } from '../../src/logic/it-1-br-2-1-2-1';

describe('栄養士からの改善提案を優先度付けして管理し、開発チームに定期通知する機能', () => {
  // SCEN-605
  test('[error] 改善提案の開発チーム定期通知 - 開発チームアドレスが未設定の場合に通知送信がエラーハンドルされる', () => {
    const improvement_proposal_id = 'PROP-001';
    const proposal_title = '献立生成アルゴリズムの栄養バランス改善';
    const proposal_description = '栄養項目ごとの目標値と実績値の達成度を百分率で計算し、ギャップが大きい項目を優先度付けして改善';
    const priority_score = 85;
    const business_value = 9;
    const technical_difficulty = 7;
    const user_impact = 8;
    const development_team_email = null;
    const proposal_timestamp = new Date('2024-02-15T10:30:00Z');
    const nutritionist_id = 'NT-001';

    const notification_input = {
      improvement_proposal_id,
      proposal_title,
      proposal_description,
      priority_score,
      business_value,
      technical_difficulty,
      user_impact,
      development_team_email,
      proposal_timestamp,
      nutritionist_id,
    };

    expect(() => notifyDevelopmentTeamRegularly(notification_input)).toThrow(/開発チームアドレス/);
  });
});