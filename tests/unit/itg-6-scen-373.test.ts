import { analyzeSegmentDifferentiationPriority } from '../../src/logic/it-1-br-8-2-1-1';

describe('セグメント別最大差別化効果優先度付け', () => {
  // SCEN-373
  test('セグメント別集計データが不完全な場合、エラーメッセージが返却される', () => {
    const incompleteSegmentData = {
      segmentId: 'segment_001',
      generationSuccessRate: 85.5,
      // cookingTimeReductionRate フィールドが欠落
      userSatisfactionScore: 4.2,
      segmentSize: 120,
      differentiationImpact: 'high'
    };

    expect(() => analyzeSegmentDifferentiationPriority(incompleteSegmentData)).toThrow(/必須フィールド/);
  });

  test('セグメント別集計データが空オブジェクトの場合、エラーメッセージが返却される', () => {
    const emptySegmentData = {};

    expect(() => analyzeSegmentDifferentiationPriority(emptySegmentData)).toThrow(/データ妥当性/);
  });

  test('セグメント別集計データにnullが含まれる場合、エラーメッセージが返却される', () => {
    const segmentDataWithNull = {
      segmentId: 'segment_002',
      generationSuccessRate: null,
      cookingTimeReductionRate: 12.3,
      userSatisfactionScore: 4.1,
      segmentSize: 95,
      differentiationImpact: 'medium'
    };

    expect(() => analyzeSegmentDifferentiationPriority(segmentDataWithNull)).toThrow(/無効な値/);
  });

  test('セグメント別集計データに無効な数値が含まれる場合、エラーメッセージが返却される', () => {
    const segmentDataWithInvalidNumber = {
      segmentId: 'segment_003',
      generationSuccessRate: 'invalid',
      cookingTimeReductionRate: 15.5,
      userSatisfactionScore: 4.3,
      segmentSize: 110,
      differentiationImpact: 'high'
    };

    expect(() => analyzeSegmentDifferentiationPriority(segmentDataWithInvalidNumber)).toThrow(/型不正/);
  });

  test('セグメント別集計データが有効な場合、優先度付けが成功する', () => {
    const completeSegmentData = {
      segmentId: 'segment_004',
      generationSuccessRate: 88.2,
      cookingTimeReductionRate: 18.5,
      userSatisfactionScore: 4.5,
      segmentSize: 150,
      differentiationImpact: 'high'
    };

    const result = analyzeSegmentDifferentiationPriority(completeSegmentData);

    expect(result).toHaveProperty('segmentId');
    expect(result).toHaveProperty('priorityScore');
    expect(result).toHaveProperty('priorityRank');
    expect(result.priorityScore).toBeGreaterThan(0);
    expect(['high', 'medium', 'low']).toContain(result.priorityRank);
  });

  test('複数セグメントデータで一つだけ不完全な場合、該当セグメントのエラーが返却される', () => {
    const incompleteSegmentInBatch = {
      segmentId: 'segment_005',
      generationSuccessRate: 82.0,
      // cookingTimeReductionRate 欠落
      userSatisfactionScore: 3.9,
      segmentSize: 85
    };

    expect(() => analyzeSegmentDifferentiationPriority(incompleteSegmentInBatch)).toThrow(/必須フィールド/);
  });
});