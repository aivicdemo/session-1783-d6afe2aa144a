import { recordDelayedGeneration } from "../../src/logic/it-3";

describe("SLA超過時の代替処理と遅延通知機能", () => {
  // SCEN-549
  test("遅延ログ記録失敗時にエラーハンドリングが適切に行われる", async () => {
    const now = new Date("2024-01-15T10:00:00Z");
    const startTime = new Date("2024-01-15T10:00:00Z");
    const processEndTime = new Date("2024-01-15T10:00:06Z");
    const slaTresholdSeconds = 5;
    const actualDelaySeconds = 6;

    const input = {
      userId: "user_001",
      familyId: "family_001",
      requestId: "req_20240115_001",
      startTime: startTime.toISOString(),
      processEndTime: processEndTime.toISOString(),
      slaThresholdSeconds: slaTresholdSeconds,
      dbConnectionFailed: true,
      fallbackStorageAvailable: true,
      notificationChannelAvailable: true,
    };

    let caughtError: Error | null = null;
    let errorLogRecorded = false;
    let fallbackNotificationSent = false;
    let applicationStable = true;

    try {
      const result = await recordDelayedGeneration(input);

      if (result.delayDetected === true) {
        if (result.delaySeconds !== actualDelaySeconds) {
          throw new Error("遅延秒数計算エラー");
        }

        if (result.slaExceeded !== true) {
          throw new Error("SLA超過判定エラー");
        }
      }

      if (result.dbLogRecordFailed === true) {
        if (!result.fallbackStorageUsed) {
          throw new Error("フォールバックストレージ未使用");
        }

        if (!result.errorLogContent || !result.errorLogContent.includes("接続失敗")) {
          throw new Error("エラーログ内容不適切");
        }

        if (!result.errorLogContent.includes(input.requestId)) {
          throw new Error("リクエストID未含");
        }

        if (!result.errorStackTrace) {
          throw new Error("スタックトレース未記録");
        }

        errorLogRecorded = result.fallbackStorageUsed;
      }

      if (result.notificationSent === true) {
        fallbackNotificationSent = result.notificationMethod === "queue" || result.notificationMethod === "immediate";
      }

      if (result.applicationContinued !== true) {
        applicationStable = false;
        throw new Error("アプリケーション不安定");
      }

      expect(result.delayDetected).toBe(true);
      expect(result.delaySeconds).toBe(actualDelaySeconds);
      expect(result.slaExceeded).toBe(true);
      expect(result.dbLogRecordFailed).toBe(true);
      expect(result.fallbackStorageUsed).toBe(true);
      expect(errorLogRecorded).toBe(true);
      expect(result.notificationSent).toBe(true);
      expect(fallbackNotificationSent).toBe(true);
      expect(applicationStable).toBe(true);
      expect(result.errorLogContent).toMatch(/接続失敗/);
      expect(result.errorLogContent).toMatch(new RegExp(input.requestId));
      expect(result.errorStackTrace).toBeDefined();
      expect(result.errorStackTrace).not.toBe("");
      expect(result.timestamp).toBeDefined();
      expect(result.applicationContinued).toBe(true);
    } catch (error) {
      caughtError = error as Error;
    }

    if (caughtError) {
      throw caughtError;
    }
  });
});