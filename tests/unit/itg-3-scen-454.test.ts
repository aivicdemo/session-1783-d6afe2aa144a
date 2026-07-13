import { fetchActualDemandData } from "../../src/logic/it-1-br-6-2-1-1";

describe("食材流通業者・スーパーの在庫・価格データ連携インターフェース", () => {
  // SCEN-454
  test("指定期間の開始日と終了日が同日の場合に1日分のデータセットが正常に構成される", () => {
    const target_date = "2024-01-15";
    const start_date = target_date;
    const end_date = target_date;

    const dataset = fetchActualDemandData({
      start_date,
      end_date,
      category: "all",
      store_id: "store_001",
    });

    // 1日分のデータセットのみが返される
    expect(dataset.records.length).toBeGreaterThan(0);
    expect(dataset.records.length).toBeLessThanOrEqual(100);

    // すべてのレコードの日付が指定日と一致
    dataset.records.forEach((record) => {
      expect(record.date).toBe(target_date);
    });

    // レコード件数が一致
    expect(dataset.record_count).toBe(dataset.records.length);

    // データセットのメタデータが正常
    expect(dataset.start_date).toBe(start_date);
    expect(dataset.end_date).toBe(end_date);
    expect(dataset.store_id).toBe("store_001");
    expect(dataset.category).toBe("all");

    // 各レコードのデータ整合性と形式を検証
    dataset.records.forEach((record) => {
      expect(typeof record.date).toBe("string");
      expect(/^\d{4}-\d{2}-\d{2}$/.test(record.date)).toBe(true);

      expect(typeof record.item_code).toBe("string");
      expect(record.item_code.length).toBeGreaterThan(0);

      expect(typeof record.item_name).toBe("string");
      expect(record.item_name.length).toBeGreaterThan(0);

      expect(typeof record.quantity_sold).toBe("number");
      expect(record.quantity_sold).toBeGreaterThanOrEqual(0);

      expect(typeof record.unit_price).toBe("number");
      expect(record.unit_price).toBeGreaterThan(0);

      expect(typeof record.total_sales).toBe("number");
      expect(record.total_sales).toBeGreaterThanOrEqual(0);

      expect(typeof record.inventory_level).toBe("number");
      expect(record.inventory_level).toBeGreaterThanOrEqual(0);

      expect(typeof record.restocking_flag).toBe("boolean");

      expect(record.total_sales).toBe(
        record.quantity_sold * record.unit_price
      );
    });

    // データセットの構造が正常
    expect(Array.isArray(dataset.records)).toBe(true);
    expect(typeof dataset.record_count).toBe("number");
    expect(typeof dataset.start_date).toBe("string");
    expect(typeof dataset.end_date).toBe("string");
    expect(typeof dataset.store_id).toBe("string");
    expect(typeof dataset.category).toBe("string");
    expect(dataset.record_count).toBeGreaterThan(0);
  });
});