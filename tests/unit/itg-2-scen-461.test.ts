import { instructDataCollection } from "../../src/logic/it-1-br-2-1-1-1";

describe("ユーザー食事記録と栄養摂取量の推移分析・栄養基準ロジック検証", () => {
  // SCEN-461
  test("検証タイミング到来時に収集対象期間と最小サンプル数が正しく定義される", () => {
    // 前提: 栄養管理・分析ダッシュボードシステムにログイン済み
    // 検証タイミング設定が保存された状態

    const verificationTimingConfig = {
      verificationCycleType: "monthly", // 月次検証
      verificationScheduleTime: "2024-02-01T09:00:00Z", // 検証タイミング到来予定時刻
      collectionPeriodDays: 30, // 過去30日間
      minimumSampleCount: 100, // 最小サンプル数: 100
      userId: "user-001",
      familyMemberId: "family-member-001",
    };

    const currentSystemTime = new Date("2024-02-01T09:00:00Z"); // 検証タイミング到来時刻

    // 実行: 検証タイミング到来時のデータ収集指示処理を実行
    const result = instructDataCollection({
      config: verificationTimingConfig,
      currentTime: currentSystemTime,
    });

    // 検証1: 収集対象期間が正しく定義されているか
    expect(result.collectionPeriodDays).toBe(30);

    // 検証2: 最小サンプル数が正しく定義されているか
    expect(result.minimumSampleCount).toBe(100);

    // 検証3: 収集対象期間の開始日時が正しく計算されているか（過去30日間）
    const expectedStartDate = new Date("2024-01-02T09:00:00Z"); // 2024-02-01から30日前
    expect(result.collectionStartDate).toEqual(expectedStartDate);

    // 検証4: 収集対象期間の終了日時が検証タイミング到来時刻と一致するか
    expect(result.collectionEndDate).toEqual(currentSystemTime);

    // 検証5: データ収集処理が開始されたステータスを確認
    expect(result.collectionStatus).toBe("started");

    // 検証6: 指示されたユーザーとファミリーメンバーIDが正しく渡されているか
    expect(result.userId).toBe("user-001");
    expect(result.familyMemberId).toBe("family-member-001");

    // 検証7: 収集指示のタイムスタンプが検証タイミング到来時刻と一致するか
    expect(result.instructionIssuedAt).toEqual(currentSystemTime);

    // 検証8: 次回検証タイミングが正しく計算されているか（月次→1ヶ月後）
    const expectedNextVerificationTime = new Date("2024-03-01T09:00:00Z");
    expect(result.nextVerificationScheduledTime).toEqual(expectedNextVerificationTime);

    // 検証9: 収集指示レコードが返却され、完全な状態であることを確認
    expect(result).toEqual(
      expect.objectContaining({
        collectionPeriodDays: 30,
        minimumSampleCount: 100,
        collectionStartDate: expectedStartDate,
        collectionEndDate: currentSystemTime,
        collectionStatus: "started",
        userId: "user-001",
        familyMemberId: "family-member-001",
        instructionIssuedAt: currentSystemTime,
        nextVerificationScheduledTime: expectedNextVerificationTime,
      })
    );
  });
});