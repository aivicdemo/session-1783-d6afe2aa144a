import { validateUserFeedbackMinimumSampleSize } from '../../src/logic/it-8-1-1-1';

describe('ユーザーインタビュー記録と利用ログから食材制限・調理時間制限・予算制約の発生頻度と影響度を自動抽出・分類し、優先度マトリクスを生成・可視化する機能', () => {
  // SCEN-205: [edge] ユーザーフィードバック最小サンプル数判定機能 - フィードバック数が境界値（最小要件数）ちょうどの場合、改善課題リスト作成フェーズへの遷移判定が正確に行われる
  test('フィードバック数が最小要件数と完全に一致する場合、遷移判定が成功する', () => {
    const MIN_REQUIRED_FEEDBACK_COUNT = 5;

    const feedbackData = [
      {
        id: 'fb_001',
        userId: 'user_a001',
        category: '食材制限',
        content: '子どもが牛乳アレルギーなので、代替案が欲しい',
        frequency: 1,
        impactDegree: 8,
        recordedAt: '2024-01-10T10:00:00Z',
      },
      {
        id: 'fb_002',
        userId: 'user_a002',
        category: '調理時間制限',
        content: '平日は15分以内に完成する献立が必須',
        frequency: 5,
        impactDegree: 9,
        recordedAt: '2024-01-10T11:30:00Z',
      },
      {
        id: 'fb_003',
        userId: 'user_a003',
        category: '予算制約',
        content: '1食あたり300円以下に抑えたい',
        frequency: 3,
        impactDegree: 7,
        recordedAt: '2024-01-10T13:00:00Z',
      },
      {
        id: 'fb_004',
        userId: 'user_a004',
        category: '食材制限',
        content: '妻が糖質制限食を要望',
        frequency: 2,
        impactDegree: 6,
        recordedAt: '2024-01-10T14:15:00Z',
      },
      {
        id: 'fb_005',
        userId: 'user_a005',
        category: '調理時間制限',
        content: '土日でも30分以上かかる献立は避けたい',
        frequency: 1,
        impactDegree: 5,
        recordedAt: '2024-01-10T15:45:00Z',
      },
    ];

    const result = validateUserFeedbackMinimumSampleSize({
      feedbackItems: feedbackData,
      minimumRequiredCount: MIN_REQUIRED_FEEDBACK_COUNT,
      currentPhase: 'フィードバック集約',
      currentProcessStep: 'フィードバック最小要件判定',
    });

    expect(result.isRequirementMet).toBe(true);
    expect(result.feedbackCount).toBe(5);
    expect(result.minimumRequiredCount).toBe(5);
    expect(result.judgmentResult).toBe('要件満たす');
    expect(result.canTransitionToNextPhase).toBe(true);
    expect(result.transitionFlag).toBe(true);
    expect(result.transitionStatus).toBe('Active');
    expect(result.nextPhase).toBe('改善課題リスト作成');
    expect(result.previousPhase).toBe('フィードバック集約');
    expect(result.systemPhaseUpdated).toBe(true);
    expect(result.systemProcessStepUpdated).toBe(true);
    expect(result.updatedPhase).toBe('改善課題リスト作成');
    expect(result.updatedProcessStep).toBe('重複排除・統合準備');
    expect(result.transitionEventRecorded).toBe(true);
    expect(result.transitionEventType).toBe('PhaseTransition');
    expect(result.transitionEventTimestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    expect(result.systemLogEntry).toMatch(/フェーズ遷移/);
    expect(result.systemLogEntry).toMatch(/改善課題リスト作成/);

    const feedbackSummary = result.feedbackSummaryByCategory;
    expect(feedbackSummary['食材制限']).toBe(2);
    expect(feedbackSummary['調理時間制限']).toBe(2);
    expect(feedbackSummary['予算制約']).toBe(1);
    expect(Object.keys(feedbackSummary).length).toBe(3);

    expect(result.avgImpactDegree).toBe(7);
    expect(result.maxImpactDegree).toBe(9);
    expect(result.minImpactDegree).toBe(5);
  });

  test('フィードバック数が最小要件数未満の場合、遷移判定が失敗する', () => {
    const MIN_REQUIRED_FEEDBACK_COUNT = 5;

    const feedbackData = [
      {
        id: 'fb_001',
        userId: 'user_b001',
        category: '食材制限',
        content: '子どもが卵アレルギー',
        frequency: 1,
        impactDegree: 8,
        recordedAt: '2024-01-11T10:00:00Z',
      },
      {
        id: 'fb_002',
        userId: 'user_b002',
        category: '調理時間制限',
        content: '20分以内に完成させたい',
        frequency: 4,
        impactDegree: 9,
        recordedAt: '2024-01-11T11:00:00Z',
      },
      {
        id: 'fb_003',
        userId: 'user_b003',
        category: '予算制約',
        content: '1食200円以下',
        frequency: 2,
        impactDegree: 7,
        recordedAt: '2024-01-11T12:00:00Z',
      },
      {
        id: 'fb_004',
        userId: 'user_b004',
        category: '調理時間制限',
        content: '25分目安',
        frequency: 1,
        impactDegree: 6,
        recordedAt: '2024-01-11T13:00:00Z',
      },
    ];

    const result = validateUserFeedbackMinimumSampleSize({
      feedbackItems: feedbackData,
      minimumRequiredCount: MIN_REQUIRED_FEEDBACK_COUNT,
      currentPhase: 'フィードバック集約',
      currentProcessStep: 'フィードバック最小要件判定',
    });

    expect(result.isRequirementMet).toBe(false);
    expect(result.feedbackCount).toBe(4);
    expect(result.minimumRequiredCount).toBe(5);
    expect(result.judgmentResult).toBe('要件未満');
    expect(result.canTransitionToNextPhase).toBe(false);
    expect(result.transitionFlag).toBe(false);
    expect(result.transitionStatus).toBe('Inactive');
    expect(result.nextPhase).toBe('改善課題リスト作成');
    expect(result.previousPhase).toBe('フィードバック集約');
    expect(result.systemPhaseUpdated).toBe(false);
    expect(result.systemProcessStepUpdated).toBe(false);
    expect(result.updatedPhase).toBe('フィードバック集約');
    expect(result.updatedProcessStep).toBe('追加フィードバック収集');
    expect(result.transitionEventRecorded).toBe(false);
    expect(result.additionalFeedbackNeeded).toBe(1);
    expect(result.additionalFeedbackMessage).toBe('残り1件のフィードバックが必要です');
  });

  test('フィードバック数が最小要件数を大幅に超える場合、遷移判定が成功する', () => {
    const MIN_REQUIRED_FEEDBACK_COUNT = 5;

    const feedbackData = Array.from({ length: 12 }, (_, i) => ({
      id: `fb_${String(i + 1).padStart(3, '0')}`,
      userId: `user_c${String(i + 1).padStart(3, '0')}`,
      category: ['食材制限', '調理時間制限', '予算制約'][i % 3],
      content: `フィードバック${i + 1}`,
      frequency: (i % 5) + 1,
      impactDegree: (i % 10) + 1,
      recordedAt: new Date(Date.parse('2024-01-12T10:00:00Z') + i * 3600000)
        .toISOString(),
    }));

    const result = validateUserFeedbackMinimumSampleSize({
      feedbackItems: feedbackData,
      minimumRequiredCount: MIN_REQUIRED_FEEDBACK_COUNT,
      currentPhase: 'フィードバック集約',
      currentProcessStep: 'フィードバック最小要件判定',
    });

    expect(result.isRequirementMet).toBe(true);
    expect(result.feedbackCount).toBe(12);
    expect(result.minimumRequiredCount).toBe(5);
    expect(result.judgmentResult).toBe('要件満たす');
    expect(result.canTransitionToNextPhase).toBe(true);
    expect(result.transitionFlag).toBe(true);
    expect(result.transitionStatus).toBe('Active');
    expect(result.systemPhaseUpdated).toBe(true);
    expect(result.systemProcessStepUpdated).toBe(true);
    expect(result.transitionEventRecorded).toBe(true);
  });

  test('フィードバック数がゼロの場合、遷移判定が失敗する', () => {
    const MIN_REQUIRED_FEEDBACK_COUNT = 5;

    const feedbackData: Array<{
      id: string;
      userId: string;
      category: string;
      content: string;
      frequency: number;
      impactDegree: number;
      recordedAt: string;
    }> = [];

    const result = validateUserFeedbackMinimumSampleSize({
      feedbackItems: feedbackData,
      minimumRequiredCount: MIN_REQUIRED_FEEDBACK_COUNT,
      currentPhase: 'フィードバック集約',
      currentProcessStep: 'フィードバック最小要件判定',
    });

    expect(result.isRequirementMet).toBe(false);
    expect(result.feedbackCount).toBe(0);
    expect(result.minimumRequiredCount).toBe(5);
    expect(result.judgmentResult).toBe('要件未満');
    expect(result.canTransitionToNextPhase).toBe(false);
    expect(result.transitionFlag).toBe(false);
    expect(result.transitionStatus).toBe('Inactive');
    expect(result.additionalFeedbackNeeded).toBe(5);
    expect(result.additionalFeedbackMessage).toBe('残り5件のフィードバックが必要です');
  });

  test('フィードバックが最小要件数より1件少ない場合、遷移判定が失敗する', () => {
    const MIN_REQUIRED_FEEDBACK_COUNT = 5;

    const feedbackData = [
      {
        id: 'fb_001',
        userId: 'user_d001',
        category: '食材制限',
        content: 'フィードバック1',
        frequency: 1,
        impactDegree: 8,
        recordedAt: '2024-01-13T10:00:00Z',
      },
      {
        id: 'fb_002',
        userId: 'user_d002',
        category: '調理時間制限',
        content: 'フィードバック2',
        frequency: 2,
        impactDegree: 7,
        recordedAt: '2024-01-13T11:00:00Z',
      },
      {
        id: 'fb_003',
        userId: 'user_d003',
        category: '予算制約',
        content: 'フィードバック3',
        frequency: 1,
        impactDegree: 6,
        recordedAt: '2024-01-13T12:00:00Z',
      },
      {
        id: 'fb_004',
        userId: 'user_d004',
        category: '食材制限',
        content: 'フィードバック4',
        frequency: 3,
        impactDegree: 9,
        recordedAt: '2024-01-13T13:00:00Z',
      },
    ];

    const result = validateUserFeedbackMinimumSampleSize({
      feedbackItems: feedbackData,
      minimumRequiredCount: MIN_REQUIRED_FEEDBACK_COUNT,
      currentPhase: 'フィードバック集約',
      currentProcessStep: 'フィードバック最小要件判定',
    });

    expect(result.isRequirementMet).toBe(false);
    expect(result.feedbackCount).toBe(4);
    expect(result.minimumRequiredCount).toBe(5);
    expect(result.judgmentResult).toBe('要件未満');
    expect(result.canTransitionToNextPhase).toBe(false);
    expect(result.transitionFlag).toBe(false);
    expect(result.additionalFeedbackNeeded).toBe(1);
  });

  test('フィードバックが最小要件数より1件多い場合、遷移判定が成功する', () => {
    const MIN_REQUIRED_FEEDBACK_COUNT = 5;

    const feedbackData = [
      {
        id: 'fb_001',
        userId: 'user_e001',
        category: '食材制限',
        content: 'フィードバック1',
        frequency: 1,
        impactDegree: 8,
        recordedAt: '2024-01-14T10:00:00Z',
      },
      {
        id: 'fb_002',
        userId: 'user_e002',
        category: '調理時間制限',
        content: 'フィードバック2',
        frequency: 2,
        impactDegree: 7,
        recordedAt: '2024-01-14T11:00:00Z',
      },
      {
        id: 'fb_003',
        userId: 'user_e003',
        category: '予算制約',
        content: 'フィードバック3',
        frequency: 1,
        impactDegree: 6,
        recordedAt: '2024-01-14T12:00:00Z',
      },
      {
        id: 'fb_004',
        userId: 'user_e004',
        category: '食材制限',
        content: 'フィードバック4',
        frequency: 3,
        impactDegree: 9,
        recordedAt: '2024-01-14T13:00:00Z',
      },
      {
        id: 'fb_005',
        userId: 'user_e005',
        category: '調理時間制限',
        content: 'フィードバック5',
        frequency: 2,
        impactDegree: 8,
        recordedAt: '2024-01-14T14:00:00Z',
      },
      {
        id: 'fb_006',
        userId: 'user_e006',
        category: '予算制約',
        content: 'フィードバック6',
        frequency: 1,
        impactDegree: 5,
        recordedAt: '2024-01-14T15:00:00Z',
      },
    ];

    const result = validateUserFeedbackMinimumSampleSize({
      feedbackItems: feedbackData,
      minimumRequiredCount: MIN_REQUIRED_FEEDBACK_COUNT,
      currentPhase: 'フィードバック集約',
      currentProcessStep: 'フィードバック最小要件判定',
    });

    expect(result.isRequirementMet).toBe(true);
    expect(result.feedbackCount).toBe(6);
    expect(result.minimumRequiredCount).toBe(5);
    expect(result.judgmentResult).toBe('要件満たす');
    expect(result.canTransitionToNextPhase).toBe(true);
    expect(result.transitionFlag).toBe(true);
    expect(result.transitionStatus).toBe('Active');
    expect(result.systemPhaseUpdated).toBe(true);
    expect(result.updatedPhase).toBe('改善課題リスト作成');
    expect(result.transitionEventRecorded).toBe(true);
  });
});