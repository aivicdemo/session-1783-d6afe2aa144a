import { defineSegmentationCriteria } from '../../src/logic/it-7-2-1';

describe('ユーザーセグメント分類基準定義機能', () => {
  // SCEN-924
  test('年代・家族構成・食事制限条件の3軸でセグメント分類基準が正しく確定される', () => {
    // Arrange: セグメント分類基準の入力データを準備
    const ageBrackets = ['20代', '30代', '40代以上'];
    const familyStructures = ['単身', '2人家族', '3人以上'];
    const dietaryRestrictions = ['制限なし', 'ベジタリアン', 'アレルギー対応'];

    const inputCriteria = {
      ageBrackets,
      familyStructures,
      dietaryRestrictions,
    };

    // Act: セグメント分類基準を定義・確定
    const result = defineSegmentationCriteria(inputCriteria);

    // Assert: 基準定義が正しく確定されることを検証
    expect(result).toEqual({
      ageBrackets: ['20代', '30代', '40代以上'],
      familyStructures: ['単身', '2人家族', '3人以上'],
      dietaryRestrictions: ['制限なし', 'ベジタリアン', 'アレルギー対応'],
      totalSegmentPatterns: 27, // 3×3×3
      status: 'confirmed',
    });

    // Assert: 各軸の要素数が正しい
    expect(result.ageBrackets.length).toBe(3);
    expect(result.familyStructures.length).toBe(3);
    expect(result.dietaryRestrictions.length).toBe(3);

    // Assert: セグメント分類パターン数が正しく計算される
    expect(result.totalSegmentPatterns).toBe(27);

    // Assert: 基準確定ステータスが正しく設定される
    expect(result.status).toBe('confirmed');

    // Assert: 各軸のセグメント値が正しく保存される
    expect(result.ageBrackets).toContain('20代');
    expect(result.ageBrackets).toContain('30代');
    expect(result.ageBrackets).toContain('40代以上');

    expect(result.familyStructures).toContain('単身');
    expect(result.familyStructures).toContain('2人家族');
    expect(result.familyStructures).toContain('3人以上');

    expect(result.dietaryRestrictions).toContain('制限なし');
    expect(result.dietaryRestrictions).toContain('ベジタリアン');
    expect(result.dietaryRestrictions).toContain('アレルギー対応');
  });

  test('セグメント分類基準に無効な値が含まれる場合はエラーを発生させる', () => {
    const invalidCriteria = {
      ageBrackets: ['20代', '30代'], // 3個ではなく2個
      familyStructures: ['単身', '2人家族', '3人以上'],
      dietaryRestrictions: ['制限なし', 'ベジタリアン', 'アレルギー対応'],
    };

    // Assert: 必須の軸の個数が不足する場合はエラーを発生
    expect(() => defineSegmentationCriteria(invalidCriteria)).toThrow(/軸の個数/);
  });

  test('空の分類基準が渡された場合はエラーを発生させる', () => {
    const emptyCriteria = {
      ageBrackets: [],
      familyStructures: [],
      dietaryRestrictions: [],
    };

    // Assert: 空の基準データではエラーを発生
    expect(() => defineSegmentationCriteria(emptyCriteria)).toThrow(/分類基準/);
  });

  test('重複する分類基準値が含まれる場合はエラーを発生させる', () => {
    const duplicateCriteria = {
      ageBrackets: ['20代', '30代', '20代'], // 重複
      familyStructures: ['単身', '2人家族', '3人以上'],
      dietaryRestrictions: ['制限なし', 'ベジタリアン', 'アレルギー対応'],
    };

    // Assert: 重複する値を検出してエラーを発生
    expect(() => defineSegmentationCriteria(duplicateCriteria)).toThrow(/重複/);
  });

  test('セグメント分類基準が保存される際にタイムスタンプが記録される', () => {
    const ageBrackets = ['20代', '30代', '40代以上'];
    const familyStructures = ['単身', '2人家族', '3人以上'];
    const dietaryRestrictions = ['制限なし', 'ベジタリアン', 'アレルギー対応'];

    const inputCriteria = {
      ageBrackets,
      familyStructures,
      dietaryRestrictions,
    };

    const beforeTime = new Date('2024-01-15T11:00:00Z');
    const result = defineSegmentationCriteria(inputCriteria);
    const afterTime = new Date('2024-01-15T11:00:01Z');

    // Assert: タイムスタンプが記録されている
    expect(result).toHaveProperty('confirmedAt');
    expect(typeof result.confirmedAt).toBe('string');

    // Assert: 基準確定時刻が妥当な範囲内にある
    const confirmedTime = new Date(result.confirmedAt);
    expect(confirmedTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
    expect(confirmedTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
  });
});