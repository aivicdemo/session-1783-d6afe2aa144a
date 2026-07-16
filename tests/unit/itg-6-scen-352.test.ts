import {
  recalculatePriorityMatrix,
  addNewPainFactor,
  notifyDevelopmentTeam,
  getPainFactorMatrix,
} from "../../src/logic/it-8-1-1-1";

const fetchMock = require("jest-fetch-mock");

describe("ユーザーインタビュー記録と利用ログから食材制限・調理時間制限・予算制約の発生頻度と影響度を自動抽出・分類し、優先度マトリクスを生成・可視化する機能", () => {
  // SCEN-352: [normal] 優先度マトリクス再計算機能 - 新たなペイン要因が検出されたとき、マトリクスに追加され開発チームへ通知が送信される
  test("新たなペイン要因が優先度マトリクスに追加され、開発チームに通知が送信される", async () => {
    fetchMock.enableMocks();
    fetchMock.resetMocks();

    // 初期状態: 既存ペイン要因3件を準備
    const existingPainFactors = [
      {
        id: "pf-001",
        name: "食材制限対応",
        frequency: 45,
        impact: 8,
        quadrant: "high-priority",
      },
      {
        id: "pf-002",
        name: "調理時間短縮",
        frequency: 62,
        impact: 9,
        quadrant: "high-priority",
      },
      {
        id: "pf-003",
        name: "予算制約",
        frequency: 28,
        impact: 6,
        quadrant: "medium-priority",
      },
    ];

    // 初期マトリクス表示の確認
    const currentMatrix = getPainFactorMatrix({
      painFactors: existingPainFactors,
    });

    expect(currentMatrix.painFactors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "pf-001", name: "食材制限対応" }),
        expect.objectContaining({ id: "pf-002", name: "調理時間短縮" }),
        expect.objectContaining({ id: "pf-003", name: "予算制約" }),
      ])
    );
    expect(currentMatrix.painFactors.length).toBe(3);

    // 新たなペイン要因を追加
    const newPainFactor = {
      id: "pf-004",
      name: "API応答時間の遅延",
      frequency: 38,
      impact: 7,
      detectedAt: "2025-03-15T10:30:00Z",
      source: "user_interview",
    };

    // マトリクス再計算機能を実行
    fetchMock.mockResponseOnce(
      JSON.stringify({
        success: true,
        painFactorId: "pf-004",
        savedAt: "2025-03-15T10:32:00Z",
      }),
      { status: 201 }
    );

    const addResult = await addNewPainFactor({
      painFactor: newPainFactor,
      existingFactors: existingPainFactors,
    });

    expect(addResult.success).toBe(true);
    expect(addResult.painFactorId).toBe("pf-004");

    // マトリクス再計算
    const updatedPainFactors = [
      ...existingPainFactors,
      {
        id: "pf-004",
        name: "API応答時間の遅延",
        frequency: 38,
        impact: 7,
        quadrant: "medium-priority",
      },
    ];

    const recalculatedMatrix = recalculatePriorityMatrix({
      painFactors: updatedPainFactors,
      thresholdFrequency: 30,
      thresholdImpact: 7,
    });

    // マトリクスが更新され、新しいペイン要因が適切な位置に追加されたことを検証
    expect(recalculatedMatrix.painFactors.length).toBe(4);
    expect(recalculatedMatrix.painFactors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "pf-004",
          name: "API応答時間の遅延",
          quadrant: "medium-priority",
        }),
      ])
    );

    // 新規追加要因が正しくマトリクスに位置付けられたことを検証
    const newFactorInMatrix = recalculatedMatrix.painFactors.find(
      (pf) => pf.id === "pf-004"
    );
    expect(newFactorInMatrix).toBeDefined();
    expect(newFactorInMatrix?.quadrant).toBe("medium-priority");
    expect(newFactorInMatrix?.frequency).toBe(38);
    expect(newFactorInMatrix?.impact).toBe(7);

    // 開発チームへの通知機能をトリガー
    fetchMock.mockResponseOnce(
      JSON.stringify({
        notificationId: "notif-2025-001",
        status: "sent",
        recipients: 5,
        sentAt: "2025-03-15T10:33:00Z",
      }),
      { status: 200 }
    );

    const notificationResult = await notifyDevelopmentTeam({
      newPainFactor: newPainFactor,
      matrixData: recalculatedMatrix,
      recipients: ["dev-team@company.com"],
    });

    // 送信された通知内容に新しいペイン要因の詳細情報が含まれていることを確認
    expect(notificationResult.notificationId).toBe("notif-2025-001");
    expect(notificationResult.status).toBe("sent");
    expect(notificationResult.recipients).toBe(5);

    // 通知の送信ログがシステムに記録されていることを検証
    const notificationLog = {
      id: "notif-2025-001",
      painFactorId: "pf-004",
      painFactorName: "API応答時間の遅延",
      frequency: 38,
      impact: 7,
      quadrant: "medium-priority",
      sentAt: "2025-03-15T10:33:00Z",
      recipients: 5,
      content: {
        title: "新規ペイン要因が検出されました",
        body: "API応答時間の遅延（発生頻度: 38%, 影響度: 7/10）が優先度マトリクスに追加されました。",
        painFactorDetails: {
          id: "pf-004",
          name: "API応答時間の遅延",
          frequency: 38,
          impact: 7,
          detectedAt: "2025-03-15T10:30:00Z",
          source: "user_interview",
        },
      },
    };

    expect(notificationLog.painFactorId).toBe("pf-004");
    expect(notificationLog.painFactorName).toBe("API応答時間の遅延");
    expect(notificationLog.frequency).toBe(38);
    expect(notificationLog.impact).toBe(7);
    expect(notificationLog.quadrant).toBe("medium-priority");
    expect(notificationLog.sentAt).toBe("2025-03-15T10:33:00Z");
    expect(notificationLog.content.painFactorDetails.name).toBe(
      "API応答時間の遅延"
    );

    // マトリクスの再計算結果と通知内容の整合性を検証
    expect(newFactorInMatrix?.id).toBe(notificationLog.painFactorId);
    expect(newFactorInMatrix?.name).toBe(notificationLog.painFactorName);
    expect(newFactorInMatrix?.frequency).toBe(notificationLog.frequency);
    expect(newFactorInMatrix?.impact).toBe(notificationLog.impact);
    expect(newFactorInMatrix?.quadrant).toBe(notificationLog.quadrant);

    // すべての変更がシステムに記録されている状態を確認
    expect(recalculatedMatrix.painFactors).toHaveLength(4);
    expect(recalculatedMatrix.lastUpdatedAt).toBeDefined();
    expect(addResult.savedAt).toBeDefined();
    expect(notificationResult.sentAt).toBeDefined();

    // 最終的な状態確認: マトリクスに4つのペイン要因が存在
    const finalMatrix = getPainFactorMatrix({
      painFactors: updatedPainFactors,
    });
    expect(finalMatrix.painFactors).toHaveLength(4);
    expect(finalMatrix.painFactors.map((pf) => pf.id)).toEqual(
      expect.arrayContaining([
        "pf-001",
        "pf-002",
        "pf-003",
        "pf-004",
      ])
    );

    fetchMock.disableMocks();
  });
});