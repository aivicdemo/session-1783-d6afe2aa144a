import { collectMealFeedback } from '../../src/logic/it-7-2-1';

describe('献立評価フィードバック蓄積機能', () => {
  // SCEN-545
  test('複数家族成員のフィードバック入力が全件漏れなく蓄積される', () => {
    const family_member_id_1 = 'fm_001';
    const family_member_id_2 = 'fm_002';
    const family_member_id_3 = 'fm_003';
    const meal_plan_id = 'mp_20240115';
    const timestamp_1 = new Date('2024-01-15T18:30:00Z');
    const timestamp_2 = new Date('2024-01-15T18:45:00Z');
    const timestamp_3 = new Date('2024-01-15T19:00:00Z');

    const feedback_input_1 = {
      family_member_id: family_member_id_1,
      meal_plan_id: meal_plan_id,
      satisfaction_score: 85,
      completion_rate: 95,
      request_text: '次はカレーを希望します',
      timestamp: timestamp_1,
    };

    const feedback_input_2 = {
      family_member_id: family_member_id_2,
      meal_plan_id: meal_plan_id,
      satisfaction_score: 72,
      completion_rate: 80,
      request_text: '野菜をもっと増やしてください',
      timestamp: timestamp_2,
    };

    const feedback_input_3 = {
      family_member_id: family_member_id_3,
      meal_plan_id: meal_plan_id,
      satisfaction_score: 92,
      completion_rate: 100,
      request_text: 'この献立を毎週提案してください',
      timestamp: timestamp_3,
    };

    const input_batch = [feedback_input_1, feedback_input_2, feedback_input_3];

    const result = collectMealFeedback(input_batch);

    expect(result.total_feedback_count).toBe(3);
    expect(result.accumulated_feedbacks).toHaveLength(3);

    expect(result.accumulated_feedbacks[0]).toEqual({
      family_member_id: family_member_id_1,
      meal_plan_id: meal_plan_id,
      satisfaction_score: 85,
      completion_rate: 95,
      request_text: '次はカレーを希望します',
      timestamp: timestamp_1,
      collected_at: expect.any(Date),
    });

    expect(result.accumulated_feedbacks[1]).toEqual({
      family_member_id: family_member_id_2,
      meal_plan_id: meal_plan_id,
      satisfaction_score: 72,
      completion_rate: 80,
      request_text: '野菜をもっと増やしてください',
      timestamp: timestamp_2,
      collected_at: expect.any(Date),
    });

    expect(result.accumulated_feedbacks[2]).toEqual({
      family_member_id: family_member_id_3,
      meal_plan_id: meal_plan_id,
      satisfaction_score: 92,
      completion_rate: 100,
      request_text: 'この献立を毎週提案してください',
      timestamp: timestamp_3,
      collected_at: expect.any(Date),
    });

    expect(result.accumulated_feedbacks[0].family_member_id).toBe(
      family_member_id_1
    );
    expect(result.accumulated_feedbacks[1].family_member_id).toBe(
      family_member_id_2
    );
    expect(result.accumulated_feedbacks[2].family_member_id).toBe(
      family_member_id_3
    );

    expect(result.accumulated_feedbacks[0].timestamp).toEqual(timestamp_1);
    expect(result.accumulated_feedbacks[1].timestamp).toEqual(timestamp_2);
    expect(result.accumulated_feedbacks[2].timestamp).toEqual(timestamp_3);

    expect(result.accumulated_feedbacks[0].satisfaction_score).toBe(85);
    expect(result.accumulated_feedbacks[1].satisfaction_score).toBe(72);
    expect(result.accumulated_feedbacks[2].satisfaction_score).toBe(92);

    expect(result.accumulated_feedbacks[0].completion_rate).toBe(95);
    expect(result.accumulated_feedbacks[1].completion_rate).toBe(80);
    expect(result.accumulated_feedbacks[2].completion_rate).toBe(100);

    expect(result.success).toBe(true);
  });
});