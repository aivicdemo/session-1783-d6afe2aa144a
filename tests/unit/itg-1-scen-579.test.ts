import { validateQuarterlyMeetingPreparation } from '../../src/logic/it-1-1-1';

describe('四半期協議会事前準備 - 参加者リスト検証', () => {
  test('SCEN-579: 協議会参加者リストが空の場合、エラーが発生し準備が完了しない', () => {
    // Arrange
    const emptyParticipantList = [];
    const meetingDate = new Date('2024-01-15T09:00:00Z');
    const agendaItems = [
      '季節パターン更新',
      '割引率閾値調整',
      '販売期間定義'
    ];

    // Act & Assert
    expect(() => {
      validateQuarterlyMeetingPreparation({
        participantList: emptyParticipantList,
        meetingDate: meetingDate,
        agendaItems: agendaItems
      });
    }).toThrow(/参加者/);
  });
});