import { generatePainPointDifferentiationList } from '../../src/logic/it-8-1-1-1';

describe('ユーザーインタビュー記録と利用ログからペイン要因を抽出・分類し優先度マトリクスを生成', () => {
  // SCEN-375: [edge] 専業主夫層ペイン要因・差別化機能リスト生成 - ペイン要因が複数セグメント共通の場合、専業主夫層固有のペイン因子で差別化される
  test('複数セグメント共通ペイン要因を除外し、専業主夫層固有ペイン因子を抽出した差別化機能リストを生成する', () => {
    // テストデータ: 複数セグメント共通のペイン要因
    const commonPainFactors = [
      { factor_id: 'cf_001', factor_name: '育児時間の不足', segment_type: 'common', frequency: 85, impact_score: 92 },
      { factor_id: 'cf_002', factor_name: '経済的負担', segment_type: 'common', frequency: 78, impact_score: 88 },
    ];

    // テストデータ: 専業主夫層固有のペイン因子
    const househusbandSpecificPainFactors = [
      { factor_id: 'hf_001', factor_name: '社会的偏見', segment_type: 'househusband_specific', frequency: 72, impact_score: 85 },
      { factor_id: 'hf_002', factor_name: 'キャリア中断への不安', segment_type: 'househusband_specific', frequency: 68, impact_score: 90 },
      { factor_id: 'hf_003', factor_name: '家事スキル習得の課題', segment_type: 'househusband_specific', frequency: 75, impact_score: 82 },
    ];

    // テストデータ: 他セグメント（専業主婦層、働く親層）固有のペイン因子
    const otherSegmentPainFactors = [
      { factor_id: 'wf_001', factor_name: 'キャリア継続への葛藤', segment_type: 'working_parent_specific', frequency: 70, impact_score: 87 },
      { factor_id: 'hm_001', factor_name: '夫のサポート不足', segment_type: 'homemaker_specific', frequency: 65, impact_score: 79 },
    ];

    // 全ペイン要因データ
    const allPainFactors = [
      ...commonPainFactors,
      ...househusbandSpecificPainFactors,
      ...otherSegmentPainFactors,
    ];

    // 差別化機能マスターデータ
    const differentiationFeatures = [
      {
        feature_id: 'df_101',
        feature_name: 'コミュニティ機能（男性ユーザー向け家事交流）',
        target_pain_factor_id: 'hf_001',
        segment_applicability: 'househusband_specific',
      },
      {
        feature_id: 'df_102',
        feature_name: 'キャリア相談サービス連携',
        target_pain_factor_id: 'hf_002',
        segment_applicability: 'househusband_specific',
      },
      {
        feature_id: 'df_103',
        feature_name: '調理スキルチュートリアル機能',
        target_pain_factor_id: 'hf_003',
        segment_applicability: 'househusband_specific',
      },
      {
        feature_id: 'df_201',
        feature_name: '時短レシピ推奨',
        target_pain_factor_id: 'cf_001',
        segment_applicability: 'common',
      },
      {
        feature_id: 'df_202',
        feature_name: '予算内献立提案',
        target_pain_factor_id: 'cf_002',
        segment_applicability: 'common',
      },
    ];

    // API 入力: 専業主夫層セグメント指定
    const input = {
      segment_type: 'househusband',
      pain_factors: allPainFactors,
      differentiation_features: differentiationFeatures,
      exclude_common_factors: true,
      min_specific_pain_factors: 3,
    };

    // 関数実行
    const result = generatePainPointDifferentiationList(input);

    // アサーション 1: 生成されたリストに複数セグメント共通のペイン要因が含まれていないことを検証
    const commonFactorIds = commonPainFactors.map((f) => f.factor_id);
    const resultPainFactorIds = result.pain_factors.map((pf) => pf.factor_id);
    const commonFactorsInResult = resultPainFactorIds.filter((id) => commonFactorIds.includes(id));
    expect(commonFactorsInResult.length).toBe(0);

    // アサーション 2: 生成されたリストに専業主夫層固有のペイン因子が全て含まれていることを検証
    const househusbandSpecificIds = househusbandSpecificPainFactors.map((f) => f.factor_id);
    const househusbandFactorsInResult = resultPainFactorIds.filter((id) => househusbandSpecificIds.includes(id));
    expect(househusbandFactorsInResult.length).toBe(3);
    expect(househusbandFactorsInResult.sort()).toEqual(['hf_001', 'hf_002', 'hf_003'].sort());

    // アサーション 3: 他セグメント固有のペイン因子が除外されていることを検証
    const otherSegmentIds = otherSegmentPainFactors.map((f) => f.factor_id);
    const otherSegmentFactorsInResult = resultPainFactorIds.filter((id) => otherSegmentIds.includes(id));
    expect(otherSegmentFactorsInResult.length).toBe(0);

    // アサーション 4: 生成される差別化機能が専業主夫層固有のペイン因子に対応していることを検証
    const differentiationFeatureIds = result.differentiation_features.map((df) => df.feature_id);
    expect(differentiationFeatureIds).toContain('df_101'); // コミュニティ機能（社会的偏見対応）
    expect(differentiationFeatureIds).toContain('df_102'); // キャリア相談サービス連携
    expect(differentiationFeatureIds).toContain('df_103'); // 調理スキルチュートリアル機能

    // アサーション 5: 共通セグメント向け機能が除外されていることを検証
    expect(differentiationFeatureIds).not.toContain('df_201'); // 時短レシピ推奨（common）
    expect(differentiationFeatureIds).not.toContain('df_202'); // 予算内献立提案（common）

    // アサーション 6: 結果構造の整合性を検証
    expect(result).toHaveProperty('segment_type');
    expect(result.segment_type).toBe('househusband');
    expect(result).toHaveProperty('pain_factors');
    expect(Array.isArray(result.pain_factors)).toBe(true);
    expect(result).toHaveProperty('differentiation_features');
    expect(Array.isArray(result.differentiation_features)).toBe(true);
    expect(result).toHaveProperty('common_factors_excluded_count');
    expect(result.common_factors_excluded_count).toBe(2);
    expect(result).toHaveProperty('househusband_specific_factors_included_count');
    expect(result.househusband_specific_factors_included_count).toBe(3);

    // アサーション 7: 優先度マトリクスが正しく生成されていることを検証
    expect(result).toHaveProperty('priority_matrix');
    const priorityMatrix = result.priority_matrix;
    expect(priorityMatrix).toHaveProperty('high_priority_factors');
    expect(Array.isArray(priorityMatrix.high_priority_factors)).toBe(true);
    // 社会的偏見、キャリア中断への不安は高優先度（impact_score >= 85）
    const highPriorityIds = priorityMatrix.high_priority_factors.map((hpf) => hpf.factor_id);
    expect(highPriorityIds).toContain('hf_001'); // impact_score: 85
    expect(highPriorityIds).toContain('hf_002'); // impact_score: 90

    // アサーション 8: 各差別化機能が対象ペイン因子に紐付けられていることを検証
    result.differentiation_features.forEach((feature) => {
      expect(feature).toHaveProperty('feature_id');
      expect(feature).toHaveProperty('feature_name');
      expect(feature).toHaveProperty('target_pain_factor_id');
      expect(househusbandSpecificIds).toContain(feature.target_pain_factor_id);
    });

    // アサーション 9: 生成結果の整合性チェック（差別化機能数がペイン因子数以上であること）
    expect(result.differentiation_features.length).toBeGreaterThanOrEqual(result.pain_factors.length);

    // アサーション 10: 結果に生成時刻とメタデータが含まれていることを検証
    expect(result).toHaveProperty('generated_at');
    expect(typeof result.generated_at).toBe('string');
    expect(result).toHaveProperty('metadata');
    expect(result.metadata).toHaveProperty('excluded_segments');
    expect(result.metadata.excluded_segments).toContain('working_parent_specific');
    expect(result.metadata.excluded_segments).toContain('homemaker_specific');
    expect(result.metadata.excluded_segments).toContain('common');
  });
});