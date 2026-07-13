import { analyzeNutrientIntake } from '../../src/logic/it-1';

describe('月次食費実績の超過要因分析機能', () => {
  // SCEN-414: [normal] 栄養摂取状況の可視化機能 - 家族成員の年齢・性別に基づいた栄養基準値と実績値が正確に照合される
  test('家族成員の年齢・性別に基づいた栄養基準値と実績値が正確に照合される', () => {
    // 複数の家族成員（異なる年齢・性別）を定義
    const family_members = [
      {
        member_id: 'FM001',
        name: '母親',
        age: 30,
        gender: 'female',
      },
      {
        member_id: 'FM002',
        name: '息子',
        age: 8,
        gender: 'male',
      },
      {
        member_id: 'FM003',
        name: '祖母',
        age: 65,
        gender: 'female',
      },
    ];

    // 栄養摂取基準値（厚生労働省基準に基づく）
    // 30歳女性：カロリー2000kcal、タンパク質50g、脂質56g、炭水化物275g、ビタミンA700μg、カルシウム650mg
    // 8歳男性：カロリー1600kcal、タンパク質35g、脂質45g、炭水化物220g、ビタミンA600μg、カルシウム650mg
    // 65歳女性：カロリー1700kcal、タンパク質50g、脂質47g、炭水化物234g、ビタミンA700μg、カルシウム650mg
    const expected_nutrition_standards = {
      FM001: {
        calories: 2000,
        protein: 50,
        fat: 56,
        carbohydrates: 275,
        vitamin_a: 700,
        calcium: 650,
      },
      FM002: {
        calories: 1600,
        protein: 35,
        fat: 45,
        carbohydrates: 220,
        vitamin_a: 600,
        calcium: 650,
      },
      FM003: {
        calories: 1700,
        protein: 50,
        fat: 47,
        carbohydrates: 234,
        vitamin_a: 700,
        calcium: 650,
      },
    };

    // 食事記録データ（該当期間の実績値）
    const meal_records = [
      {
        meal_date: '2024-01-15',
        member_id: 'FM001',
        calories: 1800,
        protein: 48,
        fat: 52,
        carbohydrates: 260,
        vitamin_a: 680,
        calcium: 600,
      },
      {
        meal_date: '2024-01-15',
        member_id: 'FM002',
        calories: 1550,
        protein: 34,
        fat: 43,
        carbohydrates: 215,
        vitamin_a: 590,
        calcium: 640,
      },
      {
        meal_date: '2024-01-15',
        member_id: 'FM003',
        calories: 1680,
        protein: 48,
        fat: 45,
        carbohydrates: 230,
        vitamin_a: 690,
        calcium: 640,
      },
    ];

    // 分析実行
    const result = analyzeNutrientIntake({
      family_members,
      meal_records,
      analysis_date: '2024-01-15',
    });

    // 検証: 各家族成員の栄養基準値が正確に反映されている
    expect(result.nutrition_standards).toEqual(expected_nutrition_standards);

    // 検証: 家族成員ごとの栄養素別実績値が正確に集計されている
    expect(result.actual_intake.FM001).toEqual({
      calories: 1800,
      protein: 48,
      fat: 52,
      carbohydrates: 260,
      vitamin_a: 680,
      calcium: 600,
    });

    expect(result.actual_intake.FM002).toEqual({
      calories: 1550,
      protein: 34,
      fat: 43,
      carbohydrates: 215,
      vitamin_a: 590,
      calcium: 640,
    });

    expect(result.actual_intake.FM003).toEqual({
      calories: 1680,
      protein: 48,
      fat: 45,
      carbohydrates: 230,
      vitamin_a: 690,
      calcium: 640,
    });

    // 検証: 基準値と実績値の照合結果（達成度パーセンテージ）が正確に計算されている
    // 30歳女性（FM001）: カロリー 1800/2000 = 90%
    expect(result.achievement_rates.FM001.calories).toBe(90);
    // タンパク質 48/50 = 96%
    expect(result.achievement_rates.FM001.protein).toBe(96);
    // 脂質 52/56 = 92.86 → 93（四捨五入）
    expect(result.achievement_rates.FM001.fat).toBe(93);
    // 炭水化物 260/275 = 94.55 → 95（四捨五入）
    expect(result.achievement_rates.FM001.carbohydrates).toBe(95);
    // ビタミンA 680/700 = 97.14 → 97（四捨五入）
    expect(result.achievement_rates.FM001.vitamin_a).toBe(97);
    // カルシウム 600/650 = 92.31 → 92（四捨五入）
    expect(result.achievement_rates.FM001.calcium).toBe(92);

    // 8歳男性（FM002）: カロリー 1550/1600 = 96.88 → 97（四捨五入）
    expect(result.achievement_rates.FM002.calories).toBe(97);
    // タンパク質 34/35 = 97.14 → 97（四捨五入）
    expect(result.achievement_rates.FM002.protein).toBe(97);
    // 脂質 43/45 = 95.56 → 96（四捨五入）
    expect(result.achievement_rates.FM002.fat).toBe(96);
    // 炭水化物 215/220 = 97.73 → 98（四捨五入）
    expect(result.achievement_rates.FM002.carbohydrates).toBe(98);
    // ビタミンA 590/600 = 98.33 → 98（四捨五入）
    expect(result.achievement_rates.FM002.vitamin_a).toBe(98);
    // カルシウム 640/650 = 98.46 → 98（四捨五入）
    expect(result.achievement_rates.FM002.calcium).toBe(98);

    // 65歳女性（FM003）: カロリー 1680/1700 = 98.82 → 99（四捨五入）
    expect(result.achievement_rates.FM003.calories).toBe(99);
    // タンパク質 48/50 = 96%
    expect(result.achievement_rates.FM003.protein).toBe(96);
    // 脂質 45/47 = 95.74 → 96（四捨五入）
    expect(result.achievement_rates.FM003.fat).toBe(96);
    // 炭水化物 230/234 = 98.29 → 98（四捨五入）
    expect(result.achievement_rates.FM003.carbohydrates).toBe(98);
    // ビタミンA 690/700 = 98.57 → 99（四捨五入）
    expect(result.achievement_rates.FM003.vitamin_a).toBe(99);
    // カルシウム 640/650 = 98.46 → 98（四捨五入）
    expect(result.achievement_rates.FM003.calcium).toBe(98);

    // 検証: 過不足判定が正確に行われている
    // 各家族成員について、90～110%を適正範囲とする
    expect(result.compliance.FM001.calories).toEqual({
      status: 'under',
      percentage: 90,
      is_compliant: true,
    });
    expect(result.compliance.FM001.protein).toEqual({
      status: 'appropriate',
      percentage: 96,
      is_compliant: true,
    });

    expect(result.compliance.FM002.calories).toEqual({
      status: 'appropriate',
      percentage: 97,
      is_compliant: true,
    });
    expect(result.compliance.FM002.vitamin_a).toEqual({
      status: 'appropriate',
      percentage: 98,
      is_compliant: true,
    });

    expect(result.compliance.FM003.calories).toEqual({
      status: 'appropriate',
      percentage: 99,
      is_compliant: true,
    });
    expect(result.compliance.FM003.protein).toEqual({
      status: 'appropriate',
      percentage: 96,
      is_compliant: true,
    });

    // 検証: 複数成員間で基準値が相互に異なることを確認
    expect(result.nutrition_standards.FM001.calories).not.toBe(
      result.nutrition_standards.FM002.calories
    );
    expect(result.nutrition_standards.FM001.calories).not.toBe(
      result.nutrition_standards.FM003.calories
    );
    expect(result.nutrition_standards.FM002.calories).not.toBe(
      result.nutrition_standards.FM003.calories
    );

    // 検証: 結果構造が完全かつ正確に提供されている
    expect(result).toHaveProperty('nutrition_standards');
    expect(result).toHaveProperty('actual_intake');
    expect(result).toHaveProperty('achievement_rates');
    expect(result).toHaveProperty('compliance');
    expect(result).toHaveProperty('analysis_timestamp');

    // 検証: タイムスタンプが正確に記録されている
    expect(result.analysis_timestamp).toBe('2024-01-15T00:00:00Z');
  });
});