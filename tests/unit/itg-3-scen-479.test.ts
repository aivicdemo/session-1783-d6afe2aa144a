import { distributeRuleSpecificationAndTrackConfirmation } from '../../src/logic/it-1-br-3-2-1';

describe('ルール仕様書の対象者配布と確認追跡', () => {
  // SCEN-479
  test('更新されたルール仕様書が指定タイミングで開発チームメンバーに配布され、確認状況がシステムで追跡可能になる', () => {
    const distribution_id = 'dist_001_20240315';
    const rule_spec_version = 'v2.1.0_seasonal_discount';
    const rule_spec_content = {
      seasonal_patterns: [
        { season: 'spring', priority_weight: 0.85, effective_from: '2024-03-01', effective_to: '2024-05-31' },
        { season: 'summer', priority_weight: 0.72, effective_from: '2024-06-01', effective_to: '2024-08-31' }
      ],
      discount_rate_thresholds: [
        { category: 'vegetable', min_discount: 0.15, max_discount: 0.40 },
        { category: 'meat', min_discount: 0.10, max_discount: 0.35 }
      ],
      sales_period_rules: [
        { event_type: 'weekday_sale', duration_days: 3, priority_multiplier: 1.2 },
        { event_type: 'weekend_promotion', duration_days: 2, priority_multiplier: 1.5 }
      ]
    };
    const upload_timestamp = new Date('2024-03-15T10:30:00Z');
    const distribution_target_members = [
      { member_id: 'dev_001', name: 'Alice Dev', email: 'alice@example.com', role: 'backend_engineer' },
      { member_id: 'dev_002', name: 'Bob Dev', email: 'bob@example.com', role: 'frontend_engineer' },
      { member_id: 'dev_003', name: 'Carol Dev', email: 'carol@example.com', role: 'algorithm_specialist' },
      { member_id: 'dev_004', name: 'Dave Dev', email: 'dave@example.com', role: 'qa_engineer' }
    ];
    const scheduled_distribution_time = new Date('2024-03-15T14:00:00Z');
    const distribution_timing = 'scheduled';

    const result = distributeRuleSpecificationAndTrackConfirmation({
      distribution_id,
      rule_spec_version,
      rule_spec_content,
      upload_timestamp,
      distribution_target_members,
      scheduled_distribution_time,
      distribution_timing
    });

    // 配布が正常に実行されたことを確認
    expect(result.distribution_status).toBe('completed');
    expect(result.distribution_id).toBe('dist_001_20240315');
    expect(result.rule_spec_version).toBe('v2.1.0_seasonal_discount');
    expect(result.actual_distribution_time).toEqual(new Date('2024-03-15T14:00:00Z'));

    // 全対象メンバーに配布されたことを確認
    expect(result.distributed_to_count).toBe(4);
    expect(result.distribution_recipients).toHaveLength(4);
    expect(result.distribution_recipients.map(r => r.member_id)).toEqual(['dev_001', 'dev_002', 'dev_003', 'dev_004']);

    // 初期状態では全員が「未確認」ステータスであることを確認
    expect(result.confirmation_tracking).toHaveLength(4);
    const unconfirmed_initial = result.confirmation_tracking.filter(t => t.confirmation_status === 'unconfirmed');
    expect(unconfirmed_initial).toHaveLength(4);

    // 各メンバーの追跡情報に必須フィールドが存在することを確認
    result.confirmation_tracking.forEach(tracking => {
      expect(tracking.member_id).toBeDefined();
      expect(tracking.member_name).toBeDefined();
      expect(tracking.confirmation_status).toBe('unconfirmed');
      expect(tracking.confirmation_timestamp).toBeNull();
      expect(tracking.view_count).toBe(0);
    });

    // メンバーがアクセスして仕様書を確認した後の状態をシミュレート
    const after_alice_confirmation = distributeRuleSpecificationAndTrackConfirmation({
      distribution_id,
      rule_spec_version,
      rule_spec_content,
      upload_timestamp,
      distribution_target_members,
      scheduled_distribution_time,
      distribution_timing,
      member_confirmations: [
        {
          member_id: 'dev_001',
          confirmation_timestamp: new Date('2024-03-15T14:15:00Z'),
          view_count: 1
        },
        {
          member_id: 'dev_003',
          confirmation_timestamp: new Date('2024-03-15T14:45:00Z'),
          view_count: 2
        }
      ]
    });

    // 複数メンバーが確認した後の追跡情報を検証
    expect(after_alice_confirmation.confirmation_tracking).toHaveLength(4);

    const alice_tracking = after_alice_confirmation.confirmation_tracking.find(t => t.member_id === 'dev_001');
    expect(alice_tracking).toBeDefined();
    expect(alice_tracking?.confirmation_status).toBe('confirmed');
    expect(alice_tracking?.confirmation_timestamp).toEqual(new Date('2024-03-15T14:15:00Z'));
    expect(alice_tracking?.view_count).toBe(1);

    const carol_tracking = after_alice_confirmation.confirmation_tracking.find(t => t.member_id === 'dev_003');
    expect(carol_tracking).toBeDefined();
    expect(carol_tracking?.confirmation_status).toBe('confirmed');
    expect(carol_tracking?.confirmation_timestamp).toEqual(new Date('2024-03-15T14:45:00Z'));
    expect(carol_tracking?.view_count).toBe(2);

    const bob_tracking = after_alice_confirmation.confirmation_tracking.find(t => t.member_id === 'dev_002');
    expect(bob_tracking?.confirmation_status).toBe('unconfirmed');
    expect(bob_tracking?.confirmation_timestamp).toBeNull();
    expect(bob_tracking?.view_count).toBe(0);

    // 確認率レポート
    const confirmation_rate = (2 / 4) * 100;
    expect(after_alice_confirmation.confirmation_rate_percentage).toBe(50);
    expect(after_alice_confirmation.confirmed_members_count).toBe(2);
    expect(after_alice_confirmation.unconfirmed_members_count).toBe(2);

    // エクスポート形式のレポート検証
    const export_report = after_alice_confirmation.export_tracking_report;
    expect(export_report).toBeDefined();
    expect(export_report?.distribution_id).toBe('dist_001_20240315');
    expect(export_report?.rule_spec_version).toBe('v2.1.0_seasonal_discount');
    expect(export_report?.total_recipients).toBe(4);
    expect(export_report?.total_confirmed).toBe(2);
    expect(export_report?.report_generated_timestamp).toBeDefined();

    // レポートに全メンバーの詳細情報が含まれることを確認
    expect(export_report?.member_details).toHaveLength(4);
    const member_alice_report = export_report?.member_details.find(m => m.member_id === 'dev_001');
    expect(member_alice_report?.member_name).toBe('Alice Dev');
    expect(member_alice_report?.confirmation_status).toBe('confirmed');
    expect(member_alice_report?.confirmation_timestamp).toEqual(new Date('2024-03-15T14:15:00Z'));

    const member_bob_report = export_report?.member_details.find(m => m.member_id === 'dev_002');
    expect(member_bob_report?.confirmation_status).toBe('unconfirmed');
    expect(member_bob_report?.confirmation_timestamp).toBeNull();
  });
});