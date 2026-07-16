import {
  determineInterviewSampleCriteria,
} from "../../src/logic/it-8-1-1-1";

describe("ユーザーインタビュー対象者選定基準・最小サンプル数決定機能", () => {
  // SCEN-303: インタビュー対象者選定基準・最小サンプル数決定機能
  // - 専業主夫層の年代・家族構成・食材制限の有無に基づいて選定基準と最小サンプル数が正しく決定される
  test("should determine interview sample criteria and minimum sample size for homemaker segment with age, family composition, and dietary restriction filters", () => {
    const input = {
      segment_type: "homemaker_male",
      age_filter: "30s",
      family_composition_filter: "children_two_or_more",
      dietary_restriction_filter: "present_allergy",
      confidence_level: 0.95,
      expected_effect_size: 0.5,
    };

    const result = determineInterviewSampleCriteria(input);

    // 選定基準の検証
    expect(result).toHaveProperty("selection_criteria");
    expect(result.selection_criteria).toEqual({
      segment_type: "homemaker_male",
      age_range: "30-39",
      family_composition: "children_two_or_more",
      dietary_restriction_status: "present_allergy",
      criteria_conditions: [
        "segment_type:homemaker_male",
        "age_range:30-39",
        "family_composition:children_two_or_more",
        "dietary_restriction_status:present_allergy",
      ],
    });

    // 最小サンプル数の検証
    // 信頼度95%, 効果量0.5 の場合、統計的妥当性を満たす最小サンプル数は30件以上
    expect(result).toHaveProperty("minimum_sample_size");
    expect(result.minimum_sample_size).toBeGreaterThanOrEqual(30);
    expect(result.minimum_sample_size).toBe(34);

    // 統計的信頼度の検証
    expect(result).toHaveProperty("confidence_level");
    expect(result.confidence_level).toBe(0.95);

    // 選定基準が年代・家族構成・食材制限の条件をすべて含んでいるか検証
    expect(result.selection_criteria.criteria_conditions).toContain(
      "age_range:30-39"
    );
    expect(result.selection_criteria.criteria_conditions).toContain(
      "family_composition:children_two_or_more"
    );
    expect(result.selection_criteria.criteria_conditions).toContain(
      "dietary_restriction_status:present_allergy"
    );

    // 統計計算根拠の検証
    expect(result).toHaveProperty("statistical_rationale");
    expect(result.statistical_rationale).toEqual({
      confidence_level: 0.95,
      effect_size: 0.5,
      z_critical_value: 1.96,
      calculation_method: "two_tailed_test",
      formula_applied:
        "n = (z^2 * p * (1-p)) / e^2 or n = 2 * ((z_critical + z_beta) / effect_size)^2",
    });

    // 選定基準サマリーの検証
    expect(result).toHaveProperty("criteria_summary");
    expect(result.criteria_summary).toBe(
      "homemaker_male AND age_range:30-39 AND family_composition:children_two_or_more AND dietary_restriction_status:present_allergy"
    );

    // 統計的有意性を満たす最小サンプル数であることを検証
    expect(result.minimum_sample_size).toBeGreaterThanOrEqual(30);
  });

  // エラーケース: segment_type が未指定
  test("should throw error when segment_type is missing", () => {
    const input = {
      age_filter: "30s",
      family_composition_filter: "children_two_or_more",
      dietary_restriction_filter: "present_allergy",
      confidence_level: 0.95,
      expected_effect_size: 0.5,
    } as any;

    expect(() => determineInterviewSampleCriteria(input)).toThrow(
      /セグメント類型/
    );
  });

  // エラーケース: confidence_level が統計的妥当範囲外
  test("should throw error when confidence_level is outside valid range", () => {
    const input = {
      segment_type: "homemaker_male",
      age_filter: "30s",
      family_composition_filter: "children_two_or_more",
      dietary_restriction_filter: "present_allergy",
      confidence_level: 0.5,
      expected_effect_size: 0.5,
    };

    expect(() => determineInterviewSampleCriteria(input)).toThrow(
      /信頼度/
    );
  });

  // エラーケース: expected_effect_size が負数
  test("should throw error when expected_effect_size is negative", () => {
    const input = {
      segment_type: "homemaker_male",
      age_filter: "30s",
      family_composition_filter: "children_two_or_more",
      dietary_restriction_filter: "present_allergy",
      confidence_level: 0.95,
      expected_effect_size: -0.5,
    };

    expect(() => determineInterviewSampleCriteria(input)).toThrow(
      /効果量/
    );
  });

  // エラーケース: age_filter が不正な値
  test("should throw error when age_filter is invalid", () => {
    const input = {
      segment_type: "homemaker_male",
      age_filter: "invalid_age",
      family_composition_filter: "children_two_or_more",
      dietary_restriction_filter: "present_allergy",
      confidence_level: 0.95,
      expected_effect_size: 0.5,
    };

    expect(() => determineInterviewSampleCriteria(input)).toThrow(/年代/);
  });

  // エラーケース: family_composition_filter が不正な値
  test("should throw error when family_composition_filter is invalid", () => {
    const input = {
      segment_type: "homemaker_male",
      age_filter: "30s",
      family_composition_filter: "invalid_composition",
      dietary_restriction_filter: "present_allergy",
      confidence_level: 0.95,
      expected_effect_size: 0.5,
    };

    expect(() => determineInterviewSampleCriteria(input)).toThrow(/家族構成/);
  });

  // エラーケース: dietary_restriction_filter が不正な値
  test("should throw error when dietary_restriction_filter is invalid", () => {
    const input = {
      segment_type: "homemaker_male",
      age_filter: "30s",
      family_composition_filter: "children_two_or_more",
      dietary_restriction_filter: "invalid_restriction",
      confidence_level: 0.95,
      expected_effect_size: 0.5,
    };

    expect(() => determineInterviewSampleCriteria(input)).toThrow(
      /食材制限/
    );
  });

  // 境界値テスト: confidence_level が最小妥当値（0.90）
  test("should calculate minimum_sample_size correctly when confidence_level is 0.90", () => {
    const input = {
      segment_type: "homemaker_male",
      age_filter: "30s",
      family_composition_filter: "children_two_or_more",
      dietary_restriction_filter: "present_allergy",
      confidence_level: 0.9,
      expected_effect_size: 0.5,
    };

    const result = determineInterviewSampleCriteria(input);

    expect(result.confidence_level).toBe(0.9);
    expect(result.minimum_sample_size).toBeGreaterThanOrEqual(25);
  });

  // 境界値テスト: confidence_level が最大妥当値（0.99）
  test("should calculate minimum_sample_size correctly when confidence_level is 0.99", () => {
    const input = {
      segment_type: "homemaker_male",
      age_filter: "30s",
      family_composition_filter: "children_two_or_more",
      dietary_restriction_filter: "present_allergy",
      confidence_level: 0.99,
      expected_effect_size: 0.5,
    };

    const result = determineInterviewSampleCriteria(input);

    expect(result.confidence_level).toBe(0.99);
    expect(result.minimum_sample_size).toBeGreaterThanOrEqual(40);
  });

  // 複数フィルタ条件の統合検証
  test("should correctly integrate multiple filter conditions into criteria", () => {
    const input = {
      segment_type: "homemaker_male",
      age_filter: "40s",
      family_composition_filter: "children_one",
      dietary_restriction_filter: "absent",
      confidence_level: 0.95,
      expected_effect_size: 0.5,
    };

    const result = determineInterviewSampleCriteria(input);

    expect(result.selection_criteria.age_range).toBe("40-49");
    expect(result.selection_criteria.family_composition).toBe(
      "children_one"
    );
    expect(result.selection_criteria.dietary_restriction_status).toBe(
      "absent"
    );
    expect(result.selection_criteria.criteria_conditions).toHaveLength(4);
    expect(result.criteria_summary).toContain("40-49");
    expect(result.criteria_summary).toContain("children_one");
    expect(result.criteria_summary).toContain("absent");
  });

  // 統計的妥当性検証: minimum_sample_size >= 30
  test("should ensure minimum_sample_size meets statistical validity requirement of at least 30", () => {
    const input = {
      segment_type: "homemaker_male",
      age_filter: "30s",
      family_composition_filter: "children_two_or_more",
      dietary_restriction_filter: "present_allergy",
      confidence_level: 0.95,
      expected_effect_size: 0.5,
    };

    const result = determineInterviewSampleCriteria(input);

    expect(result.minimum_sample_size).toBeGreaterThanOrEqual(30);
  });

  // 年代フィルタの正しいマッピング検証（40代）
  test("should correctly map age_filter 40s to age_range 40-49", () => {
    const input = {
      segment_type: "homemaker_male",
      age_filter: "40s",
      family_composition_filter: "children_two_or_more",
      dietary_restriction_filter: "present_allergy",
      confidence_level: 0.95,
      expected_effect_size: 0.5,
    };

    const result = determineInterviewSampleCriteria(input);

    expect(result.selection_criteria.age_range).toBe("40-49");
  });

  // 年代フィルタの正しいマッピング検証（20代）
  test("should correctly map age_filter 20s to age_range 20-29", () => {
    const input = {
      segment_type: "homemaker_male",
      age_filter: "20s",
      family_composition_filter: "children_two_or_more",
      dietary_restriction_filter: "present_allergy",
      confidence_level: 0.95,
      expected_effect_size: 0.5,
    };

    const result = determineInterviewSampleCriteria(input);

    expect(result.selection_criteria.age_range).toBe("20-29");
  });

  // 食材制限フィルタの正しいマッピング検証（食材制限なし）
  test("should correctly map dietary_restriction_filter absent to dietary_restriction_status absent", () => {
    const input = {
      segment_type: "homemaker_male",
      age_filter: "30s",
      family_composition_filter: "children_two_or_more",
      dietary_restriction_filter: "absent",
      confidence_level: 0.95,
      expected_effect_size: 0.5,
    };

    const result = determineInterviewSampleCriteria(input);

    expect(result.selection_criteria.dietary_restriction_status).toBe(
      "absent"
    );
  });

  // 食材制限フィルタの正しいマッピング検証（ベジタリアン対応）
  test("should correctly map dietary_restriction_filter present_vegetarian to dietary_restriction_status present_vegetarian", () => {
    const input = {
      segment_type: "homemaker_male",
      age_filter: "30s",
      family_composition_filter: "children_two_or_more",
      dietary_restriction_filter: "present_vegetarian",
      confidence_level: 0.95,
      expected_effect_size: 0.5,
    };

    const result = determineInterviewSampleCriteria(input);

    expect(result.selection_criteria.dietary_restriction_status).toBe(
      "present_vegetarian"
    );
  });

  // 家族構成フィルタの正しいマッピング検証（子なし）
  test("should correctly map family_composition_filter no_children to family_composition no_children", () => {
    const input = {
      segment_type: "homemaker_male",
      age_filter: "30s",
      family_composition_filter: "no_children",
      dietary_restriction_filter: "present_allergy",
      confidence_level: 0.95,
      expected_effect_size: 0.5,
    };

    const result = determineInterviewSampleCriteria(input);

    expect(result.selection_criteria.family_composition).toBe("no_children");
  });

  // 期待値の信頼度パラメータの検証
  test("should preserve expected_effect_size in statistical_rationale", () => {
    const input = {
      segment_type: "homemaker_male",
      age_filter: "30s",
      family_composition_filter: "children_two_or_more",
      dietary_restriction_filter: "present_allergy",
      confidence_level: 0.95,
      expected_effect_size: 0.5,
    };

    const result = determineInterviewSampleCriteria(input);

    expect(result.statistical_rationale.effect_size).toBe(0.5);
  });

  // Z値の正しい計算検証
  test("should correctly calculate z_critical_value for 95% confidence level", () => {
    const input = {
      segment_type: "homemaker_male",
      age_filter: "30s",
      family_composition_filter: "children_two_or_more",
      dietary_restriction_filter: "present_allergy",
      confidence_level: 0.95,
      expected_effect_size: 0.5,
    };

    const result = determineInterviewSampleCriteria(input);

    expect(result.statistical_rationale.z_critical_value).toBe(1.96);
  });

  // 計算方法が two_tailed_test であることの検証
  test("should use two_tailed_test calculation method", () => {
    const input = {
      segment_type: "homemaker_male",
      age_filter: "30s",
      family_composition_filter: "children_two_or_more",
      dietary_restriction_filter: "present_allergy",
      confidence_level: 0.95,
      expected_effect_size: 0.5,
    };

    const result = determineInterviewSampleCriteria(input);

    expect(result.statistical_rationale.calculation_method).toBe(
      "two_tailed_test"
    );
  });

  // 複数条件を組み合わせた criteria_conditions の長さ検証
  test("should generate exactly 4 criteria_conditions for valid input", () => {
    const input = {
      segment_type: "homemaker_male",
      age_filter: "30s",
      family_composition_filter: "children_two_or_more",
      dietary_restriction_filter: "present_allergy",
      confidence_level: 0.95,
      expected_effect_size: 0.5,
    };

    const result = determineInterviewSampleCriteria(input);

    expect(result.selection_criteria.criteria_conditions).toHaveLength(4);
  });

  // criteria_summary に全てのフィルタ条件が含まれていることの検証
  test("should include all filter conditions in criteria_summary", () => {
    const input = {
      segment_type: "homemaker_male",
      age_filter: "30s",
      family_composition_filter: "children_two_or_more",
      dietary_restriction_filter: "present_allergy",
      confidence_level: 0.95,
      expected_effect_size: 0.5,
    };

    const result = determineInterviewSampleCriteria(input);

    expect(result.criteria_summary).toContain("homemaker_male");
    expect(result.criteria_summary).toContain("30-39");
    expect(result.criteria_summary).toContain("children_two_or_more");
    expect(result.criteria_summary).toContain("present_allergy");
  });
});