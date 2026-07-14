import { createVerificationReport, judgeApprovalCriteria } from '../../src/logic/it-7-2-1';

describe('週次アルゴリズム改善検証レポート作成と承認判定', () => {
  // SCEN-693: 検証結果レポート作成・承認判定 - 承認判定基準に基づいて承認可否を正確に判定する
  test('should accurately judge approval criteria and record results in verification report', () => {
    // テストデータ: 複数の検証結果レポート（承認基準を満たすもの・満たさないもの）を準備
    const reportDataPassingAllCriteria = {
      report_id: 'RPT-001',
      verification_week: '2024-W10',
      meal_plan_success_rate: 0.92,
      cooking_time_reduction_rate: 0.88,
      user_satisfaction_score: 4.6,
      error_rate: 0.03,
      nutrition_achievement_rate: 0.85,
    };

    const reportDataFailingAccuracy = {
      report_id: 'RPT-002',
      verification_week: '2024-W10',
      meal_plan_success_rate: 0.72,
      cooking_time_reduction_rate: 0.80,
      user_satisfaction_score: 4.2,
      error_rate: 0.04,
      nutrition_achievement_rate: 0.78,
    };

    const reportDataFailingErrorRate = {
      report_id: 'RPT-003',
      verification_week: '2024-W10',
      meal_plan_success_rate: 0.85,
      cooking_time_reduction_rate: 0.82,
      user_satisfaction_score: 4.4,
      error_rate: 0.07,
      nutrition_achievement_rate: 0.80,
    };

    const reportDataPartiallyFailing = {
      report_id: 'RPT-004',
      verification_week: '2024-W10',
      meal_plan_success_rate: 0.75,
      cooking_time_reduction_rate: 0.75,
      user_satisfaction_score: 3.8,
      error_rate: 0.06,
      nutrition_achievement_rate: 0.72,
    };

    // 承認判定基準の定義を確認
    const approval_criteria = {
      min_meal_plan_success_rate: 0.80,
      min_cooking_time_reduction_rate: 0.80,
      min_user_satisfaction_score: 4.5,
      max_error_rate: 0.05,
      min_nutrition_achievement_rate: 0.80,
    };

    // 検証結果レポート作成機能を実行し、レポートデータを生成
    const generatedReport1 = createVerificationReport({
      report_id: reportDataPassingAllCriteria.report_id,
      verification_week: reportDataPassingAllCriteria.verification_week,
      meal_plan_success_rate: reportDataPassingAllCriteria.meal_plan_success_rate,
      cooking_time_reduction_rate: reportDataPassingAllCriteria.cooking_time_reduction_rate,
      user_satisfaction_score: reportDataPassingAllCriteria.user_satisfaction_score,
      error_rate: reportDataPassingAllCriteria.error_rate,
      nutrition_achievement_rate: reportDataPassingAllCriteria.nutrition_achievement_rate,
    });

    const generatedReport2 = createVerificationReport({
      report_id: reportDataFailingAccuracy.report_id,
      verification_week: reportDataFailingAccuracy.verification_week,
      meal_plan_success_rate: reportDataFailingAccuracy.meal_plan_success_rate,
      cooking_time_reduction_rate: reportDataFailingAccuracy.cooking_time_reduction_rate,
      user_satisfaction_score: reportDataFailingAccuracy.user_satisfaction_score,
      error_rate: reportDataFailingAccuracy.error_rate,
      nutrition_achievement_rate: reportDataFailingAccuracy.nutrition_achievement_rate,
    });

    const generatedReport3 = createVerificationReport({
      report_id: reportDataFailingErrorRate.report_id,
      verification_week: reportDataFailingErrorRate.verification_week,
      meal_plan_success_rate: reportDataFailingErrorRate.meal_plan_success_rate,
      cooking_time_reduction_rate: reportDataFailingErrorRate.cooking_time_reduction_rate,
      user_satisfaction_score: reportDataFailingErrorRate.user_satisfaction_score,
      error_rate: reportDataFailingErrorRate.error_rate,
      nutrition_achievement_rate: reportDataFailingErrorRate.nutrition_achievement_rate,
    });

    const generatedReport4 = createVerificationReport({
      report_id: reportDataPartiallyFailing.report_id,
      verification_week: reportDataPartiallyFailing.verification_week,
      meal_plan_success_rate: reportDataPartiallyFailing.meal_plan_success_rate,
      cooking_time_reduction_rate: reportDataPartiallyFailing.cooking_time_reduction_rate,
      user_satisfaction_score: reportDataPartiallyFailing.user_satisfaction_score,
      error_rate: reportDataPartiallyFailing.error_rate,
      nutrition_achievement_rate: reportDataPartiallyFailing.nutrition_achievement_rate,
    });

    // 承認判定ロジックに各レポートを入力する
    const judgment1 = judgeApprovalCriteria(generatedReport1, approval_criteria);
    const judgment2 = judgeApprovalCriteria(generatedReport2, approval_criteria);
    const judgment3 = judgeApprovalCriteria(generatedReport3, approval_criteria);
    const judgment4 = judgeApprovalCriteria(generatedReport4, approval_criteria);

    // 承認基準を満たすレポートが『承認』と判定されることを確認
    expect(judgment1.approval_status).toBe('approved');
    expect(judgment1.report_id).toBe('RPT-001');

    // 承認基準を満たさないレポート（成功率が80%未満）が『却下』と判定されることを確認
    expect(judgment2.approval_status).toBe('rejected');
    expect(judgment2.report_id).toBe('RPT-002');
    expect(judgment2.rejection_reasons).toContain('meal_plan_success_rate_below_threshold');

    // 承認基準を満たさないレポート（エラー率が5%を超過）が『却下』と判定されることを確認
    expect(judgment3.approval_status).toBe('rejected');
    expect(judgment3.report_id).toBe('RPT-003');
    expect(judgment3.rejection_reasons).toContain('error_rate_exceeds_threshold');

    // 複数の判定基準が存在する場合、全ての基準が正しく評価されることを確認
    expect(judgment4.approval_status).toBe('rejected');
    expect(judgment4.report_id).toBe('RPT-004');
    expect(judgment4.rejection_reasons.length).toBeGreaterThan(1);
    expect(judgment4.rejection_reasons).toContain('meal_plan_success_rate_below_threshold');
    expect(judgment4.rejection_reasons).toContain('cooking_time_reduction_rate_below_threshold');
    expect(judgment4.rejection_reasons).toContain('user_satisfaction_score_below_threshold');
    expect(judgment4.rejection_reasons).toContain('nutrition_achievement_rate_below_threshold');

    // 判定結果がレポートに記録されることを確認
    expect(generatedReport1.approval_status).toBeUndefined();
    const recordedReport1 = {
      ...generatedReport1,
      ...judgment1,
    };
    expect(recordedReport1.approval_status).toBe('approved');
    expect(recordedReport1.judgment_timestamp).toBeDefined();

    const recordedReport2 = {
      ...generatedReport2,
      ...judgment2,
    };
    expect(recordedReport2.approval_status).toBe('rejected');
    expect(recordedReport2.rejection_reasons).toBeDefined();
    expect(recordedReport2.judgment_timestamp).toBeDefined();
  });
});