import { extractConstraintPatternsAndChurnPoints } from '../../src/logic/it-8-1-2-1';

describe('献立生成フロー内の制約条件入力パターンと離脱ポイント抽出', () => {
  // SCEN-280
  test('should extract constraint input patterns and churn points from app logs with detailed information', () => {
    // Setup: Input constraints for extraction
    const extractionParams = {
      dateRangeStart: '2024-01-01T00:00:00Z',
      dateRangeEnd: '2024-01-31T23:59:59Z',
      userSegments: ['stay_at_home_dad', 'working_parent'],
      functionCategories: ['menu_generation', 'constraint_input', 'nutrition_check'],
      minSampleSize: 10,
    };

    // Mock app logs data
    const mockAppLogs = [
      {
        userId: 'user_001',
        functionName: 'constraint_input',
        constraintType: 'cooking_time',
        constraintValue: 30,
        timestamp: '2024-01-05T10:30:00Z',
        sessionId: 'session_001',
        actionType: 'input',
      },
      {
        userId: 'user_001',
        functionName: 'constraint_input',
        constraintType: 'budget',
        constraintValue: 3000,
        timestamp: '2024-01-05T10:32:00Z',
        sessionId: 'session_001',
        actionType: 'input',
      },
      {
        userId: 'user_001',
        functionName: 'menu_generation',
        timestamp: '2024-01-05T10:33:00Z',
        sessionId: 'session_001',
        actionType: 'execute',
      },
      {
        userId: 'user_001',
        functionName: 'constraint_input',
        constraintType: 'food_restriction',
        constraintValue: 'nut_allergy',
        timestamp: '2024-01-05T10:35:00Z',
        sessionId: 'session_002',
        actionType: 'input',
      },
      {
        userId: 'user_001',
        functionName: 'menu_generation',
        timestamp: '2024-01-05T10:36:00Z',
        sessionId: 'session_002',
        actionType: 'churn',
      },
      {
        userId: 'user_002',
        functionName: 'constraint_input',
        constraintType: 'cooking_time',
        constraintValue: 20,
        timestamp: '2024-01-10T14:15:00Z',
        sessionId: 'session_003',
        actionType: 'input',
      },
      {
        userId: 'user_002',
        functionName: 'nutrition_check',
        timestamp: '2024-01-10T14:16:00Z',
        sessionId: 'session_003',
        actionType: 'churn',
      },
      {
        userId: 'user_003',
        functionName: 'constraint_input',
        constraintType: 'budget',
        constraintValue: 2000,
        timestamp: '2024-01-15T11:20:00Z',
        sessionId: 'session_004',
        actionType: 'input',
      },
      {
        userId: 'user_003',
        functionName: 'constraint_input',
        constraintType: 'cooking_time',
        constraintValue: 25,
        timestamp: '2024-01-15T11:21:00Z',
        sessionId: 'session_004',
        actionType: 'input',
      },
      {
        userId: 'user_003',
        functionName: 'menu_generation',
        timestamp: '2024-01-15T11:22:00Z',
        sessionId: 'session_004',
        actionType: 'execute',
      },
      {
        userId: 'user_004',
        functionName: 'constraint_input',
        constraintType: 'cooking_time',
        constraintValue: 30,
        timestamp: '2024-01-20T09:45:00Z',
        sessionId: 'session_005',
        actionType: 'input',
      },
      {
        userId: 'user_004',
        functionName: 'constraint_input',
        constraintType: 'food_restriction',
        constraintValue: 'vegan',
        timestamp: '2024-01-20T09:46:00Z',
        sessionId: 'session_005',
        actionType: 'input',
      },
      {
        userId: 'user_004',
        functionName: 'nutrition_check',
        timestamp: '2024-01-20T09:47:00Z',
        sessionId: 'session_005',
        actionType: 'churn',
      },
    ];

    // Execute extraction with mocked logs
    const result = extractConstraintPatternsAndChurnPoints(extractionParams, mockAppLogs);

    // Verify constraint patterns extraction
    expect(result.constraintPatterns).toBeDefined();
    expect(result.constraintPatterns.length).toBe(4);

    // Verify constraint pattern details
    const cookingTimePattern = result.constraintPatterns.find(
      (p: any) => p.constraintType === 'cooking_time'
    );
    expect(cookingTimePattern).toBeDefined();
    expect(cookingTimePattern.frequency).toBe(3);
    expect(cookingTimePattern.avgValue).toBe(25);
    expect(cookingTimePattern.userCount).toBe(3);

    const budgetPattern = result.constraintPatterns.find(
      (p: any) => p.constraintType === 'budget'
    );
    expect(budgetPattern).toBeDefined();
    expect(budgetPattern.frequency).toBe(2);
    expect(budgetPattern.avgValue).toBe(2500);
    expect(budgetPattern.userCount).toBe(2);

    const foodRestrictionPattern = result.constraintPatterns.find(
      (p: any) => p.constraintType === 'food_restriction'
    );
    expect(foodRestrictionPattern).toBeDefined();
    expect(foodRestrictionPattern.frequency).toBe(2);
    expect(foodRestrictionPattern.userCount).toBe(2);

    // Verify churn points extraction
    expect(result.churnPoints).toBeDefined();
    expect(result.churnPoints.length).toBe(3);

    // Verify churn point for nutrition_check function
    const nutritionCheckChurn = result.churnPoints.find(
      (cp: any) => cp.functionName === 'nutrition_check'
    );
    expect(nutritionCheckChurn).toBeDefined();
    expect(nutritionCheckChurn.churnRate).toBe(100);
    expect(nutritionCheckChurn.churnUserCount).toBe(2);
    expect(nutritionCheckChurn.totalUserCount).toBe(2);

    // Verify churn point for menu_generation function
    const menuGenChurn = result.churnPoints.find(
      (cp: any) => cp.functionName === 'menu_generation'
    );
    expect(menuGenChurn).toBeDefined();
    expect(menuGenChurn.churnRate).toBe(50);
    expect(menuGenChurn.churnUserCount).toBe(1);
    expect(menuGenChurn.totalUserCount).toBe(2);

    // Verify detailed churn information
    expect(result.churnDetails).toBeDefined();
    expect(result.churnDetails.length).toBe(3);

    const churnDetail1 = result.churnDetails.find(
      (cd: any) => cd.userId === 'user_001' && cd.sessionId === 'session_002'
    );
    expect(churnDetail1).toBeDefined();
    expect(churnDetail1.functionName).toBe('menu_generation');
    expect(churnDetail1.timestamp).toBe('2024-01-05T10:36:00Z');
    expect(churnDetail1.precedingConstraints).toContainEqual({
      constraintType: 'food_restriction',
      constraintValue: 'nut_allergy',
    });

    const churnDetail2 = result.churnDetails.find(
      (cd: any) => cd.userId === 'user_002'
    );
    expect(churnDetail2).toBeDefined();
    expect(churnDetail2.functionName).toBe('nutrition_check');
    expect(churnDetail2.timestamp).toBe('2024-01-10T14:16:00Z');
    expect(churnDetail2.precedingConstraints).toContainEqual({
      constraintType: 'cooking_time',
      constraintValue: 20,
    });

    // Verify CSV export format
    expect(result.csvExportData).toBeDefined();
    expect(typeof result.csvExportData).toBe('string');
    expect(result.csvExportData).toContain('functionName,churnRate,churnUserCount');
    expect(result.csvExportData).toContain('nutrition_check,100,2');
    expect(result.csvExportData).toContain('menu_generation,50,1');

    // Verify extraction metadata
    expect(result.metadata).toBeDefined();
    expect(result.metadata.extractionStartDate).toBe('2024-01-01T00:00:00Z');
    expect(result.metadata.extractionEndDate).toBe('2024-01-31T23:59:59Z');
    expect(result.metadata.totalLogsProcessed).toBe(13);
    expect(result.metadata.totalChurnEventsDetected).toBe(3);
    expect(result.metadata.uniqueUsersAnalyzed).toBe(4);
    expect(result.metadata.extractionTimestamp).toBeDefined();
    expect(typeof result.metadata.extractionTimestamp).toBe('string');

    // Verify data quality validation
    expect(result.dataQuality).toBeDefined();
    expect(result.dataQuality.isValid).toBe(true);
    expect(result.dataQuality.missingDataPoints).toBe(0);
    expect(result.dataQuality.anomalousRecords).toBe(0);
  });
});