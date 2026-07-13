import { determineMonthlyVerificationTiming } from "../../src/logic/it-1-br-6-2-1";

const fetchMock = require("jest-fetch-mock");

describe("需要予測精度検証ダッシュボード：予測値と実績値の照合・乖離分析機能", () => {
  // SCEN-258: [error] 月次検証タイミング判定機能 - 前月のデータが不完全な場合に検証実行不可として通知する
  test("前月の売上データが部分的に欠落している場合、検証実行不可エラーを返し、詳細な通知メッセージを生成する", () => {
    fetchMock.resetMocks();

    // テストデータ: 前月（2024年12月）の売上データが部分的に欠落
    const incompleteMonthlyData = {
      year: 2024,
      month: 12,
      daily_sales_data: [
        { date: "2024-12-01", sales: 150000 },
        { date: "2024-12-02", sales: 160000 },
        { date: "2024-12-03", sales: null }, // 欠落
        { date: "2024-12-04", sales: 155000 },
        // 2024-12-05 から 2024-12-10 のデータが完全に欠落
        { date: "2024-12-11", sales: 165000 },
        { date: "2024-12-12", sales: 158000 },
      ],
      total_sales_expected_count: 31,
      actual_data_count: 8,
    };

    // 月次検証タイミング判定関数を呼び出す
    const result = determineMonthlyVerificationTiming({
      previous_month_data: incompleteMonthlyData,
      verification_trigger_date: new Date("2025-01-05T09:00:00Z"),
      completeness_threshold_percentage: 95,
    });

    // 1. システムが前月データの不完全性を検出し、エラーコードを返すことを確認
    expect(result.status).toBe("error");
    expect(result.error_code).toBe("INCOMPLETE_PREVIOUS_MONTH_DATA");

    // 2. エラーメッセージに前月データの欠落箇所の詳細情報が含まれていることを確認
    expect(result.error_message).toMatch(/データ不完全/);
    expect(result.error_message).toMatch(/2024年12月/);

    // 3. 詳細な通知メッセージが生成されることを確認
    expect(result.notification_details).toBeDefined();
    expect(result.notification_details.message).toMatch(/検証実行不可/);
    expect(result.notification_details.missing_data_count).toBe(23); // 31 - 8
    expect(result.notification_details.data_completeness_percentage).toBe(
      Math.round((8 / 31) * 100)
    ); // 約25.8% → 26%
    expect(result.notification_details.required_threshold_percentage).toBe(95);

    // 4. 欠落した日付情報が通知に含まれることを確認
    expect(result.notification_details.missing_date_ranges).toBeDefined();
    expect(result.notification_details.missing_date_ranges.length).toBeGreaterThan(
      0
    );
    expect(result.notification_details.missing_date_ranges).toContainEqual({
      start_date: "2024-12-03",
      end_date: "2024-12-03",
      reason: "null_value",
    });
    expect(result.notification_details.missing_date_ranges).toContainEqual({
      start_date: "2024-12-05",
      end_date: "2024-12-10",
      reason: "absent_record",
    });

    // 5. 自動検証処理がスキップされることを確認
    expect(result.should_proceed_with_verification).toBe(false);
    expect(result.verification_skipped).toBe(true);
    expect(result.skip_reason).toMatch(/前月データの不完全性/);

    // 6. 通知が正常に生成されることを確認（API呼び出しシミュレーション）
    fetchMock.mockResponseOnce(
      JSON.stringify({
        notification_id: "notif_20250105_001",
        status: "sent",
        timestamp: "2025-01-05T09:00:00Z",
      }),
      { status: 200 }
    );

    expect(result.notification_request).toBeDefined();
    expect(result.notification_request.notification_type).toBe(
      "verification_cannot_proceed"
    );
    expect(result.notification_request.user_id).toBeDefined();
    expect(result.notification_request.content.title).toMatch(
      /月次検証が実行できません/
    );
    expect(result.notification_request.content.body).toMatch(
      /前月のデータが不完全/
    );
  });
});