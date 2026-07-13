import { placeVariableInPriorityMatrix } from '../../src/logic/it-3-br-6-3-3';

describe('予測精度低下要因の可視化ダッシュボード', () => {
  // SCEN-283
  test('外部要因変数の優先度マトリクス配置 - 影響度と実装難度が共に中程度の変数を正常にマトリクスの中央象限に配置される', () => {
    const inputVariable = {
      variableId: 'EXT_VAR_001',
      variableName: '天候パターン',
      impactScore: 5,
      implementationDifficultyScore: 5,
    };

    const result = placeVariableInPriorityMatrix(inputVariable);

    expect(result.variableId).toBe('EXT_VAR_001');
    expect(result.variableName).toBe('天候パターン');
    expect(result.matrixPosition.xAxis).toBe(5);
    expect(result.matrixPosition.yAxis).toBe(5);
    expect(result.matrixPosition.xAxis).toBeGreaterThanOrEqual(4.5);
    expect(result.matrixPosition.xAxis).toBeLessThanOrEqual(5.5);
    expect(result.matrixPosition.yAxis).toBeGreaterThanOrEqual(4.5);
    expect(result.matrixPosition.yAxis).toBeLessThanOrEqual(5.5);
    expect(result.quadrant).toBe('center');
    expect(result.visualDisplay).toBeDefined();
    expect(result.visualDisplay.color).toBe('#FFD700');
    expect(result.visualDisplay.label).toBe('天候パターン');
  });
});