import { analyzeIntegratedQualitativeQuantitativeData } from '../../src/logic/it-1-br-8-2-2-1';

describe('機能別使用頻度・離脱ポイント自動抽出・分析機能', () => {
  test('SCEN-317: 定性定量データ統合分析・ペイン優先度可視化機能 - 定性データと定量データが部分的に重複する場合、重複排除後に統合分析が実行される', () => {
    // テストデータ準備: 定性データ（ユーザーインタビュー記録）5件
    const qualitative_data = [
      {
        data_id: 'qual_001',
        user_id: 'user_001',
        pain_category: 'food_restriction',
        pain_score: 85,
        interview_date: '2024-01-10',
        recorded_at: '2024-01-10T10:00:00Z'
      },
      {
        data_id: 'qual_002',
        user_id: 'user_002',
        pain_category: 'cooking_time',
        pain_score: 72,
        interview_date: '2024-01-11',
        recorded_at: '2024-01-11T10:00:00Z'
      },
      {
        data_id: 'qual_003',
        user_id: 'user_003',
        pain_category: 'budget_constraint',
        pain_score: 65,
        interview_date: '2024-01-12',
        recorded_at: '2024-01-12T10:00:00Z'
      },
      {
        data_id: 'qual_004',
        user_id: 'user_001',
        pain_category: 'cooking_time',
        pain_score: 78,
        interview_date: '2024-01-13',
        recorded_at: '2024-01-13T10:00:00Z'
      },
      {
        data_id: 'qual_005',
        user_id: 'user_004',
        pain_category: 'family_preference',
        pain_score: 58,
        interview_date: '2024-01-14',
        recorded_at: '2024-01-14T10:00:00Z'
      }
    ];

    // テストデータ準備: 定量データ（アンケート結果）5件
    const quantitative_data = [
      {
        data_id: 'quant_001',
        user_id: 'user_001',
        pain_category: 'food_restriction',
        pain_score: 82,
        survey_date: '2024-01-15',
        recorded_at: '2024-01-15T11:00:00Z'
      },
      {
        data_id: 'quant_002',
        user_id: 'user_002',
        pain_category: 'cooking_time',
        pain_score: 75,
        survey_date: '2024-01-16',
        recorded_at: '2024-01-16T11:00:00Z'
      },
      {
        data_id: 'quant_003',
        user_id: 'user_005',
        pain_category: 'budget_constraint',
        pain_score: 68,
        survey_date: '2024-01-17',
        recorded_at: '2024-01-17T11:00:00Z'
      },
      {
        data_id: 'quant_004',
        user_id: 'user_001',
        pain_category: 'food_restriction',
        pain_score: 80,
        survey_date: '2024-01-18',
        recorded_at: '2024-01-18T11:00:00Z'
      },
      {
        data_id: 'quant_005',
        user_id: 'user_004',
        pain_category: 'family_preference',
        pain_score: 60,
        survey_date: '2024-01-19',
        recorded_at: '2024-01-19T11:00:00Z'
      }
    ];

    // 統合分析機能を実行
    const result = analyzeIntegratedQualitativeQuantitativeData({
      qualitative_records: qualitative_data,
      quantitative_records: quantitative_data
    });

    // 重複データ3件が正しく除外されたことを確認
    // 重複パターン:
    // 1. user_001 + food_restriction: qual_001 と quant_001, quant_004
    // 2. user_002 + cooking_time: qual_002 と quant_002
    // 3. user_004 + family_preference: qual_005 と quant_005
    // 結果: 重複データ3件が除外される
    expect(result.duplicate_records_removed).toBe(3);
    expect(result.duplicate_removal_log).toHaveLength(3);

    // 重複排除後のデータセット確認
    // 定性: 5件 - 重複度抽出 = 実質7件（重複排除前の記録数）
    // 定量: 5件 - 重複度抽出 = 実質7件（重複排除前の記録数）
    // 統合後: 14件中3件重複 = 11件の一意なデータ
    expect(result.qualitative_records_after_dedup).toBe(5);
    expect(result.quantitative_records_after_dedup).toBe(5);
    expect(result.total_unique_records).toBe(7);

    // ペイン優先度の可視化結果を確認
    expect(result.pain_priority_matrix).toBeDefined();
    expect(result.pain_priority_matrix).toHaveLength(4);

    // 可視化結果に含まれるペイン項目数を検証
    const pain_categories_in_result = result.pain_priority_matrix.map(
      (item: { pain_category: string }) => item.pain_category
    );
    expect(pain_categories_in_result).toContain('food_restriction');
    expect(pain_categories_in_result).toContain('cooking_time');
    expect(pain_categories_in_result).toContain('budget_constraint');
    expect(pain_categories_in_result).toContain('family_preference');

    // 優先度スコアが重複排除後のデータに基づいて正しく算出されていることを検証
    const food_restriction_item = result.pain_priority_matrix.find(
      (item: { pain_category: string }) => item.pain_category === 'food_restriction'
    );
    expect(food_restriction_item).toBeDefined();
    // 定性: qual_001 (85), 定量: quant_001 (82), quant_004 (80)
    // 重複排除ロジック適用: (85 + 82 + 80) / 3 = 82.33 (平均スコア)
    // 発生頻度: 2ユーザー（user_001）の記録
    expect(food_restriction_item.average_pain_score).toBeCloseTo(82.33, 1);
    expect(food_restriction_item.occurrence_frequency).toBe(2);
    expect(food_restriction_item.priority_rank).toBe(1);

    const cooking_time_item = result.pain_priority_matrix.find(
      (item: { pain_category: string }) => item.pain_category === 'cooking_time'
    );
    expect(cooking_time_item).toBeDefined();
    // 定性: qual_004 (78), 定量: quant_002 (75)
    // 平均スコア: (78 + 75) / 2 = 76.5
    // 発生頻度: 2ユーザー（user_001, user_002）の記録
    expect(cooking_time_item.average_pain_score).toBeCloseTo(76.5, 1);
    expect(cooking_time_item.occurrence_frequency).toBe(2);

    const budget_constraint_item = result.pain_priority_matrix.find(
      (item: { pain_category: string }) => item.pain_category === 'budget_constraint'
    );
    expect(budget_constraint_item).toBeDefined();
    // 定性: qual_003 (65), 定量: quant_003 (68)
    // 平均スコア: (65 + 68) / 2 = 66.5
    expect(budget_constraint_item.average_pain_score).toBeCloseTo(66.5, 1);

    // 統合分析フラグと信頼度スコア確認
    expect(result.integration_completed).toBe(true);
    expect(result.data_quality_confidence_score).toBeGreaterThanOrEqual(0.8);

    // 重複排除によるデータセット変更が適切にシステムに反映されていることを確認
    expect(result.deduplication_impact).toBeDefined();
    expect(result.deduplication_impact.records_removed_count).toBe(3);
    expect(result.deduplication_impact.affected_pain_categories).toContain('food_restriction');
    expect(result.deduplication_impact.affected_pain_categories).toContain('family_preference');

    // 分析結果に矛盾がないことを検証
    const total_pain_items = result.pain_priority_matrix.length;
    expect(total_pain_items).toBe(4);

    // 優先度ランクが正しく付与されていることを確認
    const rank_values = result.pain_priority_matrix.map(
      (item: { priority_rank: number }) => item.priority_rank
    );
    expect(rank_values).toContain(1);
    expect(rank_values).toContain(2);
    expect(rank_values).toContain(3);
    expect(rank_values).toContain(4);
    expect(Math.max(...rank_values)).toBe(4);

    // データ統合プロセスの内部ログを確認
    expect(result.process_log).toBeDefined();
    expect(result.process_log).toContain('deduplication_step_completed');
    expect(result.process_log).toContain('integration_analysis_executed');
    expect(result.process_log).toContain('priority_matrix_generated');
  });
});