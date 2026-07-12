import { updateDashboardMetrics } from '../../src/logic/it-3';

describe('食事評価データを献立生成ロジックに反映させる機能', () => {
  // SCEN-516: [normal] ダッシュボード自動更新機能 - 献立実績と購入記録の最新データに基づいて、ダッシュボード表示データが自動更新される
  test('献立実績と購入記録が追加されたとき、ダッシュボード表示データが自動更新される', () => {
    const initial_meal_records = [
      {
        meal_id: 'meal_001',
        user_id: 'user_001',
        meal_date: '2024-01-15',
        meal_name: '和風パスタ',
        preparation_time_minutes: 25,
        nutritional_value: {
          calories: 650,
          protein_grams: 18,
          fat_grams: 22,
          carbohydrates_grams: 85,
        },
        satisfaction_score: 4,
        completion_rate_percent: 95,
        family_member_feedback: [
          { family_member_id: 'fm_001', satisfaction: 4, feedback: '美味しかった' },
          { family_member_id: 'fm_002', satisfaction: 3, feedback: 'もう少し味濃いほうが好き' },
        ],
      },
    ];

    const initial_purchase_records = [
      {
        purchase_id: 'purch_001',
        user_id: 'user_001',
        purchase_date: '2024-01-14',
        item_name: 'パスタ麺',
        quantity: 1,
        unit_price_jpy: 280,
        total_price_jpy: 280,
        supermarket_name: 'スーパーA',
      },
      {
        purchase_id: 'purch_002',
        user_id: 'user_001',
        purchase_date: '2024-01-14',
        item_name: 'トマトソース',
        quantity: 1,
        unit_price_jpy: 420,
        total_price_jpy: 420,
        supermarket_name: 'スーパーA',
      },
    ];

    const new_meal_record = {
      meal_id: 'meal_002',
      user_id: 'user_001',
      meal_date: '2024-01-16',
      meal_name: '鶏肉のグリル',
      preparation_time_minutes: 30,
      nutritional_value: {
        calories: 720,
        protein_grams: 42,
        fat_grams: 28,
        carbohydrates_grams: 45,
      },
      satisfaction_score: 5,
      completion_rate_percent: 100,
      family_member_feedback: [
        { family_member_id: 'fm_001', satisfaction: 5, feedback: '大好きです' },
        { family_member_id: 'fm_002', satisfaction: 5, feedback: 'また作ってほしい' },
      ],
    };

    const new_purchase_record = {
      purchase_id: 'purch_003',
      user_id: 'user_001',
      purchase_date: '2024-01-15',
      item_name: '鶏もも肉',
      quantity: 600,
      unit_price_jpy: 1200,
      total_price_jpy: 1200,
      supermarket_name: 'スーパーB',
    };

    const updated_meal_records = [...initial_meal_records, new_meal_record];
    const updated_purchase_records = [...initial_purchase_records, new_purchase_record];

    const dashboard_result = updateDashboardMetrics({
      meal_records: updated_meal_records,
      purchase_records: updated_purchase_records,
      analysis_start_date: '2024-01-14',
      analysis_end_date: '2024-01-16',
    });

    // 献立実績の統計情報検証
    expect(dashboard_result.meal_statistics.total_meals_count).toBe(2);
    expect(dashboard_result.meal_statistics.average_satisfaction_score).toBe(4.5);
    expect(dashboard_result.meal_statistics.average_completion_rate_percent).toBe(97.5);
    expect(dashboard_result.meal_statistics.average_preparation_time_minutes).toBe(27.5);

    // 栄養バランス情報検証（2食分の合計）
    expect(dashboard_result.nutritional_summary.total_calories).toBe(1370);
    expect(dashboard_result.nutritional_summary.total_protein_grams).toBe(60);
    expect(dashboard_result.nutritional_summary.total_fat_grams).toBe(50);
    expect(dashboard_result.nutritional_summary.total_carbohydrates_grams).toBe(130);
    expect(dashboard_result.nutritional_summary.average_daily_calories).toBe(456.67);

    // 購入金額の合計検証
    expect(dashboard_result.purchase_summary.total_purchase_amount_jpy).toBe(1900);
    expect(dashboard_result.purchase_summary.purchase_count).toBe(3);
    expect(dashboard_result.purchase_summary.average_item_price_jpy).toBe(633.33);

    // 食材の在庫状況検証（新規購入分を含む）
    expect(dashboard_result.purchase_summary.items_by_supermarket).toEqual({
      スーパーA: {
        purchase_count: 2,
        total_amount_jpy: 700,
      },
      スーパーB: {
        purchase_count: 1,
        total_amount_jpy: 1200,
      },
    });

    // ダッシュボード更新タイムスタンプの検証
    expect(dashboard_result.last_updated_at).toBeDefined();
    const updated_timestamp = new Date(dashboard_result.last_updated_at);
    expect(updated_timestamp.getTime()).toBeGreaterThan(0);

    // 家族成員の満足度集計検証
    expect(dashboard_result.family_satisfaction_summary).toEqual({
      fm_001: {
        average_satisfaction: 4.5,
        meal_count: 2,
      },
      fm_002: {
        average_satisfaction: 4.0,
        meal_count: 2,
      },
    });

    // データの完全性・一貫性検証
    expect(dashboard_result.data_quality_status).toBe('valid');
    expect(dashboard_result.records_processed).toBe(5); // 2個の食事記録 + 3個の購入記録
  });
});