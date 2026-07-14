import { calculatePainQuantificationAndDifferentiationAxes } from '../../src/logic/it-7-3-1';

describe('献立却下・修正理由の自動カテゴリ分類と失敗パターン集計機能', () => {
  // SCEN-938: [edge] 専業主夫層ペイン定量化と差別化軸生成 - ペイン要因の発生頻度がゼロまたは改善効果がゼロの機能が差別化軸候補から正しく除外される
  test('should exclude features with zero occurrence frequency or zero improvement effect from differentiation axis candidates', () => {
    // テストデータ: 発生頻度0を含む機能セット
    const pain_quantification_data_with_zero_occurrence = [
      {
        feature_id: 'feat_001',
        feature_name: '栄養バランス自動調整',
        occurrence_frequency: 0, // ゼロ発生頻度
        improvement_effect_score: 85, // 改善効果85点（有効だが発生しない）
        segment: 'homemaker_husband_30s',
        pain_factor_category: 'nutrition'
      },
      {
        feature_id: 'feat_002',
        feature_name: '調理時間短縮提案',
        occurrence_frequency: 25, // 発生頻度25件
        improvement_effect_score: 0, // ゼロ改善効果
        segment: 'homemaker_husband_30s',
        pain_factor_category: 'cooking_time'
      },
      {
        feature_id: 'feat_003',
        feature_name: '家族好み学習',
        occurrence_frequency: 42, // 発生頻度42件
        improvement_effect_score: 78, // 改善効果78点（有効）
        segment: 'homemaker_husband_30s',
        pain_factor_category: 'preference'
      },
      {
        feature_id: 'feat_004',
        feature_name: '食材在庫管理',
        occurrence_frequency: 0, // ゼロ発生頻度
        improvement_effect_score: 0, // ゼロ改善効果（発生しない・効果もない）
        segment: 'homemaker_husband_30s',
        pain_factor_category: 'inventory'
      },
      {
        feature_id: 'feat_005',
        feature_name: '予算最適化',
        occurrence_frequency: 35, // 発生頻度35件
        improvement_effect_score: 92, // 改善効果92点（有効）
        segment: 'homemaker_husband_30s',
        pain_factor_category: 'budget'
      }
    ];

    // 関数実行
    const result = calculatePainQuantificationAndDifferentiationAxes(
      pain_quantification_data_with_zero_occurrence,
      'homemaker_husband_30s'
    );

    // アサーション 1: 差別化軸候補リストを取得
    expect(result).toBeDefined();
    expect(result.differentiation_axis_candidates).toBeDefined();
    expect(Array.isArray(result.differentiation_axis_candidates)).toBe(true);

    // アサーション 2: 除外対象の機能数を確認
    // 除外対象: feat_001（発生頻度0）, feat_002（改善効果0）, feat_004（発生頻度0 かつ改善効果0）
    const excluded_feature_count = 3;
    const excluded_features = [
      'feat_001', // occurrence_frequency = 0
      'feat_002', // improvement_effect_score = 0
      'feat_004'  // both 0
    ];

    // アサーション 3: 候補リストに除外対象の機能が含まれていないことを確認
    const candidate_feature_ids = result.differentiation_axis_candidates.map(
      (c: any) => c.feature_id
    );

    excluded_features.forEach((excluded_id: string) => {
      expect(candidate_feature_ids).not.toContain(excluded_id);
    });

    // アサーション 4: 候補リストに有効な機能のみが含まれていることを確認
    // 有効な機能: feat_003（発生頻度42, 改善効果78）, feat_005（発生頻度35, 改善効果92）
    const valid_feature_ids = ['feat_003', 'feat_005'];
    valid_feature_ids.forEach((valid_id: string) => {
      expect(candidate_feature_ids).toContain(valid_id);
    });

    // アサーション 5: 候補リストの正確な要素数を確認
    // 全5件中、除外3件 → 候補2件
    expect(result.differentiation_axis_candidates.length).toBe(2);

    // アサーション 6: 除外対象機能数が記録に一致することを確認
    expect(result.excluded_features_count).toBe(excluded_feature_count);

    // アサーション 7: 除外ロジックの適用履歴を検証
    expect(result.exclusion_log).toBeDefined();
    expect(Array.isArray(result.exclusion_log)).toBe(true);

    // アサーション 8: 除外ロジックのログに各除外対象がすべて記録されていることを確認
    const exclusion_log_feature_ids = result.exclusion_log.map(
      (log: any) => log.feature_id
    );
    excluded_features.forEach((excluded_id: string) => {
      expect(exclusion_log_feature_ids).toContain(excluded_id);
    });

    // アサーション 9: 除外ログの詳細内容を検証
    const feat_001_log = result.exclusion_log.find(
      (log: any) => log.feature_id === 'feat_001'
    );
    expect(feat_001_log).toBeDefined();
    expect(feat_001_log.exclusion_reason).toMatch(/occurrence_frequency/i);

    const feat_002_log = result.exclusion_log.find(
      (log: any) => log.feature_id === 'feat_002'
    );
    expect(feat_002_log).toBeDefined();
    expect(feat_002_log.exclusion_reason).toMatch(/improvement_effect/i);

    const feat_004_log = result.exclusion_log.find(
      (log: any) => log.feature_id === 'feat_004'
    );
    expect(feat_004_log).toBeDefined();
    // feat_004 は両条件を満たす
    expect(
      feat_004_log.exclusion_reason.includes('occurrence_frequency') &&
        feat_004_log.exclusion_reason.includes('improvement_effect')
    ).toBe(true);

    // アサーション 10: 候補リストの優先度順序を確認（改善効果スコアの高い順）
    if (result.differentiation_axis_candidates.length >= 2) {
      const first_candidate = result.differentiation_axis_candidates[0];
      const second_candidate = result.differentiation_axis_candidates[1];

      // feat_005（改善効果92）が feat_003（改善効果78）より前に来るはず
      expect(first_candidate.improvement_effect_score).toBeGreaterThanOrEqual(
        second_candidate.improvement_effect_score
      );
    }

    // アサーション 11: タイムスタンプが記録されていることを確認
    expect(result.analysis_timestamp).toBeDefined();
    expect(typeof result.analysis_timestamp).toBe('string');

    // アサーション 12: セグメント情報が正確に記録されていることを確認
    expect(result.segment).toBe('homemaker_husband_30s');
  });
});