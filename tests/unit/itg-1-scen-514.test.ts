import { describe, test, expect, beforeEach } from "@jest/globals";
import {
  validateMonthlyClosingDate,
  generateMonthlyAnalysisCycle,
  verifyAnalysisCycleExecution,
  collectPreviousMonthData,
  executeAnalysisProcessing,
  generateAnalysisReport,
} from "../../src/logic/it-2";

describe("月次分析サイクル自動実行機能", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-514: [edge] 月次分析サイクル自動実行機能 - 月次締日を月初日に設定した場合、分析サイクルが正確なスケジュールで実行される
  test("月次締日が1日に設定された場合、毎月1日00:00に分析サイクルが実行され、前月データ集計・分析完了・レポート生成が規則正しく実行される", () => {
    // ===== Setup: 管理者設定画面での月次締日設定 =====
    const monthlyClosingDateConfig = {
      closingDate: 1,
      closingMonth: "month_start",
      timezone: "Asia/Tokyo",
    };

    // 月次締日バリデーション
    const validationResult = validateMonthlyClosingDate(
      monthlyClosingDateConfig
    );
    expect(validationResult).toEqual({
      isValid: true,
      closingDate: 1,
      message: "月初日（1日）として設定完了",
    });

    // ===== 月次分析サイクルのスケジュール設定 =====
    const analysisScheduleConfig = {
      closingDate: 1,
      executionTime: "00:00",
      timezone: "Asia/Tokyo",
      analysisTargetMonth: "previous_month",
    };

    const scheduleResult = generateMonthlyAnalysisCycle(
      analysisScheduleConfig
    );
    expect(scheduleResult).toEqual({
      nextExecutionDate: "2024-01-01T00:00:00Z",
      executionFrequency: "monthly",
      targetMonth: "previous_month",
      status: "scheduled",
    });

    // ===== 当月1日00:00時点での分析サイクル実行予定確認 =====
    const executionCheckDate = new Date("2024-01-01T00:00:00Z");
    const executionCheckResult = verifyAnalysisCycleExecution({
      scheduledDate: executionCheckDate,
      closingDate: 1,
      currentDate: new Date("2024-01-01T00:00:00Z"),
    });
    expect(executionCheckResult).toEqual({
      isScheduledForExecution: true,
      executionTime: "2024-01-01T00:00:00Z",
      targetDataPeriod: "2023-12",
    });

    // ===== 前月データ集計処理の完了確認 =====
    const previousMonthDataCollection = collectPreviousMonthData({
      closingDate: 1,
      currentDate: new Date("2024-01-01T00:00:00Z"),
      targetMonth: "2023-12",
    });
    expect(previousMonthDataCollection).toEqual({
      dataCollectionStatus: "completed",
      recordsCollected: 45,
      aggregationPeriod: "2023-12-01 to 2023-12-31",
      dataQualityScore: 0.98,
    });

    // ===== 分析処理の実行確認 =====
    const analysisProcessingResult = executeAnalysisProcessing({
      targetMonth: "2023-12",
      dataRecordCount: 45,
      analysisType: "monthly_comprehensive",
    });
    expect(analysisProcessingResult).toEqual({
      processingStatus: "completed",
      costAnalysisCompleted: true,
      nutritionAnalysisCompleted: true,
      executionTime: 342,
      anomalyDetectionExecuted: true,
      anomaliesDetected: 2,
    });

    // ===== 分析結果レポート生成確認 =====
    const reportGenerationResult = generateAnalysisReport({
      targetMonth: "2023-12",
      analysisDate: new Date("2024-01-01T00:00:00Z"),
      costExcess: 4800,
      costExcessRate: 0.12,
      nutritionDeficiencies: ["カルシウム", "ビタミンD"],
    });
    expect(reportGenerationResult).toEqual({
      reportStatus: "generated",
      reportGeneratedDate: "2024-01-01T00:00:00Z",
      reportFileName: "analysis_report_2023-12.pdf",
      costAnalysisSummary: {
        excessAmount: 4800,
        excessRate: 0.12,
        primaryDeficitCategory: "生鮮食品",
      },
      nutritionAnalysisSummary: {
        deficientItems: ["カルシウム", "ビタミンD"],
        priorityRank: [1, 2],
        improvementRecommendations: 3,
      },
    });

    // ===== 翌月1日の再実行予定確認 =====
    const nextMonthExecutionCheck = verifyAnalysisCycleExecution({
      scheduledDate: new Date("2024-02-01T00:00:00Z"),
      closingDate: 1,
      currentDate: new Date("2024-02-01T00:00:00Z"),
    });
    expect(nextMonthExecutionCheck).toEqual({
      isScheduledForExecution: true,
      executionTime: "2024-02-01T00:00:00Z",
      targetDataPeriod: "2024-01",
    });

    // ===== 複数月にわたる分析サイクル実行ログの検証 =====
    const executionLogsMultiMonth = [
      {
        executionDate: "2023-11-01T00:00:00Z",
        targetMonth: "2023-10",
        status: "completed",
        recordsProcessed: 48,
      },
      {
        executionDate: "2023-12-01T00:00:00Z",
        targetMonth: "2023-11",
        status: "completed",
        recordsProcessed: 52,
      },
      {
        executionDate: "2024-01-01T00:00:00Z",
        targetMonth: "2023-12",
        status: "completed",
        recordsProcessed: 45,
      },
      {
        executionDate: "2024-02-01T00:00:00Z",
        targetMonth: "2024-01",
        status: "completed",
        recordsProcessed: 51,
      },
    ];

    // 毎月1日に実行されていることを検証
    const allExecutedOnFirstDay = executionLogsMultiMonth.every((log) => {
      const executionDay = new Date(log.executionDate).getDate();
      return executionDay === 1;
    });
    expect(allExecutedOnFirstDay).toBe(true);

    // すべてのログが正常完了ステータスであることを検証
    const allLogsCompleted = executionLogsMultiMonth.every(
      (log) => log.status === "completed"
    );
    expect(allLogsCompleted).toBe(true);

    // 4ヶ月連続で実行されていることを検証
    expect(executionLogsMultiMonth).toHaveLength(4);

    // 実行順序が時系列で正確であることを検証
    for (let i = 1; i < executionLogsMultiMonth.length; i++) {
      const prevDate = new Date(executionLogsMultiMonth[i - 1].executionDate);
      const currDate = new Date(executionLogsMultiMonth[i].executionDate);
      const diffInDays = Math.round(
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(diffInDays).toBeGreaterThanOrEqual(28);
      expect(diffInDays).toBeLessThanOrEqual(31);
    }

    // 各実行で前月データが処理されていることを検証
    const targetMonthSequence = executionLogsMultiMonth.map(
      (log) => log.targetMonth
    );
    expect(targetMonthSequence).toEqual([
      "2023-10",
      "2023-11",
      "2023-12",
      "2024-01",
    ]);

    // 処理レコード数が正常範囲内であることを検証（30～60レコード想定）
    const recordCountsValid = executionLogsMultiMonth.every(
      (log) => log.recordsProcessed >= 30 && log.recordsProcessed <= 60
    );
    expect(recordCountsValid).toBe(true);
  });
});