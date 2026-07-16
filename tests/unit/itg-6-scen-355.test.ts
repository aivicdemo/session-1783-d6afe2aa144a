import { defineSegmentationCriteria } from '../../src/logic/it-1-br-8-2-1-1';

describe('ユーザーセグメント別の利用パターン分析ダッシュボード', () => {
  test('SCEN-355: 専業主夫層セグメント分類基準定義 - 年代・家族構成・食事制限条件の3軸でセグメント分類基準が確定する', () => {
    // 入力: 年代フィルタ（複数年代区分）
    const ageRanges = ['30s', '40s', '50s'];

    // 入力: 家族構成フィルタ（複数の家族構成パターン）
    const familyPatterns = ['oneChild', 'twoOrMoreChildren', 'parentalCohabitation'];

    // 入力: 食事制限条件フィルタ（複数の制限条件）
    const dietaryRestrictions = ['allergyHandling', 'religiousRestriction', 'healthFocused'];

    // 実行: セグメント分類基準を定義
    const result = defineSegmentationCriteria({
      ageRanges,
      familyPatterns,
      dietaryRestrictions,
    });

    // 検証: セグメント分類基準が正常に確定されている
    expect(result).toBeDefined();
    expect(result.status).toBe('confirmed');

    // 検証: 年代・家族構成・食事制限条件の3軸すべての条件組み合わせが生成されている
    // 期待される組み合わせ数: 3 (年代) × 3 (家族構成) × 3 (食事制限) = 27
    expect(result.segmentDefinitions).toHaveLength(27);

    // 検証: 各セグメント区分が一意に識別可能
    const segmentIds = result.segmentDefinitions.map((seg) => seg.segmentId);
    const uniqueSegmentIds = new Set(segmentIds);
    expect(uniqueSegmentIds.size).toBe(27);

    // 検証: 各セグメント定義に必須フィールドが含まれている
    result.segmentDefinitions.forEach((segment) => {
      expect(segment.segmentId).toBeDefined();
      expect(segment.segmentId).toMatch(/^seg_/);
      expect(segment.ageRange).toBeDefined();
      expect(['30s', '40s', '50s']).toContain(segment.ageRange);
      expect(segment.familyPattern).toBeDefined();
      expect([
        'oneChild',
        'twoOrMoreChildren',
        'parentalCohabitation',
      ]).toContain(segment.familyPattern);
      expect(segment.dietaryRestriction).toBeDefined();
      expect([
        'allergyHandling',
        'religiousRestriction',
        'healthFocused',
      ]).toContain(segment.dietaryRestriction);
    });

    // 検証: セグメント分類基準がシステムに正常に保存されている
    expect(result.savedAt).toBeDefined();
    expect(result.savedAt).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
    );

    // 検証: メッセージが「確定」完了を示している
    expect(result.message).toMatch(/確定/);

    // 検証: 各セグメントが以降の分析で参照可能な状態
    expect(result.isReadyForAnalysis).toBe(true);

    // 具体例検証: 特定の組み合わせが正しく生成されているか確認
    const specificSegment = result.segmentDefinitions.find(
      (seg) =>
        seg.ageRange === '30s' &&
        seg.familyPattern === 'oneChild' &&
        seg.dietaryRestriction === 'allergyHandling',
    );
    expect(specificSegment).toBeDefined();
    expect(specificSegment!.segmentId).toMatch(/^seg_/);
  });
});