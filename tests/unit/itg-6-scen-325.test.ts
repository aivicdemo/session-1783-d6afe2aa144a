import { verifyCompetitiveDifferentiation } from '../../src/logic/it-8-1-1-1';

describe('Competition Differentiation Axis Verification', () => {
  test('SCEN-325: [normal] 競合アプリとの差別化軸検証機能 - 自社と競合アプリの対応度スコア差が30以上のペイン要因が差別化可能として特定される', () => {
    // Arrange: ペイン要因と対応度スコア
    const own_score_food_restriction = 80;
    const competitor_score_food_restriction = 50;
    const own_score_cooking_time = 75;
    const competitor_score_cooking_time = 60;
    const own_score_budget = 85;
    const competitor_score_budget = 40;
    const own_score_family_preference = 60;
    const competitor_score_family_preference = 55;

    const pain_factors = [
      {
        pain_factor_id: 1,
        pain_factor_name: '食材制限',
        own_responsiveness_score: own_score_food_restriction,
        competitor_responsiveness_score: competitor_score_food_restriction,
      },
      {
        pain_factor_id: 2,
        pain_factor_name: '調理時間制限',
        own_responsiveness_score: own_score_cooking_time,
        competitor_responsiveness_score: competitor_score_cooking_time,
      },
      {
        pain_factor_id: 3,
        pain_factor_name: '予算制約',
        own_responsiveness_score: own_score_budget,
        competitor_responsiveness_score: competitor_score_budget,
      },
      {
        pain_factor_id: 4,
        pain_factor_name: '家族の好み',
        own_responsiveness_score: own_score_family_preference,
        competitor_responsiveness_score: competitor_score_family_preference,
      },
    ];

    // Act: 競合アプリとの差別化軸を検証
    const result = verifyCompetitiveDifferentiation(pain_factors);

    // Assert: 期待される計算結果
    // 食材制限: 80 - 50 = 30（差別化可能）
    // 調理時間制限: 75 - 60 = 15（差別化不可）
    // 予算制約: 85 - 40 = 45（差別化可能）
    // 家族の好み: 60 - 55 = 5（差別化不可）

    expect(result).toEqual({
      differentiation_results: [
        {
          pain_factor_id: 1,
          pain_factor_name: '食材制限',
          own_responsiveness_score: 80,
          competitor_responsiveness_score: 50,
          score_difference: 30,
          is_differentiable: true,
          differentiation_classification: '差別化可能',
        },
        {
          pain_factor_id: 2,
          pain_factor_name: '調理時間制限',
          own_responsiveness_score: 75,
          competitor_responsiveness_score: 60,
          score_difference: 15,
          is_differentiable: false,
          differentiation_classification: '差別化不可',
        },
        {
          pain_factor_id: 3,
          pain_factor_name: '予算制約',
          own_responsiveness_score: 85,
          competitor_responsiveness_score: 40,
          score_difference: 45,
          is_differentiable: true,
          differentiation_classification: '差別化可能',
        },
        {
          pain_factor_id: 4,
          pain_factor_name: '家族の好み',
          own_responsiveness_score: 60,
          competitor_responsiveness_score: 55,
          score_difference: 5,
          is_differentiable: false,
          differentiation_classification: '差別化不可',
        },
      ],
      differentiable_count: 2,
      non_differentiable_count: 2,
      differentiable_pain_factors: [
        {
          pain_factor_id: 1,
          pain_factor_name: '食材制限',
          score_difference: 30,
        },
        {
          pain_factor_id: 3,
          pain_factor_name: '予算制約',
          score_difference: 45,
        },
      ],
    });

    // 差別化可能なペイン要因は正確に2個であること
    expect(result.differentiable_count).toBe(2);
    
    // 差別化不可なペイン要因は正確に2個であること
    expect(result.non_differentiable_count).toBe(2);
    
    // 差別化可能なペイン要因リストに食材制限（スコア差30）が含まれていること
    expect(
      result.differentiable_pain_factors.some(
        (pf) => pf.pain_factor_id === 1 && pf.score_difference === 30
      )
    ).toBe(true);
    
    // 差別化可能なペイン要因リストに予算制約（スコア差45）が含まれていること
    expect(
      result.differentiable_pain_factors.some(
        (pf) => pf.pain_factor_id === 3 && pf.score_difference === 45
      )
    ).toBe(true);
    
    // スコア差が29のペイン要因（調理時間制限）は差別化可能として分類されないこと
    expect(
      result.differentiable_pain_factors.some((pf) => pf.pain_factor_id === 2)
    ).toBe(false);
    
    // スコア差が30未満のペイン要因（家族の好み）は差別化可能として分類されないこと
    expect(
      result.differentiable_pain_factors.some((pf) => pf.pain_factor_id === 4)
    ).toBe(false);
  });

  test('SCEN-325: [boundary] スコア差が正確に30のペイン要因は差別化可能として特定される', () => {
    // Arrange: スコア差がちょうど30のケース
    const boundary_pain_factors = [
      {
        pain_factor_id: 1,
        pain_factor_name: '食材制限',
        own_responsiveness_score: 80,
        competitor_responsiveness_score: 50,
      },
    ];

    // Act
    const result = verifyCompetitiveDifferentiation(boundary_pain_factors);

    // Assert: スコア差30は差別化可能の境界値であり、含まれるべき
    expect(result.differentiation_results[0].is_differentiable).toBe(true);
    expect(result.differentiation_results[0].score_difference).toBe(30);
    expect(result.differentiable_pain_factors.length).toBe(1);
  });

  test('SCEN-325: [boundary] スコア差が29のペイン要因は差別化不可として特定される', () => {
    // Arrange: スコア差が29のケース（30未満）
    const boundary_pain_factors = [
      {
        pain_factor_id: 1,
        pain_factor_name: '食材制限',
        own_responsiveness_score: 79,
        competitor_responsiveness_score: 50,
      },
    ];

    // Act
    const result = verifyCompetitiveDifferentiation(boundary_pain_factors);

    // Assert: スコア差29は差別化可能の閾値未満であり、除外されるべき
    expect(result.differentiation_results[0].is_differentiable).toBe(false);
    expect(result.differentiation_results[0].score_difference).toBe(29);
    expect(result.differentiable_pain_factors.length).toBe(0);
  });

  test('SCEN-325: [error] スコア差が負数の場合はエラーを発生させる', () => {
    // Arrange: スコア差が負数になるケース（自社スコア < 競合スコア）
    const invalid_pain_factors = [
      {
        pain_factor_id: 1,
        pain_factor_name: '食材制限',
        own_responsiveness_score: 40,
        competitor_responsiveness_score: 80,
      },
    ];

    // Act & Assert
    expect(() =>
      verifyCompetitiveDifferentiation(invalid_pain_factors)
    ).toThrow(/スコア/);
  });

  test('SCEN-325: [error] ペイン要因配列が空の場合はエラーを発生させる', () => {
    // Arrange: 空の配列
    const empty_pain_factors: any[] = [];

    // Act & Assert
    expect(() =>
      verifyCompetitiveDifferentiation(empty_pain_factors)
    ).toThrow(/ペイン/);
  });

  test('SCEN-325: [error] スコアが0未満または100を超える場合はエラーを発生させる', () => {
    // Arrange: スコアが無効な範囲
    const invalid_score_pain_factors = [
      {
        pain_factor_id: 1,
        pain_factor_name: '食材制限',
        own_responsiveness_score: 105,
        competitor_responsiveness_score: 50,
      },
    ];

    // Act & Assert
    expect(() =>
      verifyCompetitiveDifferentiation(invalid_score_pain_factors)
    ).toThrow(/スコア/);
  });

  test('SCEN-325: [normal] 複数ペイン要因混在で正確に分類される', () => {
    // Arrange: スコア差が様々な複数ペイン要因
    const mixed_pain_factors = [
      {
        pain_factor_id: 1,
        pain_factor_name: '食材制限',
        own_responsiveness_score: 100,
        competitor_responsiveness_score: 70,
      },
      {
        pain_factor_id: 2,
        pain_factor_name: '調理時間制限',
        own_responsiveness_score: 50,
        competitor_responsiveness_score: 30,
      },
      {
        pain_factor_id: 3,
        pain_factor_name: '予算制約',
        own_responsiveness_score: 65,
        competitor_responsiveness_score: 35,
      },
      {
        pain_factor_id: 4,
        pain_factor_name: '家族の好み',
        own_responsiveness_score: 45,
        competitor_responsiveness_score: 42,
      },
    ];

    // Act
    const result = verifyCompetitiveDifferentiation(mixed_pain_factors);

    // Assert: スコア差を確認
    // 食材制限: 100 - 70 = 30（差別化可能）
    // 調理時間制限: 50 - 30 = 20（差別化不可）
    // 予算制約: 65 - 35 = 30（差別化可能）
    // 家族の好み: 45 - 42 = 3（差別化不可）

    expect(result.differentiable_count).toBe(2);
    expect(result.non_differentiable_count).toBe(2);
    expect(result.differentiable_pain_factors).toHaveLength(2);

    const differentiable_ids = result.differentiable_pain_factors.map(
      (pf) => pf.pain_factor_id
    );
    expect(differentiable_ids).toContain(1);
    expect(differentiable_ids).toContain(3);

    const non_differentiable_results = result.differentiation_results.filter(
      (r) => !r.is_differentiable
    );
    expect(non_differentiable_results).toHaveLength(2);
    expect(
      non_differentiable_results.map((r) => r.pain_factor_id)
    ).toEqual(expect.arrayContaining([2, 4]));
  });
});