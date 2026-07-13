import { analyzeNutritionAchievementRate } from '../../src/logic/it-1';

describe('月次食費実績の超過要因分析機能', () => {
  // SCEN-415
  test('栄養摂取ログが存在しない場合、達成度が0%として可視化される', () => {
    const user_id = 'user_001';
    const target_date = new Date('2024-01-31T00:00:00Z');
    const nutrition_logs: any[] = [];
    const nutrition_standards = [
      { nutrient_name: 'タンパク質', daily_target: 50, unit: 'g' },
      { nutrient_name: '脂質', daily_target: 60, unit: 'g' },
      { nutrient_name: '炭水化物', daily_target: 300, unit: 'g' },
      { nutrient_name: 'ビタミンA', daily_target: 800, unit: 'μg' },
      { nutrient_name: 'ミネラル', daily_target: 100, unit: 'mg' },
    ];

    const result = analyzeNutritionAchievementRate({
      user_id,
      target_date,
      nutrition_logs,
      nutrition_standards,
    });

    expect(result.has_nutrition_logs).toBe(false);
    expect(result.achievement_rates).toEqual([
      { nutrient_name: 'タンパク質', achievement_rate: 0 },
      { nutrient_name: '脂質', achievement_rate: 0 },
      { nutrient_name: '炭水化物', achievement_rate: 0 },
      { nutrient_name: 'ビタミンA', achievement_rate: 0 },
      { nutrient_name: 'ミネラル', achievement_rate: 0 },
    ]);
    expect(result.is_dashboard_renderable).toBe(true);
    expect(result.error_message).toBe('');
  });

  test('栄養摂取ログが存在する場合、達成度が正しく計算される', () => {
    const user_id = 'user_001';
    const target_date = new Date('2024-01-31T00:00:00Z');
    const nutrition_logs = [
      { nutrient_name: 'タンパク質', intake_amount: 25, unit: 'g', logged_at: new Date('2024-01-31T12:00:00Z') },
      { nutrient_name: '脂質', intake_amount: 40, unit: 'g', logged_at: new Date('2024-01-31T12:00:00Z') },
      { nutrient_name: '炭水化物', intake_amount: 250, unit: 'g', logged_at: new Date('2024-01-31T12:00:00Z') },
      { nutrient_name: 'ビタミンA', intake_amount: 600, unit: 'μg', logged_at: new Date('2024-01-31T12:00:00Z') },
      { nutrient_name: 'ミネラル', intake_amount: 75, unit: 'mg', logged_at: new Date('2024-01-31T12:00:00Z') },
    ];
    const nutrition_standards = [
      { nutrient_name: 'タンパク質', daily_target: 50, unit: 'g' },
      { nutrient_name: '脂質', daily_target: 60, unit: 'g' },
      { nutrient_name: '炭水化物', daily_target: 300, unit: 'g' },
      { nutrient_name: 'ビタミンA', daily_target: 800, unit: 'μg' },
      { nutrient_name: 'ミネラル', daily_target: 100, unit: 'mg' },
    ];

    const result = analyzeNutritionAchievementRate({
      user_id,
      target_date,
      nutrition_logs,
      nutrition_standards,
    });

    expect(result.has_nutrition_logs).toBe(true);
    expect(result.achievement_rates).toEqual([
      { nutrient_name: 'タンパク質', achievement_rate: 50 },
      { nutrient_name: '脂質', achievement_rate: 67 },
      { nutrient_name: '炭水化物', achievement_rate: 83 },
      { nutrient_name: 'ビタミンA', achievement_rate: 75 },
      { nutrient_name: 'ミネラル', achievement_rate: 75 },
    ]);
    expect(result.is_dashboard_renderable).toBe(true);
    expect(result.error_message).toBe('');
  });

  test('栄養摂取ログが部分的に存在する場合、登録されたもののみ達成度が計算される', () => {
    const user_id = 'user_001';
    const target_date = new Date('2024-01-31T00:00:00Z');
    const nutrition_logs = [
      { nutrient_name: 'タンパク質', intake_amount: 50, unit: 'g', logged_at: new Date('2024-01-31T12:00:00Z') },
      { nutrient_name: '脂質', intake_amount: 60, unit: 'g', logged_at: new Date('2024-01-31T12:00:00Z') },
    ];
    const nutrition_standards = [
      { nutrient_name: 'タンパク質', daily_target: 50, unit: 'g' },
      { nutrient_name: '脂質', daily_target: 60, unit: 'g' },
      { nutrient_name: '炭水化物', daily_target: 300, unit: 'g' },
      { nutrient_name: 'ビタミンA', daily_target: 800, unit: 'μg' },
      { nutrient_name: 'ミネラル', daily_target: 100, unit: 'mg' },
    ];

    const result = analyzeNutritionAchievementRate({
      user_id,
      target_date,
      nutrition_logs,
      nutrition_standards,
    });

    expect(result.has_nutrition_logs).toBe(true);
    expect(result.achievement_rates).toEqual([
      { nutrient_name: 'タンパク質', achievement_rate: 100 },
      { nutrient_name: '脂質', achievement_rate: 100 },
      { nutrient_name: '炭水化物', achievement_rate: 0 },
      { nutrient_name: 'ビタミンA', achievement_rate: 0 },
      { nutrient_name: 'ミネラル', achievement_rate: 0 },
    ]);
    expect(result.is_dashboard_renderable).toBe(true);
    expect(result.error_message).toBe('');
  });

  test('栄養摂取ログが目標値を超過した場合、達成度が100%以上として計算される', () => {
    const user_id = 'user_001';
    const target_date = new Date('2024-01-31T00:00:00Z');
    const nutrition_logs = [
      { nutrient_name: 'タンパク質', intake_amount: 75, unit: 'g', logged_at: new Date('2024-01-31T12:00:00Z') },
      { nutrient_name: '脂質', intake_amount: 90, unit: 'g', logged_at: new Date('2024-01-31T12:00:00Z') },
    ];
    const nutrition_standards = [
      { nutrient_name: 'タンパク質', daily_target: 50, unit: 'g' },
      { nutrient_name: '脂質', daily_target: 60, unit: 'g' },
    ];

    const result = analyzeNutritionAchievementRate({
      user_id,
      target_date,
      nutrition_logs,
      nutrition_standards,
    });

    expect(result.has_nutrition_logs).toBe(true);
    expect(result.achievement_rates).toEqual([
      { nutrient_name: 'タンパク質', achievement_rate: 150 },
      { nutrient_name: '脂質', achievement_rate: 150 },
    ]);
    expect(result.is_dashboard_renderable).toBe(true);
    expect(result.error_message).toBe('');
  });

  test('栄養基準値が空配列の場合、エラーメッセージが返される', () => {
    const user_id = 'user_001';
    const target_date = new Date('2024-01-31T00:00:00Z');
    const nutrition_logs = [
      { nutrient_name: 'タンパク質', intake_amount: 50, unit: 'g', logged_at: new Date('2024-01-31T12:00:00Z') },
    ];
    const nutrition_standards: any[] = [];

    const result = analyzeNutritionAchievementRate({
      user_id,
      target_date,
      nutrition_logs,
      nutrition_standards,
    });

    expect(result.is_dashboard_renderable).toBe(false);
    expect(result.error_message).toMatch(/栄養基準値/);
  });

  test('ユーザーIDが空の場合、エラーが発生する', () => {
    const user_id = '';
    const target_date = new Date('2024-01-31T00:00:00Z');
    const nutrition_logs: any[] = [];
    const nutrition_standards = [
      { nutrient_name: 'タンパク質', daily_target: 50, unit: 'g' },
    ];

    expect(() => {
      analyzeNutritionAchievementRate({
        user_id,
        target_date,
        nutrition_logs,
        nutrition_standards,
      });
    }).toThrow(/ユーザーID/);
  });

  test('目標日付が無効な場合、エラーが発生する', () => {
    const user_id = 'user_001';
    const target_date = new Date('invalid-date');
    const nutrition_logs: any[] = [];
    const nutrition_standards = [
      { nutrient_name: 'タンパク質', daily_target: 50, unit: 'g' },
    ];

    expect(() => {
      analyzeNutritionAchievementRate({
        user_id,
        target_date,
        nutrition_logs,
        nutrition_standards,
      });
    }).toThrow(/日付/);
  });
});