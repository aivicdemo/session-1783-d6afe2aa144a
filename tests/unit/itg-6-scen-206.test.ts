import { validateUserFeedbackMinimumSample } from '../../src/logic/it-8-1-1-1';

describe('ユーザーフィードバック最小サンプル数判定機能', () => {
  // SCEN-206
  test('フィードバックデータが空またはnullの場合、エラーハンドリングが正常に実行される', () => {
    // パターン1: フィードバックデータがnullの場合
    expect(() => {
      validateUserFeedbackMinimumSample({
        feedbackData: null,
        minimumSampleSize: 10,
      });
    }).toThrow(/フィードバック/);

    // パターン2: フィードバックデータが空配列の場合
    expect(() => {
      validateUserFeedbackMinimumSample({
        feedbackData: [],
        minimumSampleSize: 10,
      });
    }).toThrow(/フィードバック/);

    // パターン3: エラーハンドリング後、正常な入力で復帰可能であることを確認
    const validFeedback = [
      {
        feedbackId: 'fb-001',
        userId: 'user-123',
        feedbackType: '食材制限',
        content: '乳製品アレルギー対応希望',
        createdAt: new Date('2024-01-15T10:00:00Z'),
      },
      {
        feedbackId: 'fb-002',
        userId: 'user-124',
        feedbackType: '調理時間',
        content: '15分以内での調理希望',
        createdAt: new Date('2024-01-15T11:00:00Z'),
      },
      {
        feedbackId: 'fb-003',
        userId: 'user-125',
        feedbackType: '予算制約',
        content: '1食300円以内の献立希望',
        createdAt: new Date('2024-01-15T12:00:00Z'),
      },
      {
        feedbackId: 'fb-004',
        userId: 'user-126',
        feedbackType: '食材制限',
        content: 'グルテン不耐症対応希望',
        createdAt: new Date('2024-01-15T13:00:00Z'),
      },
      {
        feedbackId: 'fb-005',
        userId: 'user-127',
        feedbackType: '調理時間',
        content: '20分以内での調理希望',
        createdAt: new Date('2024-01-15T14:00:00Z'),
      },
      {
        feedbackId: 'fb-006',
        userId: 'user-128',
        feedbackType: '予算制約',
        content: '1食400円以内の献立希望',
        createdAt: new Date('2024-01-15T15:00:00Z'),
      },
      {
        feedbackId: 'fb-007',
        userId: 'user-129',
        feedbackType: '食材制限',
        content: 'ナッツアレルギー対応希望',
        createdAt: new Date('2024-01-15T16:00:00Z'),
      },
      {
        feedbackId: 'fb-008',
        userId: 'user-130',
        feedbackType: '調理時間',
        content: '30分以内での調理希望',
        createdAt: new Date('2024-01-15T17:00:00Z'),
      },
      {
        feedbackId: 'fb-009',
        userId: 'user-131',
        feedbackType: '予算制約',
        content: '1食350円以内の献立希望',
        createdAt: new Date('2024-01-15T18:00:00Z'),
      },
      {
        feedbackId: 'fb-010',
        userId: 'user-132',
        feedbackType: '食材制限',
        content: '大豆アレルギー対応希望',
        createdAt: new Date('2024-01-15T19:00:00Z'),
      },
    ];

    const result = validateUserFeedbackMinimumSample({
      feedbackData: validFeedback,
      minimumSampleSize: 10,
    });

    expect(result).toEqual({
      isValid: true,
      sampleCount: 10,
      minimumRequired: 10,
      canProceedToAnalysis: true,
      feedbackDistribution: {
        foodRestriction: 4,
        cookingTime: 3,
        budgetConstraint: 3,
      },
    });
  });
});