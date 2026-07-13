import { determineMonthlyVerificationTiming } from "../../src/logic/it-1-br-6-2-1";

describe("需要予測精度検証ダッシュボード：月次検証タイミング判定機能", () => {
  // SCEN-257: [edge] 月次検証タイミング判定機能 - 当月1日と5日の境界で判定が正確に切り替わることを検証できる
  test("当月1日から5日の間に検証タイミング判定が正確に切り替わることを確認", () => {
    // 前提: 需要予測システムが前月の予測データと実績データを保有し、月次検証サイクルが定義されている状態
    // 発生条件: 当月1日から5日の間に、需要予測担当者がシステムにアクセスして検証タイミング確認を開始する
    // 結果: システムが前月の予測精度検証を実行すべき状態か判定し、検証実行の可否と次のアクション（検証開始 or 待機）を通知

    // ケース1: 当月1日 - 検証タイミング内（検証開始推奨）
    const currentDate_Day1 = new Date("2024-01-01T09:00:00Z");
    const result_Day1 = determineMonthlyVerificationTiming(currentDate_Day1);

    // 当月1日は検証タイミング判定内なので、検証実行フラグがtrueになるべき
    expect(result_Day1.should_execute_verification).toBe(true);
    expect(result_Day1.verification_status).toBe("verification_ready");
    expect(result_Day1.next_action).toBe("start_verification");

    // ケース2: 当月5日 - 検証タイミング内の上限（検証開始推奨）
    const currentDate_Day5 = new Date("2024-01-05T09:00:00Z");
    const result_Day5 = determineMonthlyVerificationTiming(currentDate_Day5);

    // 当月5日も検証タイミング判定内なので、検証実行フラグがtrueになるべき
    expect(result_Day5.should_execute_verification).toBe(true);
    expect(result_Day5.verification_status).toBe("verification_ready");
    expect(result_Day5.next_action).toBe("start_verification");

    // ケース3: 当月6日 - 検証タイミング外（検証開始見送り）
    const currentDate_Day6 = new Date("2024-01-06T09:00:00Z");
    const result_Day6 = determineMonthlyVerificationTiming(currentDate_Day6);

    // 当月6日は検証タイミング判定外なので、検証実行フラグがfalseになるべき
    expect(result_Day6.should_execute_verification).toBe(false);
    expect(result_Day6.verification_status).toBe("verification_wait");
    expect(result_Day6.next_action).toBe("wait_next_month");

    // ケース4: 前月30日 - 検証タイミング外（次月待機）
    const currentDate_PrevDay30 = new Date("2023-12-30T09:00:00Z");
    const result_PrevDay30 = determineMonthlyVerificationTiming(currentDate_PrevDay30);

    // 前月30日は検証タイミング判定外なので、検証実行フラグがfalseになるべき
    expect(result_PrevDay30.should_execute_verification).toBe(false);
    expect(result_PrevDay30.verification_status).toBe("verification_wait");
    expect(result_PrevDay30.next_action).toBe("wait_next_month");

    // ケース5: 翌月1日 - 検証タイミング内（次月の検証開始）
    const currentDate_NextDay1 = new Date("2024-02-01T09:00:00Z");
    const result_NextDay1 = determineMonthlyVerificationTiming(currentDate_NextDay1);

    // 翌月1日は新しい月の検証タイミング判定内なので、検証実行フラグがtrueになるべき
    expect(result_NextDay1.should_execute_verification).toBe(true);
    expect(result_NextDay1.verification_status).toBe("verification_ready");
    expect(result_NextDay1.next_action).toBe("start_verification");
    // 翌月1日のタイムスタンプが正確に記録される
    expect(result_NextDay1.verified_month).toBe("2024-02");

    // ケース6: 当月1日と5日の判定結果が同じであることを確認
    expect(result_Day1.should_execute_verification).toEqual(
      result_Day5.should_execute_verification
    );
    expect(result_Day1.verification_status).toEqual(result_Day5.verification_status);

    // ケース7: 当月1日と当月6日の判定結果が異なることを確認（境界値）
    expect(result_Day1.should_execute_verification).not.toEqual(
      result_Day6.should_execute_verification
    );
    expect(result_Day1.verification_status).not.toEqual(result_Day6.verification_status);

    // ケース8: 前月30日と当月1日の判定結果が異なることを確認（月界）
    expect(result_PrevDay30.should_execute_verification).not.toEqual(
      result_Day1.should_execute_verification
    );

    // ケース9: 検証対象月の月次識別子が正確に記録されていることを確認
    expect(result_Day1.verified_month).toBe("2024-01");
    expect(result_Day5.verified_month).toBe("2024-01");
    expect(result_Day6.verified_month).toBe("2024-01");
    expect(result_PrevDay30.verified_month).toBe("2023-12");
    expect(result_NextDay1.verified_month).toBe("2024-02");

    // ケース10: 検証判定のタイムスタンプが入力日付と一致することを確認
    const dateStr_Day1 = currentDate_Day1.toISOString().split("T")[0];
    const dateStr_Day5 = currentDate_Day5.toISOString().split("T")[0];
    expect(result_Day1.judgment_datetime).toContain(dateStr_Day1);
    expect(result_Day5.judgment_datetime).toContain(dateStr_Day5);
  });
});