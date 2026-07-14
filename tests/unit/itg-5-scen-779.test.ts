import { determineMonthlyVerificationTiming } from "../../src/logic/it-7-2-1";

describe("月次検証タイミング判定機能", () => {
  test("SCEN-779: 当月1日から5日の間に検証タイミング確認を開始した場合、検証実行可能と判定される", () => {
    // 当月1日: 検証実行可能
    const result_1st = determineMonthlyVerificationTiming(
      new Date("2024-01-01T09:00:00Z")
    );
    expect(result_1st).toEqual({
      canExecuteVerification: true,
      status: "検証実行可能",
      message: "月次検証の実行が可能な期間です",
    });

    // 当月2日: 検証実行可能
    const result_2nd = determineMonthlyVerificationTiming(
      new Date("2024-01-02T09:00:00Z")
    );
    expect(result_2nd).toEqual({
      canExecuteVerification: true,
      status: "検証実行可能",
      message: "月次検証の実行が可能な期間です",
    });

    // 当月5日: 検証実行可能
    const result_5th = determineMonthlyVerificationTiming(
      new Date("2024-01-05T09:00:00Z")
    );
    expect(result_5th).toEqual({
      canExecuteVerification: true,
      status: "検証実行可能",
      message: "月次検証の実行が可能な期間です",
    });

    // 当月6日: 検証実行不可
    const result_6th = determineMonthlyVerificationTiming(
      new Date("2024-01-06T09:00:00Z")
    );
    expect(result_6th).toEqual({
      canExecuteVerification: false,
      status: "検証実行不可",
      message: "月次検証の実行期間外です。次月の1日以降にお試しください",
    });

    // 翌月1日: 検証実行可能
    const result_next_month = determineMonthlyVerificationTiming(
      new Date("2024-02-01T09:00:00Z")
    );
    expect(result_next_month).toEqual({
      canExecuteVerification: true,
      status: "検証実行可能",
      message: "月次検証の実行が可能な期間です",
    });
  });
});