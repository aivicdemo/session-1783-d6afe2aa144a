import { calculatePriorityScores } from '../../src/logic/it-1-br-2-1-2-1';

describe('栄養士改善提案の優先度スコアリング', () => {
  // SCEN-520
  test('改善課題の優先度スコアリング - スコアリング基準が不完全な場合、算出失敗エラーが発生する', () => {
    // 前提: 栄養管理・分析ダッシュボードシステムにログイン済み
    // 改善課題管理画面で改善課題の優先度スコアリング機能にアクセス
    // スコアリング基準の設定画面を表示

    // 必須項目の一部（重要度の重み付け値）を意図的に削除または未入力のまま保存
    const incompleteScoreCriteria = {
      businessValueWeight: 0.4,
      // technicalDifficultyWeight: 0.3,  // 意図的に欠落
      userImpactWeight: 0.3,
    };

    const improvementIssues = [
      {
        issue_id: 'issue_001',
        title: '栄養バランス判定ロジック改善',
        businessValueScore: 8,
        technicalDifficultyScore: 6,
        userImpactScore: 7,
      },
      {
        issue_id: 'issue_002',
        title: '食材制限の漏れ検出精度向上',
        businessValueScore: 7,
        technicalDifficultyScore: 5,
        userImpactScore: 8,
      },
    ];

    // スコアリング算出ボタンをクリック → 複数の改善課題に対してスコアリング処理を実行
    // 期待結果: スコアリング基準が不完全な場合、適切なエラーが throw される
    expect(() =>
      calculatePriorityScores({
        scoreCriteria: incompleteScoreCriteria,
        issues: improvementIssues,
      })
    ).toThrow(/スコアリング基準/);
  });

  // 境界値テスト: 正常系（すべてのスコアリング基準が完全）
  test('改善課題の優先度スコアリング - スコアリング基準が完全な場合、正しく優先度スコアが算出される', () => {
    const completeScoringCriteria = {
      businessValueWeight: 0.4,
      technicalDifficultyWeight: 0.3,
      userImpactWeight: 0.3,
    };

    const improvementIssues = [
      {
        issue_id: 'issue_001',
        title: '栄養バランス判定ロジック改善',
        businessValueScore: 8,
        technicalDifficultyScore: 6,
        userImpactScore: 7,
      },
      {
        issue_id: 'issue_002',
        title: '食材制限の漏れ検出精度向上',
        businessValueScore: 7,
        technicalDifficultyScore: 5,
        userImpactScore: 8,
      },
    ];

    // 期待値計算（structured.formula に基づく）:
    // issue_001: 8 * 0.4 + (10 - 6) * 0.3 + 7 * 0.3 = 3.2 + 1.2 + 2.1 = 6.5
    // issue_002: 7 * 0.4 + (10 - 5) * 0.3 + 8 * 0.3 = 2.8 + 1.5 + 2.4 = 6.7
    const result = calculatePriorityScores({
      scoreCriteria: completeScoringCriteria,
      issues: improvementIssues,
    });

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      issue_id: 'issue_001',
      title: '栄養バランス判定ロジック改善',
      priorityScore: 6.5,
      rank: 2,
    });
    expect(result[1]).toEqual({
      issue_id: 'issue_002',
      title: '食材制限の漏れ検出精度向上',
      priorityScore: 6.7,
      rank: 1,
    });
  });

  // エラーテスト: 重み付け値の合計が1でない場合
  test('改善課題の優先度スコアリング - 重み付け値の合計が1でない場合、検証エラーが発生する', () => {
    const invalidWeightCriteria = {
      businessValueWeight: 0.4,
      technicalDifficultyWeight: 0.3,
      userImpactWeight: 0.4, // 合計が 1.1 になる
    };

    const improvementIssues = [
      {
        issue_id: 'issue_001',
        title: '栄養バランス判定ロジック改善',
        businessValueScore: 8,
        technicalDifficultyScore: 6,
        userImpactScore: 7,
      },
    ];

    expect(() =>
      calculatePriorityScores({
        scoreCriteria: invalidWeightCriteria,
        issues: improvementIssues,
      })
    ).toThrow(/重み付け/);
  });

  // エラーテスト: 改善課題が空配列の場合
  test('改善課題の優先度スコアリング - 改善課題が空の場合、空配列を返す', () => {
    const validScoringCriteria = {
      businessValueWeight: 0.4,
      technicalDifficultyWeight: 0.3,
      userImpactWeight: 0.3,
    };

    const result = calculatePriorityScores({
      scoreCriteria: validScoringCriteria,
      issues: [],
    });

    expect(result).toEqual([]);
  });

  // エラーテスト: 改善課題のスコアが範囲外の場合
  test('改善課題の優先度スコアリング - 改善課題のスコアが0-10範囲外の場合、入力値エラーが発生する', () => {
    const validScoringCriteria = {
      businessValueWeight: 0.4,
      technicalDifficultyWeight: 0.3,
      userImpactWeight: 0.3,
    };

    const invalidScoreIssues = [
      {
        issue_id: 'issue_001',
        title: '栄養バランス判定ロジック改善',
        businessValueScore: 15, // 範囲外
        technicalDifficultyScore: 6,
        userImpactScore: 7,
      },
    ];

    expect(() =>
      calculatePriorityScores({
        scoreCriteria: validScoringCriteria,
        issues: invalidScoreIssues,
      })
    ).toThrow(/スコア/);
  });

  // 境界値テスト: すべてのスコアが最大値の場合
  test('改善課題の優先度スコアリング - すべてのスコアが最大値の場合、最高優先度スコアが算出される', () => {
    const validScoringCriteria = {
      businessValueWeight: 0.4,
      technicalDifficultyWeight: 0.3,
      userImpactWeight: 0.3,
    };

    const maxScoreIssues = [
      {
        issue_id: 'issue_001',
        title: '高優先度改善',
        businessValueScore: 10,
        technicalDifficultyScore: 10,
        userImpactScore: 10,
      },
    ];

    // 期待値: 10 * 0.4 + (10 - 10) * 0.3 + 10 * 0.3 = 4 + 0 + 3 = 7
    const result = calculatePriorityScores({
      scoreCriteria: validScoringCriteria,
      issues: maxScoreIssues,
    });

    expect(result[0].priorityScore).toBe(7);
  });

  // 境界値テスト: すべてのスコアが最小値の場合
  test('改善課題の優先度スコアリング - すべてのスコアが最小値の場合、最低優先度スコアが算出される', () => {
    const validScoringCriteria = {
      businessValueWeight: 0.4,
      technicalDifficultyWeight: 0.3,
      userImpactWeight: 0.3,
    };

    const minScoreIssues = [
      {
        issue_id: 'issue_001',
        title: '低優先度改善',
        businessValueScore: 0,
        technicalDifficultyScore: 0,
        userImpactScore: 0,
      },
    ];

    // 期待値: 0 * 0.4 + (10 - 0) * 0.3 + 0 * 0.3 = 0 + 3 + 0 = 3
    const result = calculatePriorityScores({
      scoreCriteria: validScoringCriteria,
      issues: minScoreIssues,
    });

    expect(result[0].priorityScore).toBe(3);
  });
});