import { calculateBudgetOverage, isBudgetExceeded } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  test("SCEN-507: 食費超過額が0円の場合、超過判定が正確に判定される", () => {
    // ========== Precondition ==========
    // 献立自動生成アプリにログイン済み
    // 月次分析ダッシュボード画面にアクセス可能
    // 献立優先条件決定機能が利用可能

    // ========== Setup ==========
    // 当月の食費予算を50,000円に設定
    const monthlyBudget = 50000;

    // 当月の実際の食費を予算と同額に設定（50,000円）
    const actualExpense = 50000;

    // ========== Trigger ==========
    // 食費超過額の計算処理を実行
    const overage = calculateBudgetOverage({
      budget: monthlyBudget,
      actual: actualExpense,
    });

    // 超過判定ロジックが実行される
    const isExceeded = isBudgetExceeded({
      budget: monthlyBudget,
      actual: actualExpense,
    });

    // ========== Outcome: Assertion ==========
    // 食費超過額が0円であることを確認（予算内）
    expect(overage).toBe(0);

    // 超過判定関数が false（超過なし）を返すことを確認
    expect(isExceeded).toBe(false);

    // ========== Additional Validation ==========
    // 境界値テスト: 予算より1円少ない場合（超過なし）
    const underBudgetOverage = calculateBudgetOverage({
      budget: 50000,
      actual: 49999,
    });
    expect(underBudgetOverage).toBe(0);
    expect(
      isBudgetExceeded({ budget: 50000, actual: 49999 })
    ).toBe(false);

    // 境界値テスト: 予算より1円多い場合（超過あり）
    const overBudgetOverage = calculateBudgetOverage({
      budget: 50000,
      actual: 50001,
    });
    expect(overBudgetOverage).toBe(1);
    expect(
      isBudgetExceeded({ budget: 50000, actual: 50001 })
    ).toBe(true);

    // ========== Error Handling ==========
    // 負数の予算が入力された場合はエラー
    expect(() =>
      calculateBudgetOverage({ budget: -50000, actual: 40000 })
    ).toThrow(/予算/);

    // 負数の実績が入力された場合はエラー
    expect(() =>
      calculateBudgetOverage({ budget: 50000, actual: -10000 })
    ).toThrow(/実績/);

    // 予算がゼロの場合はエラー
    expect(() =>
      calculateBudgetOverage({ budget: 0, actual: 10000 })
    ).toThrow(/予算/);
  });
});