import { decideMealGenerationPriorityCondition } from '../../src/logic/it-1-br-2-1-1-1';

describe('月次食費実績と栄養摂取状況の分析・家計方針調整 - 献立生成優先条件セット決定機能', () => {
  test('SCEN-442: 食費超過額が境界値0円の場合、正確に判定される', () => {
    // 前提: 月次分析結果で食費超過額が0円（予算額と実績額が完全に一致）の状態
    const monthlyAnalysisResult = {
      user_id: 'user_001',
      analysis_month: '2024-01-31',
      budget_amount: 50000,
      actual_food_expense: 50000,
      expense_overage_amount: 0,
      nutrition_items: [
        {
          nutrient_name: 'タンパク質',
          target_value: 60,
          actual_value: 58,
          achievement_rate: 96.67
        },
        {
          nutrient_name: 'カルシウム',
          target_value: 800,
          actual_value: 650,
          achievement_rate: 81.25
        },
        {
          nutrient_name: 'ビタミンC',
          target_value: 100,
          actual_value: 95,
          achievement_rate: 95.0
        }
      ],
      priority_analysis_items: [
        {
          nutrient_name: 'カルシウム',
          priority_rank: 1,
          improvement_gap: 150
        }
      ]
    };

    // 実行: 献立生成優先条件セットの決定機能
    const priorityConditionSet = decideMealGenerationPriorityCondition({
      budget_amount: monthlyAnalysisResult.budget_amount,
      actual_food_expense: monthlyAnalysisResult.actual_food_expense,
      expense_overage_amount: monthlyAnalysisResult.expense_overage_amount,
      nutrition_items: monthlyAnalysisResult.nutrition_items,
      priority_analysis_items: monthlyAnalysisResult.priority_analysis_items
    });

    // 期待結果: 食費超過額が0円（境界値）の場合、超過状態ではなく予算内と正確に判定される
    expect(priorityConditionSet.is_budget_exceeded).toBe(false);

    // 超過フラグがfalseのため、優先度は通常の範囲内で設定される
    expect(priorityConditionSet.budget_priority_level).toBe('normal');

    // 予算比率が100%（0円超過、0円削減）と正確に計算される
    expect(priorityConditionSet.budget_utilization_rate).toBe(100.0);

    // 優先条件セットの方針は通常方針（栄養重視 + 予算均衡）として決定される
    expect(priorityConditionSet.policy_type).toBe('nutrition_balanced');

    // 栄養不足項目のうち優先度1番のカルシウムが最優先対応項目として設定される
    expect(priorityConditionSet.priority_nutrient).toBe('カルシウム');

    // 優先度マトリクスでの優先順位が適切に割り当てられている
    expect(priorityConditionSet.priority_rank).toBe(1);

    // 改善ギャップ（目標値との差分）が150gと正確に記録される
    expect(priorityConditionSet.improvement_gap).toBe(150);

    // 献立生成時の制約条件フラグが適切に設定される
    expect(priorityConditionSet.apply_budget_constraint).toBe(false);
    expect(priorityConditionSet.apply_nutrition_constraint).toBe(true);

    // 次月献立生成優先度スコアが算出される（予算内のため低リスク、栄養改善を優先）
    expect(priorityConditionSet.next_month_priority_score).toBe(75);
  });
});