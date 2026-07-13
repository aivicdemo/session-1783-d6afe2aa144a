import { determineMonthlyCycleTiming } from '../../src/logic/it-1-br-2-1-2-1';

describe('栄養士からの改善提案を優先度付けして管理し、開発チームに定期通知する機能', () => {
  // SCEN-548: [edge] 分析タイミング判定機能 - 月初日が日曜日のときは翌月曜日が月次分析対象日として扱われる
  test('SCEN-548: 月初日が日曜日のとき、月次分析対象日として翌月曜日が返される', () => {
    // パターン 1: 2024年1月7日（日）が月初日の場合
    const input_jan_first_sunday = {
      current_date: new Date('2024-01-07T00:00:00Z'), // 2024年1月7日（日）
    };
    const result_jan = determineMonthlyCycleTiming(input_jan_first_sunday);
    expect(result_jan.monthly_analysis_target_date).toEqual(
      new Date('2024-01-08T00:00:00Z')
    );
    expect(result_jan.day_of_week).toBe('Monday');
    expect(result_jan.is_adjusted).toBe(true);

    // パターン 2: 2024年4月7日（日）が月初日の場合
    const input_apr_first_sunday = {
      current_date: new Date('2024-04-07T00:00:00Z'), // 2024年4月7日（日）
    };
    const result_apr = determineMonthlyCycleTiming(input_apr_first_sunday);
    expect(result_apr.monthly_analysis_target_date).toEqual(
      new Date('2024-04-08T00:00:00Z')
    );
    expect(result_apr.day_of_week).toBe('Monday');
    expect(result_apr.is_adjusted).toBe(true);

    // パターン 3: 2024年7月7日（日）が月初日の場合
    const input_jul_first_sunday = {
      current_date: new Date('2024-07-07T00:00:00Z'), // 2024年7月7日（日）
    };
    const result_jul = determineMonthlyCycleTiming(input_jul_first_sunday);
    expect(result_jul.monthly_analysis_target_date).toEqual(
      new Date('2024-07-08T00:00:00Z')
    );
    expect(result_jul.day_of_week).toBe('Monday');
    expect(result_jul.is_adjusted).toBe(true);

    // パターン 4: 月初日が日曜日以外の場合は調整されない
    const input_jan_first_monday = {
      current_date: new Date('2024-01-01T00:00:00Z'), // 2024年1月1日（月）
    };
    const result_jan_not_adjusted = determineMonthlyCycleTiming(
      input_jan_first_monday
    );
    expect(result_jan_not_adjusted.monthly_analysis_target_date).toEqual(
      new Date('2024-01-01T00:00:00Z')
    );
    expect(result_jan_not_adjusted.day_of_week).toBe('Monday');
    expect(result_jan_not_adjusted.is_adjusted).toBe(false);
  });
});