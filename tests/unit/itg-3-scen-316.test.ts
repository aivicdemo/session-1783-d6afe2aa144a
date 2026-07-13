import { generateMenuOnSchedule } from "../../src/logic/it-1-br-3-2-1";

describe("購入実績の記録と月次食費削減効果の自動集計・分析機能", () => {
  test("SCEN-316: システムが定期スケジュール(毎週日曜夜)に達した時に献立生成が自動トリガーされる", () => {
    // 毎週日曜日22:00のスケジュール時刻を設定
    const scheduleTime = {
      dayOfWeek: 0, // 日曜日 (0 = Sunday)
      hour: 22,
      minute: 0,
    };

    // テスト用の3週間分のシミュレーション日時を定義（毎週日曜22:00）
    const testDates = [
      new Date("2024-01-07T22:00:00Z"), // 第1週日曜22:00
      new Date("2024-01-14T22:00:00Z"), // 第2週日曜22:00
      new Date("2024-01-21T22:00:00Z"), // 第3週日曜22:00
    ];

    const userId = "user_household_001";
    const familyMembers = [
      {
        family_member_id: "fam_001",
        user_id: userId,
        name: "父",
        age: 42,
        gender: "M",
      },
      {
        family_member_id: "fam_002",
        user_id: userId,
        name: "母",
        age: 40,
        gender: "F",
      },
    ];

    // スケジュール有効化フラグ
    const scheduleEnabled = true;

    // 生成結果を保持する配列
    const generatedMenus: Array<{
      menu_id: string;
      user_id: string;
      generated_date: string;
      start_date: string;
      menu_items: Array<{
        dish_name: string;
        nutritional_info: {
          calories: number;
          protein_g: number;
          fat_g: number;
          carbs_g: number;
        };
      }>;
      satisfies_constraints: boolean;
      nutrition_balance_score: number;
      budget_score: number;
      cooking_time_score: number;
      allergy_compliance_score: number;
      overall_satisfaction_score: number;
    }> = [];

    // 各週のスケジュール実行をシミュレート
    testDates.forEach((currentDate) => {
      const dayOfWeek = currentDate.getDay();
      const hour = currentDate.getHours();
      const minute = currentDate.getMinutes();

      // スケジュール条件確認
      const isScheduleTimeReached =
        dayOfWeek === scheduleTime.dayOfWeek &&
        hour === scheduleTime.hour &&
        minute === scheduleTime.minute;

      // スケジュール実行時刻に到達し、スケジュールが有効な場合に献立生成トリガー
      if (isScheduleTimeReached && scheduleEnabled) {
        const generatedMenu = generateMenuOnSchedule({
          user_id: userId,
          family_members: familyMembers,
          trigger_time: currentDate.toISOString(),
          schedule_enabled: scheduleEnabled,
          schedule_day_of_week: scheduleTime.dayOfWeek,
          schedule_hour: scheduleTime.hour,
          schedule_minute: scheduleTime.minute,
        });

        generatedMenus.push(generatedMenu);
      }
    });

    // 期待結果の検証

    // 1. 3週間すべてで献立生成が実行されていることを確認
    expect(generatedMenus).toHaveLength(3);

    // 2. 各週の献立が正しい日付で生成されていることを確認
    expect(generatedMenus[0].generated_date).toBe("2024-01-07T22:00:00Z");
    expect(generatedMenus[1].generated_date).toBe("2024-01-14T22:00:00Z");
    expect(generatedMenus[2].generated_date).toBe("2024-01-21T22:00:00Z");

    // 3. 各献立が必須属性を持つことを確認
    generatedMenus.forEach((menu) => {
      // 献立ID
      expect(menu.menu_id).toBeDefined();
      expect(typeof menu.menu_id).toBe("string");
      expect(menu.menu_id.length).toBeGreaterThan(0);

      // ユーザーID
      expect(menu.user_id).toBe(userId);

      // 生成日時
      expect(menu.generated_date).toBeDefined();
      expect(typeof menu.generated_date).toBe("string");

      // 献立開始日
      expect(menu.start_date).toBeDefined();
      expect(typeof menu.start_date).toBe("string");

      // メニュー内容（複数の料理を含む）
      expect(menu.menu_items).toBeDefined();
      expect(Array.isArray(menu.menu_items)).toBe(true);
      expect(menu.menu_items.length).toBeGreaterThan(0);

      // 各料理の必須情報確認
      menu.menu_items.forEach((item) => {
        expect(item.dish_name).toBeDefined();
        expect(typeof item.dish_name).toBe("string");
        expect(item.dish_name.length).toBeGreaterThan(0);

        // 栄養情報
        expect(item.nutritional_info).toBeDefined();
        expect(item.nutritional_info.calories).toBeGreaterThan(0);
        expect(item.nutritional_info.protein_g).toBeGreaterThan(0);
        expect(item.nutritional_info.fat_g).toBeGreaterThanOrEqual(0);
        expect(item.nutritional_info.carbs_g).toBeGreaterThan(0);
      });

      // 制約条件充足フラグ
      expect(menu.satisfies_constraints).toBe(true);

      // 各スコア（0～100の範囲）
      expect(menu.nutrition_balance_score).toBeGreaterThanOrEqual(0);
      expect(menu.nutrition_balance_score).toBeLessThanOrEqual(100);

      expect(menu.budget_score).toBeGreaterThanOrEqual(0);
      expect(menu.budget_score).toBeLessThanOrEqual(100);

      expect(menu.cooking_time_score).toBeGreaterThanOrEqual(0);
      expect(menu.cooking_time_score).toBeLessThanOrEqual(100);

      expect(menu.allergy_compliance_score).toBeGreaterThanOrEqual(0);
      expect(menu.allergy_compliance_score).toBeLessThanOrEqual(100);

      // 総合満足度スコア
      expect(menu.overall_satisfaction_score).toBeGreaterThanOrEqual(0);
      expect(menu.overall_satisfaction_score).toBeLessThanOrEqual(100);
    });

    // 4. 献立の継続的な生成確認
    // 3週間の献立がすべて異なるIDを持つことを確認（新規生成の証拠）
    const menuIds = generatedMenus.map((m) => m.menu_id);
    const uniqueMenuIds = new Set(menuIds);
    expect(uniqueMenuIds.size).toBe(3);

    // 5. スケジュールが無効な場合、献立生成がトリガーされないことを確認
    const scheduleDisabledTest = generateMenuOnSchedule({
      user_id: userId,
      family_members: familyMembers,
      trigger_time: testDates[0].toISOString(),
      schedule_enabled: false, // スケジュール無効
      schedule_day_of_week: scheduleTime.dayOfWeek,
      schedule_hour: scheduleTime.hour,
      schedule_minute: scheduleTime.minute,
    });

    // スケジュール無効時は null が返されることを期待
    expect(scheduleDisabledTest).toBeNull();

    // 6. 日曜日以外の時刻ではトリガーされないことを確認
    const nonSundayDate = new Date("2024-01-08T22:00:00Z"); // 月曜日22:00
    const nonSundayTest = generateMenuOnSchedule({
      user_id: userId,
      family_members: familyMembers,
      trigger_time: nonSundayDate.toISOString(),
      schedule_enabled: true,
      schedule_day_of_week: scheduleTime.dayOfWeek,
      schedule_hour: scheduleTime.hour,
      schedule_minute: scheduleTime.minute,
    });

    expect(nonSundayTest).toBeNull();

    // 7. 日曜日でも指定時刻以外（22:00以外）ではトリガーされないことを確認
    const wrongTimeDate = new Date("2024-01-07T21:00:00Z"); // 日曜日21:00
    const wrongTimeTest = generateMenuOnSchedule({
      user_id: userId,
      family_members: familyMembers,
      trigger_time: wrongTimeDate.toISOString(),
      schedule_enabled: true,
      schedule_day_of_week: scheduleTime.dayOfWeek,
      schedule_hour: scheduleTime.hour,
      schedule_minute: scheduleTime.minute,
    });

    expect(wrongTimeTest).toBeNull();

    // 8. 家族メンバーの制約がない場合のエラーハンドリング
    expect(() =>
      generateMenuOnSchedule({
        user_id: userId,
        family_members: [], // 家族メンバーなし
        trigger_time: testDates[0].toISOString(),
        schedule_enabled: true,
        schedule_day_of_week: scheduleTime.dayOfWeek,
        schedule_hour: scheduleTime.hour,
        schedule_minute: scheduleTime.minute,
      })
    ).toThrow(/家族/);

    // 9. 無効なユーザーIDの場合のエラーハンドリング
    expect(() =>
      generateMenuOnSchedule({
        user_id: "", // 空のユーザーID
        family_members: familyMembers,
        trigger_time: testDates[0].toISOString(),
        schedule_enabled: true,
        schedule_day_of_week: scheduleTime.dayOfWeek,
        schedule_hour: scheduleTime.hour,
        schedule_minute: scheduleTime.minute,
      })
    ).toThrow(/ユーザー/);
  });
});