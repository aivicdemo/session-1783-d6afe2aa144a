import { determineMonthlyCycleTargetMonth } from "../../src/logic/it-1-br-3-2-1";

describe("購入実績の記録と月次食費削減効果の自動集計・分析機能", () => {
  // SCEN-420: [edge] 分析タイミング判定機能 - 月末日23時59分と翌月初日00時00分の境界で正確に月次判定が切り替わる
  test("should correctly determine target analysis month at month-end and month-start boundaries", () => {
    // Precondition: テスト用の現在時刻を月末日23時59分に設定
    const monthEndAt2359 = new Date("2024-01-31T23:59:00Z");

    // Action: 分析タイミング判定機能を呼び出し、当月の分析対象月を取得
    const targetMonthAt2359 = determineMonthlyCycleTargetMonth({
      current_date: monthEndAt2359,
    });

    // Expected: 取得した分析対象月が当月(2024-01)であることを確認
    expect(targetMonthAt2359).toEqual({
      year: 2024,
      month: 1,
      is_current_month: true,
    });

    // Trigger: 現在時刻を翌月初日00時00分に進める
    const nextMonthStartAt0000 = new Date("2024-02-01T00:00:00Z");

    // Action: 分析タイミング判定機能を再度呼び出し、当月の分析対象月を取得
    const targetMonthAt0000 = determineMonthlyCycleTargetMonth({
      current_date: nextMonthStartAt0000,
    });

    // Expected: 取得した分析対象月が翌月(2024-02)であることを確認
    expect(targetMonthAt0000).toEqual({
      year: 2024,
      month: 2,
      is_current_month: true,
    });

    // Trigger: 月末日23時59分59秒の状態で分析対象月を取得
    const monthEndAt235959 = new Date("2024-01-31T23:59:59Z");
    const targetMonthAt235959 = determineMonthlyCycleTargetMonth({
      current_date: monthEndAt235959,
    });

    // Expected: 月末日23時59分59秒時点では当月(2024-01)が分析対象月
    expect(targetMonthAt235959).toEqual({
      year: 2024,
      month: 1,
      is_current_month: true,
    });

    // Trigger: 翌月初日00時00分01秒の状態で分析対象月を取得
    const nextMonthStartAt000001 = new Date("2024-02-01T00:00:01Z");
    const targetMonthAt000001 = determineMonthlyCycleTargetMonth({
      current_date: nextMonthStartAt000001,
    });

    // Expected: 翌月初日00時00分01秒時点では翌月(2024-02)が分析対象月
    expect(targetMonthAt000001).toEqual({
      year: 2024,
      month: 2,
      is_current_month: true,
    });

    // Expected: 両者の分析対象月が異なることを確認 - 月末日23時59分59秒 vs 翌月初日00時00分01秒
    expect(targetMonthAt235959.month).not.toEqual(targetMonthAt000001.month);
    expect(targetMonthAt235959.year).toEqual(targetMonthAt000001.year);

    // Expected: 秒単位の境界においても月次判定が正確に切り替わることを確認
    // 23:59:59 は当月、00:00:01 は翌月
    expect(targetMonthAt235959.month).toBe(1);
    expect(targetMonthAt000001.month).toBe(2);

    // Expected: 月末日23時59分時点では当月が分析対象月として正確に判定される
    expect(targetMonthAt2359.month).toBe(1);
    expect(targetMonthAt2359.year).toBe(2024);

    // Expected: 翌月初日00時00分に切り替わる瞬間に翌月が分析対象月として正確に判定される
    expect(targetMonthAt0000.month).toBe(2);
    expect(targetMonthAt0000.year).toBe(2024);
  });
});