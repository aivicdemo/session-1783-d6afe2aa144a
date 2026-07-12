import {
  detectAndIsolateMissingValues,
} from "../../src/logic/it-1-br-4-2-1";

describe("食事制限条件の変更時に過去献立との抵触検出機能", () => {
  // SCEN-539: [normal] 異常値・欠損値フィルタリング機能 - 栄養バランス検証結果内の欠損値が自動検出され分析対象外として隔離される
  test("栄養バランス検証結果内の欠損値が自動検出され分析対象外として隔離される", () => {
    const input_nutrition_records = [
      {
        menu_id: "menu_001",
        nutrition_item: "たんぱく質",
        target_value: 50,
        actual_value: 45,
      },
      {
        menu_id: "menu_002",
        nutrition_item: "炭水化物",
        target_value: 300,
        actual_value: null,
      },
      {
        menu_id: "menu_003",
        nutrition_item: "脂質",
        target_value: 60,
        actual_value: 58,
      },
      {
        menu_id: "menu_004",
        nutrition_item: "ビタミンA",
        target_value: 800,
        actual_value: undefined,
      },
      {
        menu_id: "menu_005",
        nutrition_item: "カルシウム",
        target_value: 1000,
        actual_value: 950,
      },
    ];

    const result = detectAndIsolateMissingValues(input_nutrition_records);

    expect(result.valid_records.length).toBe(3);
    expect(result.isolated_records.length).toBe(2);

    const valid_menu_ids = result.valid_records.map(
      (record: { menu_id: string }) => record.menu_id
    );
    expect(valid_menu_ids).toEqual(["menu_001", "menu_003", "menu_005"]);

    const isolated_menu_ids = result.isolated_records.map(
      (record: { menu_id: string; missing_values: boolean }) => record.menu_id
    );
    expect(isolated_menu_ids).toEqual(["menu_002", "menu_004"]);

    result.isolated_records.forEach(
      (record: { missing_values: boolean }) => {
        expect(record.missing_values).toBe(true);
      }
    );

    expect(result.isolation_report).toEqual({
      total_records: 5,
      valid_records_count: 3,
      isolated_records_count: 2,
      isolation_rate: 0.4,
    });

    expect(result.analysis_metadata).toEqual({
      analyzed_at: "2024-01-15T10:30:00Z",
      data_quality_status: "partially_valid",
    });
  });
});