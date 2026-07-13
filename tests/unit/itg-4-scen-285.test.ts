import { describe, test, expect } from '@jest/globals';
import { validatePriorityMatrixImpact } from '../../src/logic/it-3-br-6-3-3';

describe('予測精度低下要因の可視化ダッシュボード', () => {
  // SCEN-285
  test('外部要因変数の優先度マトリクス配置 - 影響度が負の値または範囲外の値が入力された場合にバリデーションエラーが発生する', () => {
    // 負の値入力時のバリデーションエラー
    expect(() => {
      validatePriorityMatrixImpact({
        impact: -5,
        implementationDifficulty: 50,
        externalFactorName: 'weather_pattern'
      });
    }).toThrow(/影響度/);

    // 範囲外の値（100超過）入力時のバリデーションエラー
    expect(() => {
      validatePriorityMatrixImpact({
        impact: 150,
        implementationDifficulty: 50,
        externalFactorName: 'event_type'
      });
    }).toThrow(/影響度/);

    // null入力時のバリデーションエラー
    expect(() => {
      validatePriorityMatrixImpact({
        impact: null as any,
        implementationDifficulty: 50,
        externalFactorName: 'competitor_strategy'
      });
    }).toThrow(/影響度/);

    // undefined入力時のバリデーションエラー
    expect(() => {
      validatePriorityMatrixImpact({
        impact: undefined as any,
        implementationDifficulty: 50,
        externalFactorName: 'weather_pattern'
      });
    }).toThrow(/影響度/);

    // 文字列入力時のバリデーションエラー
    expect(() => {
      validatePriorityMatrixImpact({
        impact: 'abc' as any,
        implementationDifficulty: 50,
        externalFactorName: 'event_type'
      });
    }).toThrow(/影響度/);

    // 有効な値（0）での正常系
    const result_min = validatePriorityMatrixImpact({
      impact: 0,
      implementationDifficulty: 50,
      externalFactorName: 'weather_pattern'
    });
    expect(result_min).toEqual({
      isValid: true,
      impact: 0,
      implementationDifficulty: 50,
      externalFactorName: 'weather_pattern',
      priorityQuadrant: 'low_priority'
    });

    // 有効な値（50）での正常系
    const result_mid = validatePriorityMatrixImpact({
      impact: 50,
      implementationDifficulty: 50,
      externalFactorName: 'event_type'
    });
    expect(result_mid).toEqual({
      isValid: true,
      impact: 50,
      implementationDifficulty: 50,
      externalFactorName: 'event_type',
      priorityQuadrant: 'medium_priority'
    });

    // 有効な値（100）での正常系
    const result_max = validatePriorityMatrixImpact({
      impact: 100,
      implementationDifficulty: 25,
      externalFactorName: 'competitor_strategy'
    });
    expect(result_max).toEqual({
      isValid: true,
      impact: 100,
      implementationDifficulty: 25,
      externalFactorName: 'competitor_strategy',
      priorityQuadrant: 'high_priority'
    });
  });
});