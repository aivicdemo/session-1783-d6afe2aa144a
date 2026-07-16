import { evaluateDataTrustworthiness } from '../../src/logic/it-8-1-2-1';

describe('データ信頼度レベル判定機能', () => {
  // SCEN-337
  test('矛盾が検出されたデータの信頼度が低レベルに段階付けされる', () => {
    // テストデータの準備：複数のユーザーペイン情報を含むデータセット
    const painDataset = [
      {
        user_id: 'USR001',
        segment: 'stay_at_home_dad_30s_with_kids',
        pain_factor: 'cooking_time_constraint',
        pain_description: '平日は30分以内に調理完了が必須',
        frequency_score: 85,
        impact_score: 90,
        source: 'interview',
        log_confirmation: true,
      },
      {
        user_id: 'USR002',
        segment: 'stay_at_home_dad_30s_with_kids',
        pain_factor: 'cooking_time_constraint',
        pain_description: '調理時間は1時間以内が目安',
        frequency_score: 60,
        impact_score: 55,
        source: 'interview',
        log_confirmation: true,
      },
      {
        user_id: 'USR003',
        segment: 'stay_at_home_dad_40s_no_restriction',
        pain_factor: 'food_allergy_handling',
        pain_description: '家族成員のアレルギー管理が煩雑',
        frequency_score: 75,
        impact_score: 70,
        source: 'log_analysis',
        log_confirmation: true,
      },
      {
        user_id: 'USR004',
        segment: 'stay_at_home_dad_30s_with_kids',
        pain_factor: 'cooking_time_constraint',
        pain_description: '調理時間は制限なし、1時間以上かかっても問題ない',
        frequency_score: 85,
        impact_score: 10,
        source: 'interview',
        log_confirmation: false,
      },
      {
        user_id: 'USR005',
        segment: 'stay_at_home_dad_40s_no_restriction',
        pain_factor: 'budget_constraint',
        pain_description: '月次食費予算は25000円以内で厳格に管理',
        frequency_score: 88,
        impact_score: 82,
        source: 'log_analysis',
        log_confirmation: true,
      },
    ];

    // データ信頼度レベル判定機能を実行
    const trustworthiness_result = evaluateDataTrustworthiness(painDataset);

    // 矛盾検出ロジックが矛盾するデータを識別したことを確認
    expect(trustworthiness_result.contradictions_detected).toBe(true);
    expect(trustworthiness_result.contradiction_count).toBe(1);

    // 矛盾が検出されたデータの信頼度レベルを確認
    const contradicted_record = trustworthiness_result.evaluated_records.find(
      (record: any) => record.user_id === 'USR004'
    );
    expect(contradicted_record).toBeDefined();

    // 信頼度レベルが「低（LOW）」に段階付けされていることを検証
    expect(contradicted_record.trust_level).toBe('LOW');
    expect(contradicted_record.trust_score).toBeLessThan(30);
    expect(contradicted_record.contradiction_flag).toBe(true);

    // 矛盾が検出されなかったデータの信頼度レベルを確認
    const non_contradicted_records = trustworthiness_result.evaluated_records.filter(
      (record: any) => record.user_id !== 'USR004'
    );

    non_contradicted_records.forEach((record: any) => {
      // 矛盾が検出されなかったデータの信頼度レベルがより高いレベル（中以上）に保たれていることを確認
      expect(record.contradiction_flag).toBe(false);
      expect(['MEDIUM', 'HIGH']).toContain(record.trust_level);
      expect(record.trust_score).toBeGreaterThanOrEqual(50);
    });

    // 全体的な結果構造を検証
    expect(trustworthiness_result.evaluated_records.length).toBe(5);
    expect(trustworthiness_result.summary).toBeDefined();
    expect(trustworthiness_result.summary.total_records).toBe(5);
    expect(trustworthiness_result.summary.low_trust_count).toBe(1);
    expect(trustworthiness_result.summary.medium_or_high_trust_count).toBe(4);
  });
});