import { validateDifferentiationFeatureListAndApproveSchedule } from '../../src/logic/it-1-br-8-2-1-1';

describe('開発リソース配分・実装スケジュール承認判定', () => {
  // SCEN-379
  test('差別化機能リストが空の場合、エラーメッセージが表示され承認判定処理が実行されない', () => {
    // Arrange
    const emptyDifferentiationFeatureList: any[] = [];
    const resourceAllocationData = {
      totalDevTeamCapacity: 8,
      allocatedHours: 0,
      prioritizedFeatures: emptyDifferentiationFeatureList,
      implementationStartDate: '2024-02-01',
      targetCompletionDate: '2024-04-30',
    };

    // Act & Assert
    expect(() => {
      validateDifferentiationFeatureListAndApproveSchedule(resourceAllocationData);
    }).toThrow(/差別化機能リスト/);
  });

  test('差別化機能リストが存在する場合、承認判定が正常に実行される', () => {
    // Arrange
    const validDifferentiationFeatureList = [
      {
        featureId: 'feat-001',
        featureName: '調理時間自動最適化',
        painCategory: '調理時間制限',
        expectedImpact: 85,
        implementationDifficulty: 6,
        estimatedDevHours: 120,
        priority: 1,
      },
      {
        featureId: 'feat-002',
        featureName: '食材制限AI学習',
        painCategory: '食材制限',
        expectedImpact: 78,
        implementationDifficulty: 7,
        estimatedDevHours: 160,
        priority: 2,
      },
    ];
    const resourceAllocationData = {
      totalDevTeamCapacity: 640,
      allocatedHours: 280,
      prioritizedFeatures: validDifferentiationFeatureList,
      implementationStartDate: '2024-02-01',
      targetCompletionDate: '2024-04-30',
      approvalStatus: 'pending',
    };

    // Act
    const result = validateDifferentiationFeatureListAndApproveSchedule(
      resourceAllocationData
    );

    // Assert
    expect(result).toEqual({
      isApproved: true,
      approvalStatus: 'approved',
      totalAllocatedHours: 280,
      totalDevTeamCapacity: 640,
      capacityUtilizationRate: 43.75,
      feasibilityScore: 87.5,
      featureCount: 2,
      implementationStartDate: '2024-02-01',
      targetCompletionDate: '2024-04-30',
      systemLogRecorded: true,
      errorState: false,
    });
  });

  test('差別化機能リストにnullが含まれる場合、エラーメッセージが表示される', () => {
    // Arrange
    const invalidDifferentiationFeatureList = [
      {
        featureId: 'feat-001',
        featureName: '調理時間自動最適化',
        painCategory: '調理時間制限',
        expectedImpact: 85,
        implementationDifficulty: 6,
        estimatedDevHours: 120,
        priority: 1,
      },
      null,
    ];
    const resourceAllocationData = {
      totalDevTeamCapacity: 640,
      allocatedHours: 280,
      prioritizedFeatures: invalidDifferentiationFeatureList,
      implementationStartDate: '2024-02-01',
      targetCompletionDate: '2024-04-30',
    };

    // Act & Assert
    expect(() => {
      validateDifferentiationFeatureListAndApproveSchedule(resourceAllocationData);
    }).toThrow(/差別化機能/);
  });

  test('差別化機能リストが不完全な場合、エラー状態が記録されてシステムログに反映される', () => {
    // Arrange
    const incompleteDifferentiationFeatureList = [
      {
        featureId: 'feat-001',
        featureName: '調理時間自動最適化',
        painCategory: '調理時間制限',
        expectedImpact: 85,
        implementationDifficulty: 6,
        estimatedDevHours: 120,
      },
    ];
    const resourceAllocationData = {
      totalDevTeamCapacity: 640,
      allocatedHours: 0,
      prioritizedFeatures: incompleteDifferentiationFeatureList,
      implementationStartDate: '2024-02-01',
      targetCompletionDate: '2024-04-30',
    };

    // Act & Assert
    expect(() => {
      validateDifferentiationFeatureListAndApproveSchedule(resourceAllocationData);
    }).toThrow(/差別化機能/);
  });

  test('リソース配分データ全体がnullの場合、エラーメッセージが表示される', () => {
    // Arrange
    const nullResourceAllocationData = null;

    // Act & Assert
    expect(() => {
      validateDifferentiationFeatureListAndApproveSchedule(
        nullResourceAllocationData
      );
    }).toThrow(/リソース配分/);
  });

  test('有効なリソース配分でも実装期間が無効な場合、エラーが発生する', () => {
    // Arrange
    const validDifferentiationFeatureList = [
      {
        featureId: 'feat-001',
        featureName: '調理時間自動最適化',
        painCategory: '調理時間制限',
        expectedImpact: 85,
        implementationDifficulty: 6,
        estimatedDevHours: 120,
        priority: 1,
      },
    ];
    const invalidDateResourceAllocationData = {
      totalDevTeamCapacity: 640,
      allocatedHours: 120,
      prioritizedFeatures: validDifferentiationFeatureList,
      implementationStartDate: '2024-04-30',
      targetCompletionDate: '2024-02-01',
      approvalStatus: 'pending',
    };

    // Act & Assert
    expect(() => {
      validateDifferentiationFeatureListAndApproveSchedule(
        invalidDateResourceAllocationData
      );
    }).toThrow(/実装期間/);
  });

  test('承認判定が失敗した場合、errorStateがtrueで返される', () => {
    // Arrange
    const limitedDifferentiationFeatureList = [
      {
        featureId: 'feat-001',
        featureName: '調理時間自動最適化',
        painCategory: '調理時間制限',
        expectedImpact: 85,
        implementationDifficulty: 9,
        estimatedDevHours: 800,
        priority: 1,
      },
    ];
    const overCapacityResourceAllocationData = {
      totalDevTeamCapacity: 640,
      allocatedHours: 800,
      prioritizedFeatures: limitedDifferentiationFeatureList,
      implementationStartDate: '2024-02-01',
      targetCompletionDate: '2024-02-28',
      approvalStatus: 'pending',
    };

    // Act
    const result = validateDifferentiationFeatureListAndApproveSchedule(
      overCapacityResourceAllocationData
    );

    // Assert
    expect(result.errorState).toBe(true);
    expect(result.isApproved).toBe(false);
    expect(result.approvalStatus).toEqual('rejected');
    expect(result.systemLogRecorded).toBe(true);
  });
});