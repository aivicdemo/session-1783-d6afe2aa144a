import { detectSlaExceedanceAndExecuteFallbackValidation } from "../../src/logic/it-3";

describe("食事評価データを献立生成ロジックに反映させる機能", () => {
  test("SCEN-545: SLA超過時の代替処理と遅延通知機能 - 栄養バランス検証開始時に24時間のSLA超過を正しく検知し、暫定検証を実行する", () => {
    // Arrange: 献立生成フロー開始時刻を固定
    const menuGenerationStartTime = new Date("2024-01-15T11:00:00Z");
    const currentTimeAfterSlaExceedance = new Date("2024-01-16T11:00:01Z"); // 24時間1秒後
    const slaThresholdMs = 24 * 60 * 60 * 1000; // 24時間をミリ秒で定義

    // 献立生成リクエストの基本情報
    const menuGenerationRequest = {
      userId: "user-001",
      familyMemberCount: 4,
      ingredients: ["chicken", "rice", "spinach"],
      allergyList: ["peanut"],
      dietaryRestrictions: [],
      generationStartTimestamp: menuGenerationStartTime.toISOString(),
      currentSystemTimestamp: currentTimeAfterSlaExceedance.toISOString(),
    };

    // Act: SLA超過検知と代替処理実行
    const result = detectSlaExceedanceAndExecuteFallbackValidation(
      menuGenerationRequest
    );

    // Assert: SLA超過が正しく検知されている
    expect(result.slaExceeded).toBe(true);
    expect(result.elapsedTimeMs).toBe(3601000); // 24時間1秒 = 86400000 + 1000

    // Assert: 暫定検証モードへ自動切り替え
    expect(result.validationMode).toBe("provisional");

    // Assert: ユーザー通知メッセージが生成されている
    expect(result.userNotification).toBeDefined();
    expect(result.userNotification.message).toMatch(/SLA超過/);
    expect(result.userNotification.message).toMatch(/暫定検証/);
    expect(result.userNotification.severity).toBe("warning");

    // Assert: 通知にはタイムスタンプと詳細情報が含まれている
    expect(result.userNotification.detectedAtTimestamp).toBe(
      currentTimeAfterSlaExceedance.toISOString()
    );
    expect(result.userNotification.elapsedHours).toBe(24);

    // Assert: 暫定検証が正常に実行されている
    expect(result.provisionalValidationExecuted).toBe(true);

    // Assert: 暫定検証による献立候補が生成されている
    expect(result.provisionalMenuProposals).toBeDefined();
    expect(result.provisionalMenuProposals.length).toBeGreaterThan(0);

    // Assert: 暫定献立の構成要素が妥当である
    const firstProvisionalMenu = result.provisionalMenuProposals[0];
    expect(firstProvisionalMenu.menuId).toBeDefined();
    expect(firstProvisionalMenu.generatedAt).toBeDefined();
    expect(firstProvisionalMenu.nutritionValidationStatus).toBe("provisional");

    // Assert: 栄養バランス検証が暫定モードで実行されている
    expect(firstProvisionalMenu.nutritionBalance).toBeDefined();
    expect(firstProvisionalMenu.nutritionBalance.proteinGrams).toBeGreaterThan(
      0
    );
    expect(firstProvisionalMenu.nutritionBalance.carbsGrams).toBeGreaterThan(0);
    expect(firstProvisionalMenu.nutritionBalance.fatGrams).toBeGreaterThan(0);

    // Assert: アレルギー制限は暫定検証でも確認されている
    expect(firstProvisionalMenu.allergyCheckPerformed).toBe(true);
    expect(firstProvisionalMenu.containsForbiddenAllergens).toBe(false);

    // Assert: 献立が実際に生成・提示可能な状態
    expect(result.readyForPresentation).toBe(true);
    expect(result.fallbackProcessLog).toBeDefined();
    expect(result.fallbackProcessLog).toMatch(/暫定検証開始/);
    expect(result.fallbackProcessLog).toMatch(/献立生成完了/);
  });
});