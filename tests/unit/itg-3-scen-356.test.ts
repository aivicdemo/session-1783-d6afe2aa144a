import { analyzeMonthlyExcessFoodExpense } from '../../src/logic/it-1-br-6-2-1-1';

describe('月次食費超過要因の分解・分析機能', () => {
  // SCEN-356
  test('食費実績が予算上限と完全に一致した場合、超過要因分析がスキップされ適切に処理される', () => {
    // 入力: 月次予算10,000円、食費実績10,000円（完全一致）
    const budget_amount = 10000;
    const actual_spending = 10000;
    const category_breakdown = {
      vegetables: 3000,
      meat: 3500,
      dairy: 2000,
      grains: 1500,
    };

    // 実行
    const result = analyzeMonthlyExcessFoodExpense({
      budget_amount,
      actual_spending,
      category_breakdown,
    });

    // 期待結果1: 超過額がゼロで表示される
    expect(result.excess_amount).toBe(0);

    // 期待結果2: 超過フラグがfalseで、分析スキップが正しく判定される
    expect(result.is_excess).toBe(false);

    // 期待結果3: 超過要因分析結果がnullまたは空のオブジェクト（分析不実行）
    expect(result.excess_analysis_result).toBeNull();

    // 期待結果4: ユーザーメッセージが「予算内」であることを示す
    expect(result.message).toMatch(/予算内|within.*budget/i);

    // 期待結果5: システムエラーフラグがfalseで、エラーなし
    expect(result.system_error).toBe(false);

    // 期待結果6: 分析実行ボタンが無効化されている状態を示す
    expect(result.analysis_button_enabled).toBe(false);

    // 期待結果7: 分析対象外理由が正しく記録される
    expect(result.analysis_skip_reason).toMatch(/no.*excess|exact.*match/i);
  });
});