import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import {
  identifyRejectionTargets,
  markRejectionTargetsForDisplay,
  recordRejectionAuditTrail,
} from '../../src/logic/it-2-br-6-3-2';

describe('季節変動・曜日別購買傾向の却下時修正対象識別機能', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-239
  test('季節変動・曜日別購買傾向が却下された場合、修正対象が明確に識別される', () => {
    // 前提: 季節変動・曜日別購買傾向の承認待ちデータが存在
    const purchase_trend_id = 'trend_20240115_001';
    const user_id = 'user_househusband_001';
    const rejection_date = new Date('2024-01-15T14:30:00Z');
    const rejection_reason = '冬季の係数が過度に高い。再検証が必要。';
    const rejected_by_user_id = 'user_pm_001';

    const trend_data = {
      purchase_trend_id: purchase_trend_id,
      seasonal_pattern: {
        winter: 1.35,
        spring: 0.95,
        summer: 0.88,
        autumn: 1.05,
      },
      day_of_week_coefficients: {
        monday: 1.02,
        tuesday: 0.98,
        wednesday: 1.01,
        thursday: 0.99,
        friday: 1.08,
        saturday: 1.15,
        sunday: 0.95,
      },
      data_period_start: '2023-10-01',
      data_period_end: '2024-01-14',
      anomaly_flags: [
        { date: '2023-12-25', category: 'holiday_spike', severity: 'high' },
        { date: '2024-01-01', category: 'new_year_spike', severity: 'high' },
      ],
      approval_status: 'pending',
    };

    // 実行1: 却下対象の識別
    const rejection_targets = identifyRejectionTargets({
      purchase_trend_id: purchase_trend_id,
      trend_data: trend_data,
      rejection_reason: rejection_reason,
    });

    // 검증1: 修正対象として冬季パターンが正確に識別される
    expect(rejection_targets).toEqual({
      purchase_trend_id: purchase_trend_id,
      target_fields: [
        {
          field_name: 'seasonal_pattern.winter',
          current_value: 1.35,
          flag_reason: '却下理由に明示: 冬季係数が過度',
          priority: 'high',
        },
        {
          field_name: 'anomaly_flags',
          current_count: 2,
          flag_reason: '異常値が複数検出: holiday_spike, new_year_spike',
          priority: 'high',
        },
        {
          field_name: 'data_period',
          period_range: '2023-10-01 ~ 2024-01-14',
          flag_reason: '異常値が集中した期間を再検証要',
          priority: 'medium',
        },
      ],
      identified_at: new Date('2024-01-15T14:30:00Z'),
    });

    // 実行2: 修正対象を画面表示用にマーク
    const display_marked_data = markRejectionTargetsForDisplay({
      trend_data: trend_data,
      rejection_targets: rejection_targets,
    });

    // 検証2: 修正対象が強調表示フラグ付きで構造化される
    expect(display_marked_data).toEqual({
      purchase_trend_id: purchase_trend_id,
      seasonal_pattern: {
        winter: {
          value: 1.35,
          highlight: true,
          highlight_color: '#FF6B6B',
          icon: '⚠️',
          tooltip: '却下対象: 冬季係数が過度に高い',
        },
        spring: {
          value: 0.95,
          highlight: false,
        },
        summer: {
          value: 0.88,
          highlight: false,
        },
        autumn: {
          value: 1.05,
          highlight: false,
        },
      },
      day_of_week_coefficients: {
        monday: { value: 1.02, highlight: false },
        tuesday: { value: 0.98, highlight: false },
        wednesday: { value: 1.01, highlight: false },
        thursday: { value: 0.99, highlight: false },
        friday: { value: 1.08, highlight: false },
        saturday: { value: 1.15, highlight: false },
        sunday: { value: 0.95, highlight: false },
      },
      data_period: {
        start: '2023-10-01',
        end: '2024-01-14',
        highlight: true,
        highlight_color: '#FFD93D',
        icon: '🔍',
        tooltip: '異常値が集中した期間',
      },
      anomaly_flags: [
        {
          date: '2023-12-25',
          category: 'holiday_spike',
          severity: 'high',
          highlight: true,
          highlight_color: '#FF6B6B',
        },
        {
          date: '2024-01-01',
          category: 'new_year_spike',
          severity: 'high',
          highlight: true,
          highlight_color: '#FF6B6B',
        },
      ],
    });

    // 実行3: 却下監査証跡を記録
    const audit_trail = recordRejectionAuditTrail({
      purchase_trend_id: purchase_trend_id,
      user_id: user_id,
      rejection_date: rejection_date,
      rejection_reason: rejection_reason,
      rejected_by_user_id: rejected_by_user_id,
      rejection_targets: rejection_targets,
    });

    // 検証3: 監査証跡が正確に記録される
    expect(audit_trail).toEqual({
      audit_record_id: expect.stringMatching(/^audit_\d+_/),
      purchase_trend_id: purchase_trend_id,
      user_id: user_id,
      rejected_by_user_id: rejected_by_user_id,
      rejection_date: new Date('2024-01-15T14:30:00Z'),
      rejection_reason: rejection_reason,
      target_count: 3,
      targets_recorded: [
        'seasonal_pattern.winter',
        'anomaly_flags',
        'data_period',
      ],
      record_status: 'recorded',
      timestamp: expect.any(Date),
    });

    // 検証4: 監査証跡のタイムスタンプが記録時刻以降であることを確認
    expect(audit_trail.timestamp.getTime()).toBeGreaterThanOrEqual(
      rejection_date.getTime()
    );

    // 検証5: 修正対象の優先度が正しくマッピングされている
    const high_priority_targets = rejection_targets.target_fields.filter(
      (t) => t.priority === 'high'
    );
    expect(high_priority_targets.length).toBe(2);
    expect(high_priority_targets[0].field_name).toBe('seasonal_pattern.winter');
    expect(high_priority_targets[1].field_name).toBe('anomaly_flags');

    // 検証6: 画面表示用データの強調表示フラグが修正対象と一致
    expect(display_marked_data.seasonal_pattern.winter.highlight).toBe(true);
    expect(display_marked_data.data_period.highlight).toBe(true);
    expect(display_marked_data.anomaly_flags[0].highlight).toBe(true);

    // 検証7: 非対象項目は強調表示されない
    expect(display_marked_data.seasonal_pattern.spring.highlight).toBe(false);
    expect(display_marked_data.day_of_week_coefficients.monday.highlight).toBe(
      false
    );

    // 検証8: ツールチップとアイコンが修正対象に付与されている
    expect(
      display_marked_data.seasonal_pattern.winter.tooltip
    ).toMatch(/却下対象/);
    expect(display_marked_data.seasonal_pattern.winter.icon).toBe('⚠️');
  });
});