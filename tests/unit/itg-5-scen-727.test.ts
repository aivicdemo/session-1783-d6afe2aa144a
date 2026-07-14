import { evaluateTechnicalFeasibility } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能 - 技術実現性評価', () => {
  // SCEN-727: [normal] 技術実現性評価機能 - 改善提案の技術難度・実装工数・依存関係を正常に評価し、ロードマップ上の優先順位を決定できる
  test('改善提案の技術実現性評価から優先順位決定まで一連の処理が正常に機能する', () => {
    // 評価対象の改善提案データ
    const proposal_1 = {
      proposal_id: 'IMP-001',
      title: 'アルゴリズムモジュール最適化',
      technical_difficulty: 'low',
      difficulty_score: 3,
      implementation_period: 'short',
      required_days: 5,
      dependencies: [],
    };

    const proposal_2 = {
      proposal_id: 'IMP-002',
      title: 'UI/UX改善',
      technical_difficulty: 'medium',
      difficulty_score: 6,
      implementation_period: 'medium',
      required_days: 10,
      dependencies: [
        {
          dependent_proposal_id: 'IMP-001',
          dependency_type: 'blocking',
        },
      ],
    };

    const proposal_3 = {
      proposal_id: 'IMP-003',
      title: 'データベーススキーマ拡張',
      technical_difficulty: 'high',
      difficulty_score: 9,
      implementation_period: 'long',
      required_days: 20,
      dependencies: [],
    };

    const proposals = [proposal_1, proposal_2, proposal_3];

    // 技術実現性評価を実行
    const evaluation_result = evaluateTechnicalFeasibility({
      proposals: proposals,
      evaluation_date: new Date('2025-01-20T10:00:00Z'),
    });

    // 評価結果の検証
    expect(evaluation_result).toBeDefined();
    expect(evaluation_result.evaluated_proposals).toHaveLength(3);

    // 提案1の評価結果を検証（依存関係なし）
    const evaluated_proposal_1 = evaluation_result.evaluated_proposals.find(
      (p: any) => p.proposal_id === 'IMP-001'
    );
    expect(evaluated_proposal_1).toBeDefined();
    expect(evaluated_proposal_1.technical_difficulty).toBe('low');
    expect(evaluated_proposal_1.difficulty_score).toBe(3);
    expect(evaluated_proposal_1.required_days).toBe(5);
    expect(evaluated_proposal_1.dependencies).toHaveLength(0);

    // 優先度スコア計算の検証：技術難度が低く工数が短い → スコアが高い
    // 計算式: priority_score = (100 - difficulty_score) - (required_days * 2)
    // IMP-001: (100 - 3) - (5 * 2) = 97 - 10 = 87
    expect(evaluated_proposal_1.priority_score).toBe(87);
    expect(evaluated_proposal_1.priority_rank).toBe(1);

    // 提案2の評価結果を検証（ブロッキング依存あり）
    const evaluated_proposal_2 = evaluation_result.evaluated_proposals.find(
      (p: any) => p.proposal_id === 'IMP-002'
    );
    expect(evaluated_proposal_2).toBeDefined();
    expect(evaluated_proposal_2.technical_difficulty).toBe('medium');
    expect(evaluated_proposal_2.difficulty_score).toBe(6);
    expect(evaluated_proposal_2.required_days).toBe(10);
    expect(evaluated_proposal_2.dependencies).toHaveLength(1);
    expect(evaluated_proposal_2.dependencies[0].dependency_type).toBe('blocking');

    // 優先度スコア: (100 - 6) - (10 * 2) = 94 - 20 = 74
    // ただしブロッキング依存がある場合はペナルティを適用: 74 - 15 = 59
    expect(evaluated_proposal_2.priority_score).toBe(59);
    expect(evaluated_proposal_2.priority_rank).toBe(2);
    expect(evaluated_proposal_2.is_blocked_by).toContain('IMP-001');

    // 提案3の評価結果を検証（技術難度高、工数長い）
    const evaluated_proposal_3 = evaluation_result.evaluated_proposals.find(
      (p: any) => p.proposal_id === 'IMP-003'
    );
    expect(evaluated_proposal_3).toBeDefined();
    expect(evaluated_proposal_3.technical_difficulty).toBe('high');
    expect(evaluated_proposal_3.difficulty_score).toBe(9);
    expect(evaluated_proposal_3.required_days).toBe(20);
    expect(evaluated_proposal_3.dependencies).toHaveLength(0);

    // 優先度スコア: (100 - 9) - (20 * 2) = 91 - 40 = 51
    expect(evaluated_proposal_3.priority_score).toBe(51);
    expect(evaluated_proposal_3.priority_rank).toBe(3);

    // ロードマップビューの検証：優先順位が相対的に正しく設定されている
    expect(evaluation_result.roadmap_view).toBeDefined();
    expect(evaluation_result.roadmap_view).toHaveLength(3);

    // ロードマップの優先順位順序を検証
    expect(evaluation_result.roadmap_view[0].proposal_id).toBe('IMP-001');
    expect(evaluation_result.roadmap_view[0].scheduled_start_date).toEqual(
      new Date('2025-01-20T10:00:00Z')
    );

    expect(evaluation_result.roadmap_view[1].proposal_id).toBe('IMP-002');
    // IMP-002は IMP-001に依存しているため、IMP-001の完了日後に開始
    // IMP-001: 1/20 + 5日 = 1/25 完了 → IMP-002は 1/25開始
    expect(evaluation_result.roadmap_view[1].scheduled_start_date).toEqual(
      new Date('2025-01-25T10:00:00Z')
    );
    expect(evaluation_result.roadmap_view[1].scheduled_end_date).toEqual(
      new Date('2025-02-04T10:00:00Z')
    );

    expect(evaluation_result.roadmap_view[2].proposal_id).toBe('IMP-003');
    expect(evaluation_result.roadmap_view[2].scheduled_start_date).toEqual(
      new Date('2025-01-20T10:00:00Z')
    );
    expect(evaluation_result.roadmap_view[2].scheduled_end_date).toEqual(
      new Date('2025-02-09T10:00:00Z')
    );

    // 評価サマリーの検証
    expect(evaluation_result.evaluation_summary).toBeDefined();
    expect(evaluation_result.evaluation_summary.total_proposals_evaluated).toBe(3);
    expect(evaluation_result.evaluation_summary.highest_priority_proposal_id).toBe('IMP-001');
    expect(evaluation_result.evaluation_summary.total_estimated_days).toBe(
      5 + 10 + 20
    );
    expect(evaluation_result.evaluation_summary.proposals_with_blocking_dependencies).toBe(1);

    // 評価メタデータの検証
    expect(evaluation_result.evaluation_date).toEqual(
      new Date('2025-01-20T10:00:00Z')
    );
    expect(evaluation_result.status).toBe('completed');
  });
});