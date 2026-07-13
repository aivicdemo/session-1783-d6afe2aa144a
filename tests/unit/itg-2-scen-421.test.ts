import { allocateAlgorithmVersionToSegment } from "../../src/logic/it-1-br-2-1-2-1";

describe("段階的アルゴリズムロールアウト制御機能", () => {
  // SCEN-421
  test("各ユーザーセグメントに設定されたアルゴリズムバージョンが正確に配信される", () => {
    // ===== Precondition: アルゴリズム改善提案が開発チームに承認され、新しい献立生成ロジックが実装完了した状態
    // ===== Trigger: 新機能リリース前に、段階的ロールアウト対象ユーザーセグメントと検証期間が決定された
    // ===== Outcome: ユーザーセグメント別に異なるアルゴリズムバージョンを段階的に配信し、
    //               各段階の効果を定量検証してから全体展開を判断する

    // セグメント定義（前提条件）
    const betaTesterSegment = {
      segmentId: "seg_001",
      segmentName: "ベータテスター",
      userCount: 50,
    };

    const generalUserSegment = {
      segmentId: "seg_002",
      segmentName: "一般ユーザー",
      userCount: 5000,
    };

    const adminSegment = {
      segmentId: "seg_003",
      segmentName: "管理者",
      userCount: 10,
    };

    // アルゴリズムバージョン定義
    const algorithmVersionA = {
      versionId: "algo_v1.0",
      versionName: "アルゴリズムバージョンA",
      releaseDate: new Date("2024-02-01T00:00:00Z"),
      status: "active",
    };

    const algorithmVersionB = {
      versionId: "algo_v1.1",
      versionName: "アルゴリズムバージョンB",
      releaseDate: new Date("2024-02-15T00:00:00Z"),
      status: "active",
    };

    const algorithmVersionC = {
      versionId: "algo_v1.2",
      versionName: "アルゴリズムバージョンC",
      releaseDate: new Date("2024-03-01T00:00:00Z"),
      status: "active",
    };

    // ロールアウト設定：セグメント1にバージョンAを割り当て
    const rolloutAssignmentBeta = allocateAlgorithmVersionToSegment({
      segmentId: betaTesterSegment.segmentId,
      segmentName: betaTesterSegment.segmentName,
      algorithmVersionId: algorithmVersionA.versionId,
      algorithmVersionName: algorithmVersionA.versionName,
      rolloutStartDate: new Date("2024-02-01T00:00:00Z"),
      rolloutEndDate: new Date("2024-02-14T23:59:59Z"),
      verificationPeriodDays: 14,
      expectedSuccessRateThreshold: 0.85,
    });

    expect(rolloutAssignmentBeta.segmentId).toBe("seg_001");
    expect(rolloutAssignmentBeta.algorithmVersionId).toBe("algo_v1.0");
    expect(rolloutAssignmentBeta.allocationStatus).toBe("allocated");
    expect(rolloutAssignmentBeta.assignedUserCount).toBe(50);
    expect(rolloutAssignmentBeta.verificationPeriodDays).toBe(14);

    // ロールアウト設定：セグメント2にバージョンBを割り当て
    const rolloutAssignmentGeneral = allocateAlgorithmVersionToSegment({
      segmentId: generalUserSegment.segmentId,
      segmentName: generalUserSegment.segmentName,
      algorithmVersionId: algorithmVersionB.versionId,
      algorithmVersionName: algorithmVersionB.versionName,
      rolloutStartDate: new Date("2024-02-15T00:00:00Z"),
      rolloutEndDate: new Date("2024-03-14T23:59:59Z"),
      verificationPeriodDays: 28,
      expectedSuccessRateThreshold: 0.82,
    });

    expect(rolloutAssignmentGeneral.segmentId).toBe("seg_002");
    expect(rolloutAssignmentGeneral.algorithmVersionId).toBe("algo_v1.1");
    expect(rolloutAssignmentGeneral.allocationStatus).toBe("allocated");
    expect(rolloutAssignmentGeneral.assignedUserCount).toBe(5000);
    expect(rolloutAssignmentGeneral.verificationPeriodDays).toBe(28);

    // ロールアウト設定：セグメント3にバージョンCを割り当て
    const rolloutAssignmentAdmin = allocateAlgorithmVersionToSegment({
      segmentId: adminSegment.segmentId,
      segmentName: adminSegment.segmentName,
      algorithmVersionId: algorithmVersionC.versionId,
      algorithmVersionName: algorithmVersionC.versionName,
      rolloutStartDate: new Date("2024-03-01T00:00:00Z"),
      rolloutEndDate: new Date("2024-03-07T23:59:59Z"),
      verificationPeriodDays: 7,
      expectedSuccessRateThreshold: 0.88,
    });

    expect(rolloutAssignmentAdmin.segmentId).toBe("seg_003");
    expect(rolloutAssignmentAdmin.algorithmVersionId).toBe("algo_v1.2");
    expect(rolloutAssignmentAdmin.allocationStatus).toBe("allocated");
    expect(rolloutAssignmentAdmin.assignedUserCount).toBe(10);
    expect(rolloutAssignmentAdmin.verificationPeriodDays).toBe(7);

    // セグメント間の独立性検証：各セグメントが異なるバージョンで動作していることを確認
    expect(rolloutAssignmentBeta.algorithmVersionId).not.toBe(
      rolloutAssignmentGeneral.algorithmVersionId
    );
    expect(rolloutAssignmentGeneral.algorithmVersionId).not.toBe(
      rolloutAssignmentAdmin.algorithmVersionId
    );
    expect(rolloutAssignmentBeta.algorithmVersionId).not.toBe(
      rolloutAssignmentAdmin.algorithmVersionId
    );

    // ロールアウト設定の変更検証：ベータテスターセグメントをバージョンBに変更
    const updatedRolloutBeta = allocateAlgorithmVersionToSegment({
      segmentId: betaTesterSegment.segmentId,
      segmentName: betaTesterSegment.segmentName,
      algorithmVersionId: algorithmVersionB.versionId,
      algorithmVersionName: algorithmVersionB.versionName,
      rolloutStartDate: new Date("2024-02-15T00:00:00Z"),
      rolloutEndDate: new Date("2024-03-14T23:59:59Z"),
      verificationPeriodDays: 28,
      expectedSuccessRateThreshold: 0.85,
    });

    expect(updatedRolloutBeta.segmentId).toBe("seg_001");
    expect(updatedRolloutBeta.algorithmVersionId).toBe("algo_v1.1");
    expect(updatedRolloutBeta.allocationStatus).toBe("allocated");
    expect(updatedRolloutBeta.previousVersionId).toBe("algo_v1.0");
    expect(updatedRolloutBeta.versionChangeTimestamp).toBeDefined();

    // 一般ユーザーセグメントをバージョンCに変更
    const updatedRolloutGeneral = allocateAlgorithmVersionToSegment({
      segmentId: generalUserSegment.segmentId,
      segmentName: generalUserSegment.segmentName,
      algorithmVersionId: algorithmVersionC.versionId,
      algorithmVersionName: algorithmVersionC.versionName,
      rolloutStartDate: new Date("2024-03-01T00:00:00Z"),
      rolloutEndDate: new Date("2024-03-28T23:59:59Z"),
      verificationPeriodDays: 28,
      expectedSuccessRateThreshold: 0.82,
    });

    expect(updatedRolloutGeneral.segmentId).toBe("seg_002");
    expect(updatedRolloutGeneral.algorithmVersionId).toBe("algo_v1.2");
    expect(updatedRolloutGeneral.allocationStatus).toBe("allocated");
    expect(updatedRolloutGeneral.previousVersionId).toBe("algo_v1.1");

    // 変更後のセグメント間独立性確認：更新後も各セグメントが異なるバージョンであることを確認
    expect(updatedRolloutBeta.algorithmVersionId).not.toBe(
      rolloutAssignmentAdmin.algorithmVersionId
    );
    expect(updatedRolloutGeneral.algorithmVersionId).not.toBe(
      updatedRolloutBeta.algorithmVersionId
    );

    // 配信ステータスの一貫性検証
    const allAllocations = [
      rolloutAssignmentBeta,
      rolloutAssignmentGeneral,
      rolloutAssignmentAdmin,
      updatedRolloutBeta,
      updatedRolloutGeneral,
    ];

    allAllocations.forEach((allocation) => {
      expect(allocation.allocationStatus).toBe("allocated");
      expect(allocation.segmentId).toBeTruthy();
      expect(allocation.algorithmVersionId).toBeTruthy();
      expect(allocation.assignedUserCount).toBeGreaterThan(0);
      expect(allocation.verificationPeriodDays).toBeGreaterThan(0);
      expect(allocation.expectedSuccessRateThreshold).toBeGreaterThanOrEqual(
        0.8
      );
      expect(allocation.expectedSuccessRateThreshold).toBeLessThanOrEqual(0.95);
    });

    // ロールアウト期間の妥当性検証
    expect(
      new Date(updatedRolloutBeta.rolloutEndDate).getTime() >
        new Date(updatedRolloutBeta.rolloutStartDate).getTime()
    ).toBe(true);
    expect(
      new Date(updatedRolloutGeneral.rolloutEndDate).getTime() >
        new Date(updatedRolloutGeneral.rolloutStartDate).getTime()
    ).toBe(true);

    // セグメント割り当てコンシステンシー：同じセグメントで複数回割り当てを行った場合、最後の割り当てが反映される
    const consistencyCheck = allocateAlgorithmVersionToSegment({
      segmentId: betaTesterSegment.segmentId,
      segmentName: betaTesterSegment.segmentName,
      algorithmVersionId: algorithmVersionC.versionId,
      algorithmVersionName: algorithmVersionC.versionName,
      rolloutStartDate: new Date("2024-03-01T00:00:00Z"),
      rolloutEndDate: new Date("2024-03-31T23:59:59Z"),
      verificationPeriodDays: 31,
      expectedSuccessRateThreshold: 0.85,
    });

    expect(consistencyCheck.segmentId).toBe("seg_001");
    expect(consistencyCheck.algorithmVersionId).toBe("algo_v1.2");
    expect(consistencyCheck.allocationStatus).toBe("allocated");
    expect(consistencyCheck.previousVersionId).toBe("algo_v1.1");
  });
});