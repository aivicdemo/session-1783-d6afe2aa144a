import { detectAbnormalReasonAndFlag } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-630: 献立却下・修正理由のカテゴリ分類と異常値検出 - 極端に長い理由テキストが正しく処理される
  test('should flag extremely long reason text (10000+ chars) as abnormal and mark as incomplete data', () => {
    const extremeLongText = 'a'.repeat(10000);
    const input = {
      reasonText: extremeLongText,
      menuId: 'menu_001',
      userId: 'user_123',
      timestamp: new Date('2024-01-15T10:30:00Z')
    };

    const result = detectAbnormalReasonAndFlag(input);

    expect(result.isAbnormal).toBe(true);
    expect(result.abnormalityType).toBe('text_length_exceeded');
    expect(result.maxAllowedLength).toBe(5000);
    expect(result.actualLength).toBe(10000);
    expect(result.flagStatus).toBe('incomplete_data');
    expect(result.warningMessage).toMatch(/入力値が制限を超えています/);
    expect(result.shouldExcludeFromAnalysis).toBe(true);
    expect(result.recordId).toMatch(/abnormal_\d+/);
  });
});