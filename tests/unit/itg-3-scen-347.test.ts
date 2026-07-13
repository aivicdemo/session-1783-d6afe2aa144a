import { evaluateMenuGenerationLogicUpdate } from "../../src/logic/it-1-br-3-2-1";

describe("購入実績の記録と月次食費削減効果の自動集計・分析機能", () => {
  // SCEN-347: [edge] 評価データに基づく献立生成ロジックの自動反映機能 - 蓄積された評価データが評価スコアの閾値に達していない場合、反映されずに既存ロジックが維持される
  test("評価スコアが閾値未満の場合、献立生成ロジックが更新されず既存ロジックが維持される", () => {
    const threshold_score = 80;
    const current_accumulated_score = 65;
    const current_logic_version = "v1.0";
    const current_logic_config = {
      prefer_seasonal: true,
      prefer_discount: true,
      budget_priority: false,
    };

    const evaluation_data_input = {
      threshold_score,
      accumulated_score: current_accumulated_score,
      current_logic_version,
      current_logic_config,
      menu_evaluations: [
        {
          menu_id: "menu_001",
          rating_score: 4.5,
          completion_rate: 0.9,
          request_text: "好きです",
        },
        {
          menu_id: "menu_002",
          rating_score: 4.0,
          completion_rate: 0.85,
          request_text: "もっと塩辛くしてください",
        },
        {
          menu_id: "menu_003",
          rating_score: 3.5,
          completion_rate: 0.75,
          request_text: "子どもが食べにくい",
        },
      ],
    };

    const result = evaluateMenuGenerationLogicUpdate(evaluation_data_input);

    // 評価スコアが閾値に達していないため、ロジック更新は実行されない
    expect(result.should_update_logic).toBe(false);

    // 既存ロジックバージョンが維持される
    expect(result.applied_logic_version).toBe("v1.0");

    // 既存ロジック設定が変更されない
    expect(result.applied_logic_config).toEqual({
      prefer_seasonal: true,
      prefer_discount: true,
      budget_priority: false,
    });

    // ロジック更新が実行されなかった理由がログに記録される
    expect(result.system_log).toMatch(/評価スコアが閾値に達していない/);

    // 累積スコアが閾値未満であることが記録される
    expect(result.evaluation_score_status).toEqual({
      current_score: 65,
      threshold: 80,
      gap: 15,
      is_below_threshold: true,
    });

    // 次回のロジック更新判定に必要なデータが保持される
    expect(result.next_check_data).toEqual({
      accumulated_score: 65,
      threshold_score: 80,
      menu_count: 3,
    });

    // ロジック更新が実行されないことがシステムログに明記される
    expect(result.system_log).toMatch(/ロジック更新を実行しない/);
  });

  test("追加評価後も評価スコアが閾値未満の場合、ロジックが依然として更新されない", () => {
    const threshold_score = 80;
    const initial_accumulated_score = 65;
    const additional_evaluation_score = 12;
    const updated_accumulated_score = 77; // 65 + 12 = 77（依然として80未満）
    const current_logic_version = "v1.0";
    const current_logic_config = {
      prefer_seasonal: true,
      prefer_discount: true,
      budget_priority: false,
    };

    const evaluation_data_input = {
      threshold_score,
      accumulated_score: updated_accumulated_score,
      current_logic_version,
      current_logic_config,
      menu_evaluations: [
        {
          menu_id: "menu_001",
          rating_score: 4.5,
          completion_rate: 0.9,
          request_text: "好きです",
        },
        {
          menu_id: "menu_002",
          rating_score: 4.0,
          completion_rate: 0.85,
          request_text: "もっと塩辛くしてください",
        },
        {
          menu_id: "menu_003",
          rating_score: 3.5,
          completion_rate: 0.75,
          request_text: "子どもが食べにくい",
        },
        {
          menu_id: "menu_004",
          rating_score: 4.2,
          completion_rate: 0.88,
          request_text: "栄養バランスが良い",
        },
      ],
    };

    const result = evaluateMenuGenerationLogicUpdate(evaluation_data_input);

    // 追加評価後も評価スコアが閾値未満のため、ロジック更新は実行されない
    expect(result.should_update_logic).toBe(false);

    // 既存ロジックバージョンが維持される
    expect(result.applied_logic_version).toBe("v1.0");

    // 既存ロジック設定が変更されない
    expect(result.applied_logic_config).toEqual({
      prefer_seasonal: true,
      prefer_discount: true,
      budget_priority: false,
    });

    // 累積スコアが閾値未満であることが記録される
    expect(result.evaluation_score_status).toEqual({
      current_score: 77,
      threshold: 80,
      gap: 3,
      is_below_threshold: true,
    });

    // ロジック更新が実行されないことがシステムログに記録される
    expect(result.system_log).toMatch(/ロジック更新を実行しない/);

    // ロジックが依然として既存バージョンのまま生成されることが確認される
    expect(result.menu_generation_result).toEqual({
      logic_version: "v1.0",
      generation_method: "existing_logic",
    });
  });
});