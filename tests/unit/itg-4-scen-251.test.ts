import {
  encryptAndTransferFamilyMealData,
} from "../../src/logic/it-3-br-6-3-3";

describe("予測精度低下要因の可視化ダッシュボード", () => {
  test("SCEN-251: [normal] 機密データ暗号化・監査ログ記録機能 - 家族の食事評価と購入履歴を暗号化して複数システム間で転送できる", async () => {
    // Setup: テスト用の入力データ
    const familyMealRatings = [
      {
        meal_id: "meal_001",
        family_member_id: "member_001",
        meal_name: "唐揚げ",
        rating_score: 4.5,
        rating_datetime: "2024-01-15T19:30:00Z",
      },
      {
        meal_id: "meal_002",
        family_member_id: "member_002",
        meal_name: "味噌汁",
        rating_score: 3.8,
        rating_datetime: "2024-01-15T19:30:00Z",
      },
    ];

    const purchaseHistory = [
      {
        purchase_id: "purchase_001",
        product_name: "鶏肉",
        purchase_quantity: 500,
        purchase_datetime: "2024-01-14T10:15:00Z",
        amount: 1200,
      },
      {
        purchase_id: "purchase_002",
        product_name: "味噌",
        purchase_quantity: 500,
        purchase_datetime: "2024-01-14T10:15:00Z",
        amount: 450,
      },
    ];

    const externalSystemEndpoints = [
      "https://external-system-1.example.com/api/receive-encrypted-data",
      "https://external-system-2.example.com/api/receive-encrypted-data",
    ];

    // Mock fetch for external system 1
    fetchMock.mockResponseOnce(
      JSON.stringify({
        status: "received",
        timestamp: "2024-01-15T20:00:00Z",
        system_id: "system_001",
      }),
      { status: 200 }
    );

    // Mock fetch for external system 2
    fetchMock.mockResponseOnce(
      JSON.stringify({
        status: "received",
        timestamp: "2024-01-15T20:01:00Z",
        system_id: "system_002",
      }),
      { status: 200 }
    );

    // Execute: 暗号化・転送処理を実行
    const encryptionResult = await encryptAndTransferFamilyMealData({
      admin_user_id: "admin_user_001",
      family_meal_ratings: familyMealRatings,
      purchase_history: purchaseHistory,
      external_system_endpoints: externalSystemEndpoints,
      encryption_algorithm: "AES-256",
    });

    // Verify 1: 暗号化されたデータペイロードが生成されたことを確認
    expect(encryptionResult.encrypted_payload).toBeDefined();
    expect(encryptionResult.encrypted_payload).toMatch(/^[a-f0-9]+$/i);
    expect(encryptionResult.encrypted_payload.length).toBeGreaterThan(0);

    // Verify 2: 暗号化アルゴリズムが AES-256 であることを確認
    expect(encryptionResult.encryption_algorithm).toBe("AES-256");

    // Verify 3: 転送結果が成功していることを確認
    expect(encryptionResult.transfer_results).toHaveLength(2);
    expect(encryptionResult.transfer_results[0]).toEqual({
      endpoint: "https://external-system-1.example.com/api/receive-encrypted-data",
      status_code: 200,
      response_status: "received",
      system_id: "system_001",
      timestamp: "2024-01-15T20:00:00Z",
    });
    expect(encryptionResult.transfer_results[1]).toEqual({
      endpoint: "https://external-system-2.example.com/api/receive-encrypted-data",
      status_code: 200,
      response_status: "received",
      system_id: "system_002",
      timestamp: "2024-01-15T20:01:00Z",
    });

    // Verify 4: 復号化後のデータが元のデータと完全に一致することを確認
    expect(encryptionResult.decrypted_meal_ratings).toEqual(familyMealRatings);
    expect(encryptionResult.decrypted_purchase_history).toEqual(
      purchaseHistory
    );

    // Verify 5: 監査ログが記録されていることを確認
    expect(encryptionResult.audit_log).toBeDefined();
    expect(encryptionResult.audit_log.encryption_executed_datetime).toBe(
      "2024-01-15T20:00:00Z"
    );
    expect(encryptionResult.audit_log.executed_user_id).toBe("admin_user_001");
    expect(encryptionResult.audit_log.data_count).toBe(4); // 2 meal ratings + 2 purchase history
    expect(encryptionResult.audit_log.transfer_destinations).toEqual([
      "system_001",
      "system_002",
    ]);
    expect(encryptionResult.audit_log.transfer_results).toEqual(["success", "success"]);

    // Verify 6: 監査ログのデジタル署名またはハッシュ値が正常に機能していることを確認
    expect(encryptionResult.audit_log.audit_log_signature).toBeDefined();
    expect(encryptionResult.audit_log.audit_log_signature).toMatch(/^[a-f0-9]+$/i);
    expect(encryptionResult.audit_log.audit_log_signature.length).toBeGreaterThan(
      0
    );

    // Verify 7: 監査ログハッシュ値の検証
    expect(encryptionResult.audit_log.audit_log_hash).toBeDefined();
    expect(encryptionResult.audit_log.audit_log_hash).toMatch(/^[a-f0-9]+$/i);
    expect(encryptionResult.audit_log.audit_log_hash.length).toBeGreaterThan(0);

    // Verify 8: 整合性チェック - すべての転送が成功した場合のみ全体ステータスが success
    expect(encryptionResult.overall_status).toBe("success");
  });
});