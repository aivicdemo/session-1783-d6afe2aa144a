import { calculatePriorityMatrixPlacement } from '../../src/logic/it-1-br-3-2-1';

describe('需要予測外部要因分析 - 優先度マトリクス配置エラーハンドリング', () => {
  // SCEN-474
  test('外部要因分析データが不足した場合、エラーコードとエラーメッセージを含むエラーオブジェクトを返す', () => {
    // Arrange: 外部要因分析データを不足した状態で設定
    // 必要な変数の50%以下のデータを用意
    const requiredVariables = ['temperature', 'humidity', 'event_type', 'competitor_discount', 'holiday_flag'];
    const insufficientAnalysisData = {
      externalFactors: [
        {
          variable_name: 'temperature',
          correlation_coefficient: 0.65,
          impact_score: null, // 影響度スコア計算に必要なデータが不足
        },
        {
          variable_name: 'humidity',
          correlation_coefficient: 0.42,
          impact_score: null, // 影響度スコア計算に必要なデータが不足
        },
        // 必要な5個中、2個のみ → 40% で「50%以下」の条件に合致
      ],
      analysis_date: new Date('2024-12-15T10:00:00Z'),
      missing_variables: ['event_type', 'competitor_discount', 'holiday_flag'],
    };

    // Act: 優先度マトリクス配置機能を実行
    const result = calculatePriorityMatrixPlacement(insufficientAnalysisData);

    // Assert: エラーオブジェクトの検証
    expect(result).toHaveProperty('error_code');
    expect(result.error_code).toBe('ERR_INSUFFICIENT_EXTERNAL_DATA');

    expect(result).toHaveProperty('error_message');
    expect(result.error_message).toMatch(/外部要因分析データが不足しているため、優先度マトリクス配置を実行できません/);
    expect(result.error_message).toMatch(/不足している変数/);
    expect(result.error_message).toContain('event_type');
    expect(result.error_message).toContain('competitor_discount');
    expect(result.error_message).toContain('holiday_flag');

    // 優先度マトリクスが配置されず、nullまたは空の状態であることを確認
    expect(result).toHaveProperty('priority_matrix');
    expect(result.priority_matrix).toBeNull();

    // エラーオブジェクトにステータス情報が含まれることを確認
    expect(result).toHaveProperty('is_success');
    expect(result.is_success).toBe(false);

    expect(result).toHaveProperty('affected_records_count');
    expect(result.affected_records_count).toBe(0);
  });
});