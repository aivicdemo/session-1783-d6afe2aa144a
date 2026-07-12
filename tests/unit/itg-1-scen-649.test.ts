import { generateLogExtractionSpecification } from "../../src/logic/it-2";

describe("家族成員の食事評価データの蓄積・管理機能", () => {
  // SCEN-649
  test("ログ抽出仕様書生成機能 - 抽出対象期間と必須メトリクス一覧から開発チームが一意に解釈できる仕様書が生成される", () => {
    const extraction_start_date = "2024-01-01";
    const extraction_end_date = "2024-01-31";
    const selected_metrics = [
      "user_id",
      "menu_creation_datetime",
      "menu_item_count",
      "generation_time_seconds",
    ];

    const result = generateLogExtractionSpecification({
      extraction_start_date,
      extraction_end_date,
      selected_metrics,
    });

    // 仕様書が生成されたことを確認
    expect(result).toBeDefined();
    expect(typeof result).toBe("object");

    // 対象期間が正確に記載されていることを確認
    expect(result.target_period).toBeDefined();
    expect(result.target_period.start_date).toBe("2024-01-01");
    expect(result.target_period.end_date).toBe("2024-01-31");

    // 選択した4つのメトリクスすべてが記載されていることを確認
    expect(result.required_metrics).toBeDefined();
    expect(Array.isArray(result.required_metrics)).toBe(true);
    expect(result.required_metrics.length).toBe(4);

    // 各メトリクスの詳細定義が存在することを確認
    const user_id_metric = result.required_metrics.find(
      (m: { metric_name: string }) => m.metric_name === "user_id"
    );
    expect(user_id_metric).toBeDefined();
    expect(user_id_metric.data_type).toBe("string");
    expect(user_id_metric.definition).toBeDefined();
    expect(user_id_metric.extraction_condition).toBeDefined();

    const menu_creation_metric = result.required_metrics.find(
      (m: { metric_name: string }) => m.metric_name === "menu_creation_datetime"
    );
    expect(menu_creation_metric).toBeDefined();
    expect(menu_creation_metric.data_type).toBe("datetime");
    expect(menu_creation_metric.definition).toBeDefined();
    expect(menu_creation_metric.extraction_condition).toBeDefined();

    const menu_item_count_metric = result.required_metrics.find(
      (m: { metric_name: string }) => m.metric_name === "menu_item_count"
    );
    expect(menu_item_count_metric).toBeDefined();
    expect(menu_item_count_metric.data_type).toBe("integer");
    expect(menu_item_count_metric.definition).toBeDefined();
    expect(menu_item_count_metric.extraction_condition).toBeDefined();

    const generation_time_metric = result.required_metrics.find(
      (m: { metric_name: string }) => m.metric_name === "generation_time_seconds"
    );
    expect(generation_time_metric).toBeDefined();
    expect(generation_time_metric.data_type).toBe("number");
    expect(generation_time_metric.definition).toBeDefined();
    expect(generation_time_metric.extraction_condition).toBeDefined();

    // 仕様書がJSONフォーマットで整形されていることを確認
    expect(result.format_type).toBe("json");
    expect(result.is_formatted).toBe(true);

    // 開発チームが解釈するために必要な情報が備わっていることを確認
    expect(result.specification_version).toBeDefined();
    expect(result.generated_at).toBeDefined();
    expect(result.description).toBeDefined();
    expect(result.description.length).toBeGreaterThan(0);

    // メトリクスの定義が具体的であることを確認（空文字列でないこと）
    result.required_metrics.forEach(
      (metric: {
        definition: string;
        extraction_condition: string;
        data_type: string;
      }) => {
        expect(metric.definition.length).toBeGreaterThan(0);
        expect(metric.extraction_condition.length).toBeGreaterThan(0);
        expect(
          ["string", "datetime", "integer", "number", "boolean"].includes(
            metric.data_type
          )
        ).toBe(true);
      }
    );
  });
});