import { calculateAlgorithmImprovementDegree } from '../../src/logic/it-8-1-1-1';

describe('アルゴリズム改善効果比較機能 - マイナス改善度の処理', () => {
  // SCEN-262
  test('改善度がマイナス値（性能低下）の場合も正常に数値比較される', () => {
    // テストデータ設定
    const beforeScore = 100;
    const afterScore = 80;
    const expectedImprovementDegree = -20;
    const performanceDeteriorationThreshold = 0;

    // 改善度を計算
    const actualImprovementDegree = calculateAlgorithmImprovementDegree({
      beforeScore,
      afterScore,
    });

    // 改善度がマイナス値（-20）であることを確認
    expect(actualImprovementDegree).toBe(expectedImprovementDegree);

    // マイナス値の改善度に対して数値比較処理を実行
    const isPerformanceDeteriorated = actualImprovementDegree < performanceDeteriorationThreshold;

    // 比較結果が正常に処理され、性能低下を示す負の数値として正確に扱われることを確認
    expect(isPerformanceDeteriorated).toBe(true);

    // 改善度がマイナス値の場合のUI表示形式が適切に処理されることを確認
    const displayFormat = actualImprovementDegree < 0 ? `性能低下: ${Math.abs(actualImprovementDegree)}%` : `改善度: ${actualImprovementDegree}%`;
    expect(displayFormat).toBe('性能低下: 20%');

    // システムがエラーを発生させずに期待通りに動作することを確認
    const comparisonResults = {
      improvementDegree: actualImprovementDegree,
      isNegative: actualImprovementDegree < 0,
      absoluteValue: Math.abs(actualImprovementDegree),
      displayStatus: actualImprovementDegree < 0 ? 'deterioration' : 'improvement',
    };

    expect(comparisonResults.improvementDegree).toBe(-20);
    expect(comparisonResults.isNegative).toBe(true);
    expect(comparisonResults.absoluteValue).toBe(20);
    expect(comparisonResults.displayStatus).toBe('deterioration');
  });
});