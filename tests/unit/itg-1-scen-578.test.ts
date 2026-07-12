import { determineQuarterlyMeetingPreparation } from '../../src/logic/it-1-1-1';

describe('四半期協議会事前準備 - 開催日到来時の自動確定', () => {
  // SCEN-578
  test('協議会開催日が到来すると、参加者リスト・議題テンプレート・期待成果物が事前に確定される', () => {
    // Setup: 協議会の開催日が現在日時に到達した状況
    const currentDate = new Date('2024-12-16T09:00:00Z');
    const meetingScheduleDate = new Date('2024-12-16T09:00:00Z');
    const quarterlyMeetingConfig = {
      meetingId: 'q4-2024-supplier-meeting',
      scheduledDate: meetingScheduleDate,
      quarterNumber: 4,
      year: 2024,
    };

    // 参加予定者リスト
    const plannedParticipants = [
      { userId: 'pm-001', name: '田中太郎', role: 'Product Manager', department: 'Product' },
      { userId: 'dev-001', name: '佐藤花子', role: 'Lead Developer', department: 'Engineering' },
      { userId: 'nutrition-001', name: '鈴木栄養士', role: 'Nutritionist', department: 'Quality' },
      { userId: 'supplier-001', name: '流通業者代表', role: 'Supplier Representative', department: 'External' },
    ];

    // 期待される議題テンプレート
    const expectedAgendaItems = [
      { itemId: 'agenda-1', title: '季節パターンの確認と更新', estimatedMinutes: 30, order: 1 },
      { itemId: 'agenda-2', title: '割引率閾値と販売期間の見直し', estimatedMinutes: 25, order: 2 },
      { itemId: 'agenda-3', title: '旬の食材リストの更新', estimatedMinutes: 20, order: 3 },
      { itemId: 'agenda-4', title: '次四半期の優先度ルール仕様決定', estimatedMinutes: 25, order: 4 },
    ];

    // 期待される成果物リスト
    const expectedDeliverables = [
      { deliverableId: 'del-1', name: 'ルール仕様書（季節パターン・割引率・販売期間）', format: 'PDF', status: 'pending' },
      { deliverableId: 'del-2', name: '旬の食材リスト（次四半期対象）', format: 'Excel', status: 'pending' },
      { deliverableId: 'del-3', name: '優先度ルール承認フロー開始通知', format: 'Email', status: 'pending' },
    ];

    // Act: 協議会開催日判定と自動確定処理を実行
    const result = determineQuarterlyMeetingPreparation({
      currentDate,
      quarterlyMeetingConfig,
      plannedParticipants,
      expectedAgendaItems,
      expectedDeliverables,
    });

    // Assert: 開催日到来による自動確定
    expect(result.isReadyForMeeting).toBe(true);
    expect(result.meetingStatus).toBe('confirmed');
    expect(result.confirmationTimestamp).toEqual(currentDate);

    // Assert: 参加者リストが確定状態で出力
    expect(result.confirmedParticipants).toEqual(plannedParticipants);
    expect(result.participantsLocked).toBe(true);
    expect(result.participantCount).toBe(4);

    // Assert: 議題テンプレートが確定状態で生成・出力
    expect(result.confirmedAgenda).toEqual(expectedAgendaItems);
    expect(result.agendaLocked).toBe(true);
    expect(result.totalAgendaMinutes).toBe(100); // 30 + 25 + 20 + 25

    // Assert: 期待成果物リストが確定状態で生成・出力
    expect(result.confirmedDeliverables).toEqual(expectedDeliverables);
    expect(result.deliverablesLocked).toBe(true);
    expect(result.deliverableCount).toBe(3);

    // Assert: 各項目が編集不可の確定状態
    expect(result.isEditable).toBe(false);
    expect(result.editableFields).toEqual({
      participants: false,
      agenda: false,
      deliverables: false,
    });

    // Assert: 協議会準備状態の総合判定
    expect(result.preparationStatus).toBe('fully_prepared');
    expect(result.readyToStart).toBe(true);
  });
});