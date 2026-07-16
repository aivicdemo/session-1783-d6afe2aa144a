import { classifyImprovementProposal } from '../../src/logic/it-8-1-1-1';

describe('改善提案分類機能 - 失敗パターン別の提案分類', () => {
  // SCEN-287
  test('失敗パターンが3タイプの改善提案に正しく分類される', () => {
    // 失敗パターンA: ユーザーが目的を達成できない場合
    const proposalA = {
      proposal_id: 'PROP-A-001',
      title: 'レシピマッチング精度向上',
      description: 'ユーザーの食材制限条件が献立に反映されていないため、献立生成後のユーザー却下率が40%に達している。アレルギー検出ロジックを改善してマッチング精度を向上させる。',
      failure_pattern_category: 'user_goal_unachievable',
      affected_user_segment: 'family_with_allergies',
      impact_frequency: 127,
      impact_severity: 85,
    };

    // 失敗パターンB: ユーザーが過度な努力を強いられる場合
    const proposalB = {
      proposal_id: 'PROP-B-002',
      title: '調理時間予測アルゴリズム調整',
      description: 'システムが推定する調理時間が実際の所要時間より30分以上短く表示されるため、ユーザーが時間を読み違えて計画失敗に至っている。予測ロジックのパラメータを調整して精度を上げる。',
      failure_pattern_category: 'user_excessive_effort',
      affected_user_segment: 'time_constrained_househusbands',
      impact_frequency: 89,
      impact_severity: 72,
    };

    // 失敗パターンC: ユーザーが不安や不信感を感じる場合
    const proposalC = {
      proposal_id: 'PROP-C-003',
      title: '栄養表示信頼性向上',
      description: '献立の栄養バランス表示が、ユーザーの実際の食事記録と乖離しているため、栄養情報への不信感が生じている。栄養計算ロジックを検証し、表示精度を改善する。',
      failure_pattern_category: 'user_distrust_anxiety',
      affected_user_segment: 'nutrition_conscious_users',
      impact_frequency: 56,
      impact_severity: 78,
    };

    // 失敗パターンAの分類結果を検証
    const resultA = classifyImprovementProposal(proposalA);
    expect(resultA.classified_type).toBe('algorithm_modification');
    expect(resultA.proposal_id).toBe('PROP-A-001');
    expect(resultA.failure_pattern_category).toBe('user_goal_unachievable');
    expect(resultA.priority_score).toBe(85);
    expect(resultA.recommended_sprint).toBe('Q1-Sprint-2');
    expect(resultA.technical_feasibility).toBe('implementable');

    // 失敗パターンBの分類結果を検証
    const resultB = classifyImprovementProposal(proposalB);
    expect(resultB.classified_type).toBe('parameter_adjustment');
    expect(resultB.proposal_id).toBe('PROP-B-002');
    expect(resultB.failure_pattern_category).toBe('user_excessive_effort');
    expect(resultB.priority_score).toBe(72);
    expect(resultB.recommended_sprint).toBe('Q1-Sprint-2');
    expect(resultB.technical_feasibility).toBe('implementable');

    // 失敗パターンCの分類結果を検証
    const resultC = classifyImprovementProposal(proposalC);
    expect(resultC.classified_type).toBe('parameter_adjustment');
    expect(resultC.proposal_id).toBe('PROP-C-003');
    expect(resultC.failure_pattern_category).toBe('user_distrust_anxiety');
    expect(resultC.priority_score).toBe(78);
    expect(resultC.recommended_sprint).toBe('Q1-Sprint-1');
    expect(resultC.technical_feasibility).toBe('implementable');

    // 3タイプの分類結果が互いに異なることを検証
    expect(resultA.classified_type).not.toBe(resultB.classified_type);
    expect(resultB.classified_type).toBe(resultC.classified_type);
    expect(resultA.failure_pattern_category).not.toBe(resultB.failure_pattern_category);
    expect(resultB.failure_pattern_category).not.toBe(resultC.failure_pattern_category);
    expect(resultA.failure_pattern_category).not.toBe(resultC.failure_pattern_category);
  });
});