import { detectRestrictionChanges } from '../../src/logic/it-1-br-2-1-1-1';

describe('食事制限・アレルギー情報の変更検出・優先度判定機能', () => {
  // SCEN-318
  test('前回更新から6日11時間59分の場合、変更検出ロジックが発動しない', () => {
    const previousUpdateTime = new Date('2024-01-01T10:00:00Z');
    const currentTime = new Date('2024-01-08T09:59:59Z');
    const timeDiffMs = currentTime.getTime() - previousUpdateTime.getTime();
    const timeDiffDays = timeDiffMs / (1000 * 60 * 60 * 24);

    const restriction = {
      user_id: 'user_001',
      restriction_name: 'グルテンフリー',
      previous_update_at: previousUpdateTime,
      current_update_at: null,
    };

    const result = detectRestrictionChanges({
      restriction: restriction,
      current_time: currentTime,
      threshold_days: 7,
    });

    expect(result.is_change_detected).toBe(false);
    expect(result.days_since_last_update).toBe(6.9999884259);
    expect(result.priority_judgment_triggered).toBe(false);
    expect(result.requires_update).toBe(false);
  });
});