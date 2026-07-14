import { describe, test, expect, beforeEach } from '@jest/globals';
import { confirmQuarterlyConferencePreparation } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズムの週次集計・改善効果比較ダッシュボード', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-840
  test('四半期協議会開催日到来時に、参加者リスト・議題テンプレート・期待成果物が自動で確定される', () => {
    const conferenceDate = new Date('2024-02-05T00:00:00Z');
    const currentDate = new Date('2024-02-05T09:00:00Z');
    const confirmedTimestamp = new Date('2024-02-05T09:00:00Z');

    const participants = [
      { participantId: 'p001', name: '田中太郎', role: 'PM' },
      { participantId: 'p002', name: '山田花子', role: '栄養士' },
      { participantId: 'p003', name: '鈴木次郎', role: '開発チームリーダー' }
    ];

    const agendaTemplate = {
      agendaId: 'ag001',
      title: '四半期献立生成アルゴリズム改善レビュー',
      sections: [
        { sectionId: 's001', name: '前期成果報告', estimatedMinutes: 30 },
        { sectionId: 's002', name: '成功・失敗パターン分析', estimatedMinutes: 45 },
        { sectionId: 's003', name: '改善提案検討', estimatedMinutes: 45 }
      ]
    };

    const deliverables = [
      { deliverableId: 'd001', name: '季節パターン優先度ルール仕様書', status: 'pending' },
      { deliverableId: 'd002', name: '割引率閾値更新案', status: 'pending' },
      { deliverableId: 'd003', name: '販売期間キャンペーン案', status: 'pending' }
    ];

    const conference = {
      conferenceId: 'conf_q1_2024',
      conferenceDate,
      currentDate,
      participants,
      agendaTemplate,
      deliverables,
      status: 'scheduled'
    };

    const result = confirmQuarterlyConferencePreparation(conference);

    expect(result.status).toBe('confirmed');
    expect(result.confirmedAt).toEqual(confirmedTimestamp);
    
    expect(result.participants).toHaveLength(3);
    expect(result.participants[0]).toEqual({
      participantId: 'p001',
      name: '田中太郎',
      role: 'PM',
      confirmationStatus: 'confirmed',
      confirmedAt: confirmedTimestamp
    });
    expect(result.participants[1]).toEqual({
      participantId: 'p002',
      name: '山田花子',
      role: '栄養士',
      confirmationStatus: 'confirmed',
      confirmedAt: confirmedTimestamp
    });
    expect(result.participants[2]).toEqual({
      participantId: 'p003',
      name: '鈴木次郎',
      role: '開発チームリーダー',
      confirmationStatus: 'confirmed',
      confirmedAt: confirmedTimestamp
    });

    expect(result.agendaTemplate).toEqual({
      agendaId: 'ag001',
      title: '四半期献立生成アルゴリズム改善レビュー',
      sections: [
        { sectionId: 's001', name: '前期成果報告', estimatedMinutes: 30 },
        { sectionId: 's002', name: '成功・失敗パターン分析', estimatedMinutes: 45 },
        { sectionId: 's003', name: '改善提案検討', estimatedMinutes: 45 }
      ],
      confirmationStatus: 'confirmed',
      confirmedAt: confirmedTimestamp
    });

    expect(result.deliverables).toHaveLength(3);
    expect(result.deliverables[0]).toEqual({
      deliverableId: 'd001',
      name: '季節パターン優先度ルール仕様書',
      status: 'confirmed',
      confirmedAt: confirmedTimestamp
    });
    expect(result.deliverables[1]).toEqual({
      deliverableId: 'd002',
      name: '割引率閾値更新案',
      status: 'confirmed',
      confirmedAt: confirmedTimestamp
    });
    expect(result.deliverables[2]).toEqual({
      deliverableId: 'd003',
      name: '販売期間キャンペーン案',
      status: 'confirmed',
      confirmedAt: confirmedTimestamp
    });

    expect(result.dashboardDisplay).toBe('confirmed');
    expect(result.readyForExecution).toBe(true);
  });
});