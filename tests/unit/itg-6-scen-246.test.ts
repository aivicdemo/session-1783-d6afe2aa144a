import { analyzeFailurePatterns } from '../../src/logic/it-8-1-1-1';

describe('献立生成失敗パターン分類・影響度分析', () => {
  // SCEN-246
  test('失敗パターンデータが空の場合、分類処理がスキップされ空の分析結果が返される', () => {
    const empty_failure_patterns = [];

    const result = analyzeFailurePatterns(empty_failure_patterns);

    expect(result).toEqual({
      classifications: [],
      impactAnalysis: [],
      summary: {}
    });
    expect(Array.isArray(result.classifications)).toBe(true);
    expect(Array.isArray(result.impactAnalysis)).toBe(true);
    expect(typeof result.summary).toBe('object');
  });
});