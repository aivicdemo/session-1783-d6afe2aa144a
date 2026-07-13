import { generateQuarterlyCouncilPreparation } from '../../src/logic/it-1-br-6-2-1-1';

const fetchMock = require('jest-fetch-mock');

describe('Quarterly Council Preparation Auto-Generation', () => {
  // SCEN-493: [normal] 四半期協議会事前準備自動生成機能 - 協議会開催日到来時に、参加者リスト・議題テンプレート・期待成果物が事前に確定される
  test('should auto-generate council preparation documents when council date arrives', async () => {
    fetchMock.resetMocks();

    const council_date = new Date('2024-03-31T00:00:00Z');
    const current_date = new Date('2024-03-31T09:00:00Z');

    const participants_list = [
      { member_id: 'PM001', name: 'Product Manager A', role: '進行役' },
      { member_id: 'VENDOR001', name: 'Distributor A', role: 'ベンダー代表' },
      { member_id: 'SUPER001', name: 'Supermarket B', role: 'スーパー代表' },
    ];

    const agenda_template = {
      title: 'Q2 2024 季節パターン・割引率・販売期間協議会',
      date: '2024-03-31',
      duration_minutes: 120,
      sections: [
        { section_id: 'AGD_001', title: '前四半期結果レビュー', time_minutes: 20 },
        { section_id: 'AGD_002', title: '季節パターン更新協議', time_minutes: 40 },
        { section_id: 'AGD_003', title: '割引率閾値決定', time_minutes: 30 },
        { section_id: 'AGD_004', title: '販売期間設定', time_minutes: 30 },
      ],
    };

    const expected_deliverables = {
      doc_type: 'RULE_SPEC',
      doc_name: 'ルール仕様書 Q2 2024',
      required_sections: [
        'seasonal_pattern_definition',
        'discount_rate_threshold',
        'sales_period_config',
      ],
      status: '未作成',
    };

    fetchMock.mockResponseOnce(
      JSON.stringify({
        participants: participants_list,
        agenda: agenda_template,
        deliverables: expected_deliverables,
      }),
      { status: 200 }
    );

    const result = await generateQuarterlyCouncilPreparation({
      council_date: council_date.toISOString(),
      current_date: current_date.toISOString(),
      user_id: 'USER_PM_001',
    });

    expect(result).toBeDefined();
    expect(result.participants).toHaveLength(3);
    expect(result.participants[0]).toEqual({
      member_id: 'PM001',
      name: 'Product Manager A',
      role: '進行役',
    });
    expect(result.participants[1]).toEqual({
      member_id: 'VENDOR001',
      name: 'Distributor A',
      role: 'ベンダー代表',
    });
    expect(result.participants[2]).toEqual({
      member_id: 'SUPER001',
      name: 'Supermarket B',
      role: 'スーパー代表',
    });

    expect(result.agenda).toBeDefined();
    expect(result.agenda.title).toBe('Q2 2024 季節パターン・割引率・販売期間協議会');
    expect(result.agenda.date).toBe('2024-03-31');
    expect(result.agenda.duration_minutes).toBe(120);
    expect(result.agenda.sections).toHaveLength(4);
    expect(result.agenda.sections[0]).toEqual({
      section_id: 'AGD_001',
      title: '前四半期結果レビュー',
      time_minutes: 20,
    });
    expect(result.agenda.sections[1]).toEqual({
      section_id: 'AGD_002',
      title: '季節パターン更新協議',
      time_minutes: 40,
    });
    expect(result.agenda.sections[2]).toEqual({
      section_id: 'AGD_003',
      title: '割引率閾値決定',
      time_minutes: 30,
    });
    expect(result.agenda.sections[3]).toEqual({
      section_id: 'AGD_004',
      title: '販売期間設定',
      time_minutes: 30,
    });

    expect(result.deliverables).toBeDefined();
    expect(result.deliverables.doc_type).toBe('RULE_SPEC');
    expect(result.deliverables.doc_name).toBe('ルール仕様書 Q2 2024');
    expect(result.deliverables.required_sections).toHaveLength(3);
    expect(result.deliverables.required_sections).toContain('seasonal_pattern_definition');
    expect(result.deliverables.required_sections).toContain('discount_rate_threshold');
    expect(result.deliverables.required_sections).toContain('sales_period_config');
    expect(result.deliverables.status).toBe('未作成');

    expect(result.preparation_status).toBe('確定');
    expect(result.document_display_status).toBe('協議会管理画面に表示');
    expect(result.notification_status).toBe('参加者に通知完了');
    expect(result.generated_at).toBeDefined();

    const calls = fetchMock.mock.calls;
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toContain('quarterly-council');
    expect(calls[0][1].method).toBe('POST');
  });
});