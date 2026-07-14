import { validateSegmentBehaviorIndicators } from '../../src/logic/it-7-2-1';

describe('献立生成アルゴリズムの成功率・調理時間短縮度・ユーザー満足度スコアなどの行動指標を週次で自動集計し、アルゴリズム改善前後の効果差を定量比較するダッシュボード機能', () => {
  // SCEN-947: [error] セグメント別行動指標統計有意性判定 - 調理時間短縮度が負の値を含む異常データの場合、エラーを返す
  test('調理時間短縮度が負の値を含む異常データが検出され、適切なエラー例外がスローされること', () => {
    const segmentId = 'segment-001';
    const weekStartDate = new Date('2024-01-08T00:00:00Z');
    const weekEndDate = new Date('2024-01-14T23:59:59Z');
    
    const behaviorIndicatorsWithNegativeCookingTime = {
      segmentId,
      weekStartDate,
      weekEndDate,
      successRate: 0.85,
      cookingTimeReductionDegree: -15.5,
      userSatisfactionScore: 4.2
    };

    expect(() => {
      validateSegmentBehaviorIndicators(behaviorIndicatorsWithNegativeCookingTime);
    }).toThrow(/調理時間短縮度/);
  });
});