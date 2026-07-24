import { aggregateWeeklyMetrics } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズムの週次改善効果集計', () => {
  test('SCEN-842: 四半期協議会事前準備 - 協議会開催日前日に準備が確定した場合、当日までに全準備情報が整備される', () => {
    // Setup: テストデータ - 協議会開催日を2024年1月15日に設定
    const conferenceDate = new Date('2024-01-15T09:00:00Z');
    const confirmationDate = new Date('2024-01-14T18:00:00Z'); // 前日に準備確定
    const accessDate = new Date('2024-01-15T09:00:00Z'); // 当日アクセス
    
    // 協議会準備情報の入力データ
    const preparationInput = {
      conferenceScheduledDate: conferenceDate,
      preparationConfirmedDate: confirmationDate,
      preparationConfirmed: true,
      agendaItems: [
        { id: 'agenda-001', title: '季節パターン更新の提案', status: 'pending' },
        { id: 'agenda-002', title: '割引率閾値の見直し', status: 'pending' },
        { id: 'agenda-003', title: '販売期間ルールの確認', status: 'pending' }
      ],
      materials: [
        { id: 'mat-001', title: '前四半期実績レポート', status: 'pending' },
        { id: 'mat-002', title: '競合分析資料', status: 'pending' }
      ],
      participants: [
        { id: 'p-001', name: '食材流通業者A', role: 'vendor', status: 'pending' },
        { id: 'p-002', name: 'PM太郎', role: 'pm', status: 'pending' },
        { id: 'p-003', name: '開発チームリード', role: 'tech_lead', status: 'pending' }
      ],
      arrangementMap: {
        roomName: '会議室B',
        capacity: 15,
        seatingArrangement: 'pending'
      },
      processingTimestamp: confirmationDate
    };

    // 当日アクセス時の検証用パラメータ
    const accessCheckParams = {
      accessTimestamp: accessDate,
      conferenceDate: conferenceDate
    };

    // 実行: 準備情報の整備処理をトリガー
    const result = aggregateWeeklyMetrics(preparationInput, accessCheckParams);

    // 検証1: 準備情報の各項目が全て生成されているか確認
    expect(result.preparationStatus).toEqual({
      agendaGenerated: true,
      agendaCount: 3,
      materialsGenerated: true,
      materialCount: 2,
      participantsListGenerated: true,
      participantCount: 3,
      arrangementMapGenerated: true
    });

    // 検証2: 各準備情報のステータスが「完了」になっているか
    expect(result.itemStatuses).toEqual({
      agendaStatus: 'completed',
      materialsStatus: 'completed',
      participantsStatus: 'completed',
      arrangementStatus: 'completed',
      overallStatus: 'completed'
    });

    // 検証3: 準備情報の整備完了日時が協議会開催日の前日以前であることを確認
    const completionTime = new Date(result.preparationCompletedAt);
    const dayBeforeConference = new Date('2024-01-14T23:59:59Z');
    expect(completionTime.getTime()).toBeLessThanOrEqual(dayBeforeConference.getTime());

    // 検証4: 協議会開催当日に全ての準備情報にアクセス可能であることを確認
    expect(result.accessibleOnConferenceDay).toBe(true);
    expect(result.accessibilityCheck).toEqual({
      agendaAccessible: true,
      materialsAccessible: true,
      participantsListAccessible: true,
      arrangementMapAccessible: true,
      allItemsAccessible: true
    });

    // 検証5: アクセス時刻が協議会開催日以降かつ準備完了時刻以降であることを確認
    const accessTime = new Date(result.latestAccessTime);
    expect(accessTime.getTime()).toBeGreaterThanOrEqual(completionTime.getTime());
    expect(accessTime.getTime()).toBeGreaterThanOrEqual(conferenceDate.getTime());

    // 検証6: 準備整備に関するログが正常に記録されているか確認
    expect(result.preparationLog).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          timestamp: expect.any(String),
          eventType: 'preparation_confirmed',
          details: 'Preparation confirmed on 2024-01-14'
        }),
        expect.objectContaining({
          timestamp: expect.any(String),
          eventType: 'agenda_generated',
          itemCount: 3
        }),
        expect.objectContaining({
          timestamp: expect.any(String),
          eventType: 'materials_generated',
          itemCount: 2
        }),
        expect.objectContaining({
          timestamp: expect.any(String),
          eventType: 'participants_list_generated',
          itemCount: 3
        }),
        expect.objectContaining({
          timestamp: expect.any(String),
          eventType: 'arrangement_map_generated',
          roomName: '会議室B'
        }),
        expect.objectContaining({
          timestamp: expect.any(String),
          eventType: 'preparation_complete',
          status: 'success'
        })
      ])
    );

    // 検証7: ログ記録の時系列順序が正しいか確認
    const logs = result.preparationLog;
    for (let i = 1; i < logs.length; i++) {
      const prevTime = new Date(logs[i - 1].timestamp).getTime();
      const currTime = new Date(logs[i].timestamp).getTime();
      expect(currTime).toBeGreaterThanOrEqual(prevTime);
    }

    // 検証8: 準備完了から協議会開催までのリードタイムが24時間以上であることを確認
    const leadTimeMs = conferenceDate.getTime() - completionTime.getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    expect(leadTimeMs).toBeGreaterThanOrEqual(oneDay);

    // 検証9: 全ての準備項目の整備タイムスタンプが協議会開催前日内であることを確認
    expect(new Date(result.agendaGeneratedAt).getTime()).toBeLessThanOrEqual(new Date('2024-01-14T23:59:59Z').getTime());
    expect(new Date(result.materialsGeneratedAt).getTime()).toBeLessThanOrEqual(new Date('2024-01-14T23:59:59Z').getTime());
    expect(new Date(result.participantsListGeneratedAt).getTime()).toBeLessThanOrEqual(new Date('2024-01-14T23:59:59Z').getTime());
    expect(new Date(result.arrangementMapGeneratedAt).getTime()).toBeLessThanOrEqual(new Date('2024-01-14T23:59:59Z').getTime());

    // 検証10: 当日ダッシュボード表示用のメタデータが正しく生成されているか
    expect(result.dashboardMetadata).toEqual({
      conferenceDate: '2024-01-15T09:00:00Z',
      preparationReadiness: 'ready',
      allItemsReady: true,
      readinessPercentage: 100,
      lastUpdatedAt: expect.any(String),
      displayableOnConferenceDay: true
    });
  });
});