import { calculateNutritionAchievementByAgeGroup } from '../../src/logic/it-1';

describe('月次食費実績の超過要因分析機能', () => {
  // SCEN-416
  test('異なる年齢層が混在する家族構成で年齢別栄養基準値が正しく適用される', () => {
    // 前提: 家族構成設定画面で複数メンバーが登録され、各メンバーの年齢と1日の食事内容が入力されている
    const family_members = [
      {
        member_id: 'MEM001',
        age: 3,
        gender: 'M',
        name: 'Toddler',
      },
      {
        member_id: 'MEM002',
        age: 8,
        gender: 'F',
        name: 'School_child',
      },
      {
        member_id: 'MEM003',
        age: 35,
        gender: 'M',
        name: 'Adult',
      },
      {
        member_id: 'MEM004',
        age: 70,
        gender: 'F',
        name: 'Elderly',
      },
    ];

    const nutrition_intake_data = [
      {
        member_id: 'MEM001',
        date: '2024-01-15',
        calories: 1200,
        protein: 20,
      },
      {
        member_id: 'MEM002',
        date: '2024-01-15',
        calories: 1800,
        protein: 30,
      },
      {
        member_id: 'MEM003',
        date: '2024-01-15',
        calories: 2100,
        protein: 50,
      },
      {
        member_id: 'MEM004',
        date: '2024-01-15',
        calories: 1850,
        protein: 50,
      },
    ];

    // 発火: 栄養摂取状況の可視化画面にアクセスし、複数メンバーの栄養データを同時表示する
    const result = calculateNutritionAchievementByAgeGroup(
      family_members,
      nutrition_intake_data
    );

    // 期待結果: 年齢別基準値に基づいた達成度スコアが正確に計算され、各メンバーのデータが混在していない
    // 【幼児（3歳）】厚生労働省基準: カロリー 1,200kcal、タンパク質 20g
    expect(result).toHaveLength(4);
    expect(result[0]).toEqual({
      member_id: 'MEM001',
      age: 3,
      nutrition_standard: {
        calories: 1200,
        protein: 20,
      },
      nutrition_actual: {
        calories: 1200,
        protein: 20,
      },
      achievement_score: {
        calories: 100,
        protein: 100,
      },
    });

    // 【小学生（8歳）】学童向け基準: カロリー 1,800kcal、タンパク質 30g
    expect(result[1]).toEqual({
      member_id: 'MEM002',
      age: 8,
      nutrition_standard: {
        calories: 1800,
        protein: 30,
      },
      nutrition_actual: {
        calories: 1800,
        protein: 30,
      },
      achievement_score: {
        calories: 100,
        protein: 100,
      },
    });

    // 【成人（35歳）】成人向け基準: カロリー 2,100kcal、タンパク質 50g
    expect(result[2]).toEqual({
      member_id: 'MEM003',
      age: 35,
      nutrition_standard: {
        calories: 2100,
        protein: 50,
      },
      nutrition_actual: {
        calories: 2100,
        protein: 50,
      },
      achievement_score: {
        calories: 100,
        protein: 100,
      },
    });

    // 【高齢者（70歳）】高齢者向け基準: カロリー 1,850kcal、タンパク質 50g
    expect(result[3]).toEqual({
      member_id: 'MEM004',
      age: 70,
      nutrition_standard: {
        calories: 1850,
        protein: 50,
      },
      nutrition_actual: {
        calories: 1850,
        protein: 50,
      },
      achievement_score: {
        calories: 100,
        protein: 100,
      },
    });

    // 確認: 各メンバーのデータが混在していないこと
    expect(result[0].member_id).not.toBe(result[1].member_id);
    expect(result[1].member_id).not.toBe(result[2].member_id);
    expect(result[2].member_id).not.toBe(result[3].member_id);

    // 確認: 各メンバーの達成度スコアが個別に計算されていること
    expect(result[0].nutrition_standard.calories).toBe(1200);
    expect(result[1].nutrition_standard.calories).toBe(1800);
    expect(result[2].nutrition_standard.calories).toBe(2100);
    expect(result[3].nutrition_standard.calories).toBe(1850);
  });

  // 境界値テスト: 不完全な栄養摂取データがある場合、達成度スコアが正確に計算される
  test('栄養摂取が基準値に満たない場合、達成度スコアが正確に計算される', () => {
    const family_members = [
      {
        member_id: 'MEM005',
        age: 3,
        gender: 'M',
        name: 'Toddler_partial',
      },
    ];

    const nutrition_intake_data = [
      {
        member_id: 'MEM005',
        date: '2024-01-15',
        calories: 600,
        protein: 10,
      },
    ];

    const result = calculateNutritionAchievementByAgeGroup(
      family_members,
      nutrition_intake_data
    );

    // 幼児（3歳）基準: カロリー 1,200kcal、タンパク質 20g
    // 実績: カロリー 600kcal（600/1200 = 50%）、タンパク質 10g（10/20 = 50%）
    expect(result[0]).toEqual({
      member_id: 'MEM005',
      age: 3,
      nutrition_standard: {
        calories: 1200,
        protein: 20,
      },
      nutrition_actual: {
        calories: 600,
        protein: 10,
      },
      achievement_score: {
        calories: 50,
        protein: 50,
      },
    });
  });

  // エラーテスト: 無効な家族成員データが渡された場合、例外をスローする
  test('無効な家族成員データが渡されると例外がスローされる', () => {
    const invalid_family_members = [
      {
        member_id: 'MEM006',
        age: -1,
        gender: 'M',
        name: 'Invalid',
      },
    ];

    const nutrition_intake_data = [
      {
        member_id: 'MEM006',
        date: '2024-01-15',
        calories: 1200,
        protein: 20,
      },
    ];

    expect(() =>
      calculateNutritionAchievementByAgeGroup(
        invalid_family_members,
        nutrition_intake_data
      )
    ).toThrow(/年齢/);
  });

  // エラーテスト: 対応する栄養摂取データが見つからない場合、例外をスローする
  test('対応する栄養摂取データが見つからないと例外がスローされる', () => {
    const family_members = [
      {
        member_id: 'MEM007',
        age: 8,
        gender: 'F',
        name: 'Orphan',
      },
    ];

    const nutrition_intake_data = [
      {
        member_id: 'MEM999',
        date: '2024-01-15',
        calories: 1800,
        protein: 30,
      },
    ];

    expect(() =>
      calculateNutritionAchievementByAgeGroup(
        family_members,
        nutrition_intake_data
      )
    ).toThrow(/メンバー/);
  });
});