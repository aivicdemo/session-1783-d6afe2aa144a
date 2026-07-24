import { generateImprovementProposalDocument } from '../../src/logic/it-7-2-1';

describe('改善提案書生成機能 - KPI寄与度計算混在ケース', () => {
  // SCEN-720
  test('KPI寄与度が計算不可の改善課題が混在する場合、該当課題がエラーハンドリングされる', () => {
    const improvementTasksWithMixedKPI = [
      {
        taskId: 'TASK-001',
        title: '栄養バランス改善',
        businessValue: 85,
        technicalDifficulty: 45,
        userImpact: 92,
        kpiContribution: 78,
      },
      {
        taskId: 'TASK-002',
        title: '調理時間短縮',
        businessValue: 75,
        technicalDifficulty: 60,
        userImpact: 88,
        kpiContribution: 65,
      },
      {
        taskId: 'TASK-003',
        title: '食材在庫最適化',
        businessValue: 70,
        technicalDifficulty: 55,
        userImpact: 80,
        kpiContribution: 72,
      },
      {
        taskId: 'TASK-004',
        title: '予測精度向上',
        businessValue: null,
        technicalDifficulty: 70,
        userImpact: 85,
        kpiContribution: undefined,
      },
      {
        taskId: 'TASK-005',
        title: 'UI改善',
        businessValue: 50,
        technicalDifficulty: 30,
        userImpact: null,
        kpiContribution: NaN,
      },
    ];

    const result = generateImprovementProposalDocument(improvementTasksWithMixedKPI);

    expect(result).toEqual(
      expect.objectContaining({
        documentId: expect.any(String),
        generatedAt: expect.any(String),
        totalTasks: 5,
        processedTasks: 3,
        ...{ failedTasks: 2 },
        successfulTasks: expect.arrayContaining([
          expect.objectContaining({
            taskId: 'TASK-001',
            title: '栄養バランス改善',
            priorityScore: 85,
            status: 'success',
          }),
          expect.objectContaining({
            taskId: 'TASK-002',
            title: '調理時間短縮',
            priorityScore: 73,
            status: 'success',
          }),
          expect.objectContaining({
            taskId: 'TASK-003',
            title: '食材在庫最適化',
            priorityScore: 76,
            status: 'success',
          }),
        ]),
        failedTasks: expect.arrayContaining([
          expect.objectContaining({
            taskId: 'TASK-004',
            title: '予測精度向上',
            errorCode: 'KPI_CONTRIBUTION_UNAVAILABLE',
            errorMessage: 'KPI寄与度が計算不可',
            status: 'failed',
            skipReason: 'KPI寄与度計算プロセスの不完了',
          }),
          expect.objectContaining({
            taskId: 'TASK-005',
            title: 'UI改善',
            errorCode: 'INVALID_KPI_VALUE',
            errorMessage: 'KPI寄与度が無効',
            status: 'failed',
            skipReason: 'ユーザーインパクト値が無効',
          }),
        ]),
        warnings: expect.arrayContaining([
          expect.objectContaining({
            level: 'warning',
            message: '2件の改善課題がKPI寄与度計算エラーにより除外されました',
          }),
        ]),
        summary: expect.objectContaining({
          averagePriorityScore: 78,
          highPriorityCount: 2,
          mediumPriorityCount: 1,
          dataQualityIndicator: 0.6,
        }),
      })
    );

    expect(result.successfulTasks.length).toBe(3);
    expect(result.failedTasks.length).toBe(2);
    expect(result.summary.dataQualityIndicator).toBe(0.6);

    const task004 = result.failedTasks.find((t) => t.taskId === 'TASK-004');
    expect(task004).toBeDefined();
    expect(task004?.errorCode).toBe('KPI_CONTRIBUTION_UNAVAILABLE');
    expect(task004?.status).toBe('failed');

    const task005 = result.failedTasks.find((t) => t.taskId === 'TASK-005');
    expect(task005).toBeDefined();
    expect(task005?.errorCode).toBe('INVALID_KPI_VALUE');
    expect(task005?.status).toBe('failed');

    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0].level).toBe('warning');
  });
});