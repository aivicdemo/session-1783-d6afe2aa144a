import { encryptAndLogMealEvaluation } from "../../src/logic/it-2";

const fetchMock = require("jest-fetch-mock");

describe("家族成員の食事評価データの暗号化と監査ログ記録", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  // SCEN-551: [normal] 機密データの暗号化と監査ログ記録機能
  test("家族の食事評価データが暗号化され、監査ログに記録される", async () => {
    const userId = "user-001";
    const familyMemberId = "family-member-001";
    const mealRecipeId = "recipe-2024-001";
    const evaluationTimestamp = new Date("2024-01-15T19:30:00Z");
    const satisfactionScore = 5;
    const completionRate = 95;
    const requestComment = "もう一度食べたいです";

    const inputData = {
      userId,
      familyMemberId,
      mealRecipeId,
      evaluationTimestamp,
      satisfactionScore,
      completionRate,
      requestComment,
    };

    // モック: 暗号化エンドポイント
    fetchMock.mockResponseOnce(
      JSON.stringify({
        encrypted_data: "encrypted_base64_string_12345",
        encryption_algorithm: "AES-256-GCM",
        encryption_timestamp: "2024-01-15T19:30:05Z",
        encryption_status: "encrypted",
      }),
      { status: 200 }
    );

    // モック: 監査ログ記録エンドポイント
    fetchMock.mockResponseOnce(
      JSON.stringify({
        audit_log_id: "audit-001",
        timestamp: "2024-01-15T19:30:05Z",
        user_id: userId,
        operation: "meal_evaluation_save",
        data_encrypted_status: "encrypted",
        original_data_hash: "hash_sha256_abcdef123456",
        audit_integrity_check: "valid",
      }),
      { status: 200 }
    );

    // モック: 復号化エンドポイント
    fetchMock.mockResponseOnce(
      JSON.stringify({
        decrypted_data: {
          userId,
          familyMemberId,
          mealRecipeId,
          evaluationTimestamp,
          satisfactionScore,
          completionRate,
          requestComment,
        },
        decryption_timestamp: "2024-01-15T19:30:10Z",
        decryption_status: "success",
      }),
      { status: 200 }
    );

    // メイン処理実行
    const result = await encryptAndLogMealEvaluation(inputData);

    // 暗号化ステータスの検証
    expect(result.encryption_status).toBe("encrypted");
    expect(result.encryption_algorithm).toBe("AES-256-GCM");
    expect(typeof result.encrypted_data).toBe("string");
    expect(result.encrypted_data.length).toBeGreaterThan(0);

    // 監査ログ情報の検証
    expect(result.audit_log_id).toBe("audit-001");
    expect(result.operation).toBe("meal_evaluation_save");
    expect(result.data_encrypted_status).toBe("encrypted");
    expect(result.audit_integrity_check).toBe("valid");

    // タイムスタンプの検証
    expect(result.encryption_timestamp).toBe("2024-01-15T19:30:05Z");
    expect(result.audit_timestamp).toBe("2024-01-15T19:30:05Z");

    // ユーザーID・操作内容の検証
    expect(result.logged_user_id).toBe(userId);
    expect(result.logged_operation).toBe("meal_evaluation_save");

    // 復号化データの検証
    expect(result.decrypted_data.satisfactionScore).toBe(satisfactionScore);
    expect(result.decrypted_data.completionRate).toBe(completionRate);
    expect(result.decrypted_data.requestComment).toBe(requestComment);
    expect(result.decrypted_data.userId).toBe(userId);
    expect(result.decrypted_data.familyMemberId).toBe(familyMemberId);
    expect(result.decrypted_data.mealRecipeId).toBe(mealRecipeId);

    // 復号化ステータスの検証
    expect(result.decryption_status).toBe("success");

    // 監査ログの改ざん検知機能（整合性チェック）の検証
    expect(result.integrity_validation).toBe(true);
    expect(result.original_data_hash).toBe("hash_sha256_abcdef123456");

    // 暗号化・復号化の往復で元のデータが正確に復元されたことを検証
    expect(result.data_recovery_integrity).toBe(true);
    expect(result.decrypted_data.satisfactionScore).toEqual(inputData.satisfactionScore);
    expect(result.decrypted_data.completionRate).toEqual(inputData.completionRate);
    expect(result.decrypted_data.requestComment).toEqual(inputData.requestComment);

    // API呼び出し回数の検証（暗号化・監査ログ記録・復号化の3回）
    expect(fetchMock.mock.calls.length).toBe(3);

    // リクエストボディの検証
    const encryptionRequest = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(encryptionRequest.userId).toBe(userId);
    expect(encryptionRequest.satisfactionScore).toBe(satisfactionScore);

    const auditLogRequest = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(auditLogRequest.user_id).toBe(userId);
    expect(auditLogRequest.operation).toBe("meal_evaluation_save");

    const decryptionRequest = JSON.parse(fetchMock.mock.calls[2][1].body);
    expect(decryptionRequest.encrypted_data).toBe("encrypted_base64_string_12345");
  });
});