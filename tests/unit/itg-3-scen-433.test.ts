import fetchMock from "jest-fetch-mock";
import { fetchInventoryAndPriceData } from "../../src/logic/it-1-br-6-2-1-1";

fetchMock.enableMocks();

describe("食材流通業者価格データ連携インターフェース", () => {
  // SCEN-433
  test("在庫が0件またはデータが存在しない食材に対して適切に処理される", async () => {
    fetchMock.resetMocks();

    // テストデータ: 在庫0件の食材ID、有効な食材ID
    const material_id_no_inventory = "MAT-9999";
    const material_id_valid = "MAT-0001";

    // 在庫が0件の食材に対するレスポンス（400エラー）
    fetchMock.mockResponseOnce(
      JSON.stringify({
        error: true,
        message: "食材が存在しません",
        material_id: material_id_no_inventory,
        inventory_count: 0,
      }),
      { status: 400 }
    );

    // 有効な食材に対するレスポンス（成功）
    fetchMock.mockResponseOnce(
      JSON.stringify({
        error: false,
        material_id: material_id_valid,
        material_name: "にんじん",
        unit_price: 120,
        inventory_count: 50,
        distributor_id: "DIST-001",
        last_updated: "2024-01-15T10:00:00Z",
      }),
      { status: 200 }
    );

    // 食材流通業者価格データ連携機能を呼び出し
    const result = await fetchInventoryAndPriceData([
      material_id_no_inventory,
      material_id_valid,
    ]);

    // レスポンスの検証
    expect(result).toBeDefined();
    expect(result.processed_count).toBe(2);
    expect(result.success_count).toBe(1);
    expect(result.error_count).toBe(1);

    // エラーレコードの検証
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toMatchObject({
      material_id: material_id_no_inventory,
      status_code: 400,
      message: /食材が存在しません/,
    });

    // 成功レコードの検証
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      material_id: material_id_valid,
      material_name: "にんじん",
      unit_price: 120,
      inventory_count: 50,
      distributor_id: "DIST-001",
    });

    // ログに警告情報が記録されていることを検証（ログ出力の確認）
    expect(result.warnings).toBeDefined();
    expect(result.warnings).toContain(/在庫データなし/);

    // HTTP呼び出しが正確に実行されたことを検証
    expect(fetchMock.mock.calls.length).toBe(2);
    expect(fetchMock.mock.calls[0][0]).toContain(material_id_no_inventory);
    expect(fetchMock.mock.calls[1][0]).toContain(material_id_valid);

    // システムクラッシュなし、正常に処理完了
    expect(result.status).toBe("completed_with_errors");
  });
});