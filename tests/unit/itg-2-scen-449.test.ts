import { updateDashboardData } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザーの食事記録と栄養摂取量の推移データを自動集計し、栄養項目別の達成度と改善ギャップを可視化するダッシュボード機能', () => {
  // SCEN-449
  test('ダッシュボード表示データの自動更新機能 - データソースの不整合がある場合、エラーログが出力される', () => {
    // スパイオブジェクトを使用してコンソールログをキャプチャ
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const inconsistentDataSources = [
      {
        source_id: 'source_nutrition_01',
        source_name: 'Nutrition Database',
        data_format: 'JSON',
        data: {
          user_id: 'user_001',
          nutrition_items: [
            {
              nutrient_name: 'タンパク質',
              target_value: 50,
              actual_value: '45',
              unit: 'g'
            },
            {
              nutrient_name: 'カルシウム',
              target_value: 800,
              actual_value: 720,
              unit: 'mg'
            }
          ],
          measurement_date: '2024-01-15'
        }
      },
      {
        source_id: 'source_meal_01',
        source_name: 'Meal Record System',
        data_format: 'XML',
        data: {
          user_id: 'user_001',
          meals: [
            {
              meal_name: '朝食',
              nutrients: {
                protein: 15,
                calcium: 200
              },
              meal_time: '07:00:00',
              recorded_at: '2024-01-15T07:30:00Z'
            }
          ],
          meal_date: 20240115
        }
      }
    ];

    const dashboardConfig = {
      user_id: 'user_001',
      data_sources: inconsistentDataSources,
      auto_update_enabled: true,
      update_timestamp: new Date('2024-01-15T12:00:00Z')
    };

    updateDashboardData(dashboardConfig);

    // エラーログが出力されたことを確認
    expect(consoleErrorSpy).toHaveBeenCalled();

    // エラーログのメッセージを取得
    const errorLogCalls = consoleErrorSpy.mock.calls;
    const errorMessageFound = errorLogCalls.some(call => {
      const message = String(call[0]);
      return (
        message.includes('データソース') &&
        message.includes('不整合') &&
        message.includes('source_nutrition_01')
      );
    });

    expect(errorMessageFound).toBe(true);

    // ダッシュボードの更新が中断されていることを確認
    const dashboardResult = updateDashboardData(dashboardConfig);
    expect(dashboardResult).toEqual({
      success: false,
      status: 'skipped',
      error_message: 'データソース間の不整合により自動更新を中断しました',
      error_details: {
        source_mismatch: true,
        affected_sources: ['source_nutrition_01', 'source_meal_01'],
        format_inconsistency: 'JSON形式とXML形式の混在',
        data_type_inconsistency: [
          {
            source_id: 'source_nutrition_01',
            field: 'actual_value',
            expected_type: 'number',
            received_type: 'string'
          },
          {
            source_id: 'source_meal_01',
            field: 'meal_date',
            expected_type: 'string',
            received_type: 'number'
          }
        ]
      },
      timestamp: new Date('2024-01-15T12:00:00Z'),
      notification: {
        type: 'error',
        message: 'ダッシュボードの自動更新に失敗しました。データソースの設定を確認してください。',
        severity: 'high',
        user_id: 'user_001'
      }
    });

    consoleErrorSpy.mockRestore();
  });
});