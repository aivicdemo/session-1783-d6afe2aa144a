// SCEN-256
import { determineMonthlyVerificationTiming } from "../../src/logic/it-1-br-6-2-1";

describe("需要予測精度検証ダッシュボード：予測値と実績値の照合・乖離分析機能", () => {
  test("SCEN-256: 当月6日以降のアクセスで検証実行スキップと待機指示を通知できる", () => {
    // 前提: 当月6日のアクセスシミュレーション
    const accessDateDay6 = new Date("2024-01-06T10:00:00Z");
    const currentMonthYear = "2024-01";

    // 実行: 月次検証タイミング判定機能を実行（当月6日）
    const resultDay6 = determineMonthlyVerificationTiming({
      accessDate: accessDateDay6,
      currentMonthYear: currentMonthYear,
    });

    // 検証1: 当月6日のアクセスで検証実行スキップが判定される
    expect(resultDay6.shouldExecuteVerification).toBe(false);
    expect(resultDay6.verificationStatus).toBe("skipped");

    // 検証2: 待機指示通知が正常に生成される
    expect(resultDay6.notificationMessage).toBeDefined();
    expect(resultDay6.notificationMessage).toMatch(/検証実行は翌月に予定されています/);

    // 検証3: 通知メッセージに次回検証予定日が含まれている
    expect(resultDay6.notificationMessage).toMatch(/2024-02-01/);
    expect(resultDay6.nextScheduledVerificationDate).toBe("2024-02-01");

    // 前提: 当月7日のアクセスシミュレーション
    const accessDateDay7 = new Date("2024-01-07T14:30:00Z");

    // 実行: 月次検証タイミング判定機能を実行（当月7日）
    const resultDay7 = determineMonthlyVerificationTiming({
      accessDate: accessDateDay7,
      currentMonthYear: currentMonthYear,
    });

    // 検証4: 当月7日のアクセスでも検証実行スキップが判定される（複数回アクセスの再現性）
    expect(resultDay7.shouldExecuteVerification).toBe(false);
    expect(resultDay7.verificationStatus).toBe("skipped");

    // 検証5: 同じ待機指示通知が再度生成される
    expect(resultDay7.notificationMessage).toBeDefined();
    expect(resultDay7.notificationMessage).toMatch(/検証実行は翌月に予定されています/);

    // 検証6: 次回検証予定日が一貫している
    expect(resultDay7.notificationMessage).toMatch(/2024-02-01/);
    expect(resultDay7.nextScheduledVerificationDate).toBe("2024-02-01");

    // 検証7: 両日付アクセスで同一の待機状態が保証される
    expect(resultDay6.verificationStatus).toEqual(resultDay7.verificationStatus);
    expect(resultDay6.nextScheduledVerificationDate).toEqual(
      resultDay7.nextScheduledVerificationDate
    );
  });
});