import { determineInterviewSampleCriteria } from '../../src/logic/it-8-1-1-1';

describe('ユーザーインタビュー記録と利用ログから食材制限・調理時間制限・予算制約の発生頻度と影響度を自動抽出・分類し、優先度マトリクスを生成・可視化する機能', () => {
  // SCEN-304
  test('[error] インタビュー対象者選定基準・最小サンプル数決定機能 - 入力される市場分析データが不完全または空の場合、適切なエラーメッセージが返される', () => {
    const incomplete_market_analysis_data = {
      market_size: '',
      target_layer_info: '専業主夫層（25-50歳）',
      competitor_info: '競合アプリA、競合アプリB',
    };

    expect(() =>
      determineInterviewSampleCriteria(incomplete_market_analysis_data)
    ).toThrow(/市場規模/);
  });

  test('[error] インタビュー対象者選定基準・最小サンプル数決定機能 - ターゲット層情報が空の場合、適切なエラーメッセージが返される', () => {
    const incomplete_market_analysis_data = {
      market_size: '1,000万人',
      target_layer_info: '',
      competitor_info: '競合アプリA、競合アプリB',
    };

    expect(() =>
      determineInterviewSampleCriteria(incomplete_market_analysis_data)
    ).toThrow(/ターゲット層/);
  });

  test('[error] インタビュー対象者選定基準・最小サンプル数決定機能 - 競合情報が空の場合、適切なエラーメッセージが返される', () => {
    const incomplete_market_analysis_data = {
      market_size: '1,000万人',
      target_layer_info: '専業主夫層（25-50歳）',
      competitor_info: '',
    };

    expect(() =>
      determineInterviewSampleCriteria(incomplete_market_analysis_data)
    ).toThrow(/競合情報/);
  });

  test('[success] インタビュー対象者選定基準・最小サンプル数決定機能 - 完全な市場分析データが入力された場合、インタビュー対象者の選定基準と最小サンプル数が決定される', () => {
    const complete_market_analysis_data = {
      market_size: '1,000万人',
      target_layer_info: '専業主夫層（25-50歳）',
      competitor_info: '競合アプリA、競合アプリB',
      food_restriction_prevalence: 0.35,
      cooking_time_constraint_prevalence: 0.42,
      budget_constraint_prevalence: 0.28,
    };

    const result = determineInterviewSampleCriteria(
      complete_market_analysis_data
    );

    expect(result).toEqual(
      expect.objectContaining({
        selection_criteria: expect.objectContaining({
          age_range: expect.any(String),
          family_composition: expect.any(String),
          food_restriction_criteria: expect.any(String),
        }),
        minimum_sample_size: expect.any(Number),
        confidence_level: expect.any(Number),
        margin_of_error: expect.any(Number),
        interview_execution_plan: expect.objectContaining({
          start_date: expect.any(String),
          end_date: expect.any(String),
          interview_locations: expect.any(Array),
          interview_frequency: expect.any(String),
        }),
      })
    );
    expect(result.minimum_sample_size).toBeGreaterThan(0);
  });

  test('[error] インタビュー対象者選定基準・最小サンプル数決定機能 - すべての市場分析データが空の場合、複数のエラーメッセージが返される', () => {
    const all_empty_market_analysis_data = {
      market_size: '',
      target_layer_info: '',
      competitor_info: '',
    };

    expect(() =>
      determineInterviewSampleCriteria(all_empty_market_analysis_data)
    ).toThrow(/市場規模/);
  });

  test('[error] インタビュー対象者選定基準・最小サンプル数決定機能 - null が入力された場合、エラーが返される', () => {
    expect(() =>
      determineInterviewSampleCriteria(null as any)
    ).toThrow(/必須/);
  });

  test('[error] インタビュー対象者選定基準・最小サンプル数決定機能 - undefined が入力された場合、エラーが返される', () => {
    expect(() =>
      determineInterviewSampleCriteria(undefined as any)
    ).toThrow(/必須/);
  });

  test('[success] インタビュー対象者選定基準・最小サンプル数決定機能 - 計算された最小サンプル数が統計的に妥当な値である', () => {
    const complete_market_analysis_data = {
      market_size: '1,000万人',
      target_layer_info: '専業主夫層（25-50歳）',
      competitor_info: '競合アプリA、競合アプリB',
      food_restriction_prevalence: 0.35,
      cooking_time_constraint_prevalence: 0.42,
      budget_constraint_prevalence: 0.28,
    };

    const result = determineInterviewSampleCriteria(
      complete_market_analysis_data
    );

    expect(result.minimum_sample_size).toBeGreaterThanOrEqual(30);
    expect(result.minimum_sample_size).toBeLessThanOrEqual(500);
    expect(result.confidence_level).toBe(0.95);
    expect(result.margin_of_error).toBe(0.05);
  });

  test('[success] インタビュー対象者選定基準・最小サンプル数決定機能 - 食材制限・調理時間制限・予算制約の有無別にセグメント基準が設定される', () => {
    const complete_market_analysis_data = {
      market_size: '1,000万人',
      target_layer_info: '専業主夫層（25-50歳）',
      competitor_info: '競合アプリA、競合アプリB',
      food_restriction_prevalence: 0.35,
      cooking_time_constraint_prevalence: 0.42,
      budget_constraint_prevalence: 0.28,
    };

    const result = determineInterviewSampleCriteria(
      complete_market_analysis_data
    );

    expect(result.selection_criteria).toEqual(
      expect.objectContaining({
        age_range: '25-50',
        family_composition: expect.stringMatching(/配偶者|子ども|親/),
        food_restriction_criteria: expect.stringMatching(/有無/),
        cooking_time_constraint_criteria: expect.stringMatching(/分/),
        budget_constraint_criteria: expect.stringMatching(/円/),
      })
    );
  });

  test('[success] インタビュー対象者選定基準・最小サンプル数決定機能 - インタビュー実施計画の日程と場所が適切に設定される', () => {
    const complete_market_analysis_data = {
      market_size: '1,000万人',
      target_layer_info: '専業主夫層（25-50歳）',
      competitor_info: '競合アプリA、競合アプリB',
      food_restriction_prevalence: 0.35,
      cooking_time_constraint_prevalence: 0.42,
      budget_constraint_prevalence: 0.28,
    };

    const result = determineInterviewSampleCriteria(
      complete_market_analysis_data
    );

    const start_date = new Date(result.interview_execution_plan.start_date);
    const end_date = new Date(result.interview_execution_plan.end_date);

    expect(end_date.getTime()).toBeGreaterThan(start_date.getTime());
    expect(result.interview_execution_plan.interview_locations).toHaveLength(
      expect.any(Number)
    );
    expect(result.interview_execution_plan.interview_locations.length).toBeGreaterThan(0);
    expect(result.interview_execution_plan.interview_frequency).toMatch(/週/);
  });
});