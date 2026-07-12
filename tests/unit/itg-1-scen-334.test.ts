import { detectAndPrioritizeConstraintChanges } from '../../src/logic/it-1-1-1';

describe('家族成員の食事評価履歴とアレルギー・食事制限情報の変更を定期的に監視し、献立生成アルゴリズムの制約条件に自動反映する機能', () => {
  // SCEN-334: [edge] 食事制限・アレルギー情報の変更検出と優先度付け - 前回更新から6日59分経過した情報は優先度付け対象外となる
  test('前回更新から6日59分経過した食事制限・アレルギー情報は優先度付け対象外に分類される', () => {
    const baseTime = new Date('2024-01-15T09:00:00Z');
    const constraintLastUpdateTime = new Date('2024-01-08T09:01:00Z');
    const currentMockTime = new Date('2024-01-15T09:00:00Z');

    const elapsedMillis = currentMockTime.getTime() - constraintLastUpdateTime.getTime();
    const elapsedDays = elapsedMillis / (1000 * 60 * 60 * 24);
    const elapsedMinutes = (elapsedDays * 24 * 60) % 1440;

    expect(elapsedDays).toBe(6.9930555555555555);
    expect(Math.floor(elapsedMinutes)).toBe(1439);

    const constraintRecords = [
      {
        constraint_id: 'restrict_001',
        user_id: 'user_001',
        restriction_type: '食事制限',
        restriction_name: 'グルテンフリー',
        last_updated_at: constraintLastUpdateTime,
        priority_category: null as string | null,
      },
    ];

    const result = detectAndPrioritizeConstraintChanges(
      constraintRecords,
      currentMockTime,
      7
    );

    expect(result.prioritized_constraints).toHaveLength(0);
    expect(result.total_records).toBe(1);
    expect(result.prioritized_count).toBe(0);
    expect(result.excluded_count).toBe(1);

    const exclusionLog = result.constraint_change_log.find(
      (log: any) =>
        log.constraint_id === 'restrict_001' &&
        log.action === 'excluded_below_threshold'
    );

    expect(exclusionLog).toBeDefined();
    if (exclusionLog) {
      expect(exclusionLog.reason).toMatch(/7日/);
      expect(exclusionLog.elapsed_days).toBeLessThan(7);
      expect(exclusionLog.elapsed_days).toBeGreaterThan(6.99);
    }

    expect(result.warning_logged).toBe(false);
  });
});