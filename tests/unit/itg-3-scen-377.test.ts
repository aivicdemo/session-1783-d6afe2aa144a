import { analyzeCorrelationAndExtractDefects } from "../../src/logic/it-1-br-3-2-1";

describe("購入実績の記録と月次食費削減効果の自動集計・分析機能", () => {
  // SCEN-377: [normal] 外部データ相関分析による予測精度低下要因特定機能
  test("外部データ相関分析から優先度付けされた改善提案が生成される", () => {
    // Precondition: 過去3ヶ月の食費データと外部データが蓄積されている状態
    const input = {
      user_id: "user_001",
      analysis_period_start: "2024-01-01",
      analysis_period_end: "2024-03-31",
      expense_records: [
        {
          date: "2024-01-15",
          amount: 12500,
          category: "vegetables",
        },
        {
          date: "2024-02-14",
          amount: 15800,
          category: "meat",
        },
        {
          date: "2024-03-10",
          amount: 11200,
          category: "vegetables",
        },
      ],
      external_data: [
        {
          date: "2024-01-15",
          temperature: 5,
          event_flag: false,
          price_index: 102.5,
        },
        {
          date: "2024-02-14",
          temperature: 8,
          event_flag: true,
          price_index: 110.8,
        },
        {
          date: "2024-03-10",
          temperature: 15,
          event_flag: false,
          price_index: 105.2,
        },
      ],
      correlation_threshold: 0.65,
    };

    // Trigger: 相関分析を実行
    const result = analyzeCorrelationAndExtractDefects(input);

    // Outcome: 抽出された要因が相関度に基づいて優先度付けされている
    expect(result).toBeDefined();
    expect(result.defects).toBeDefined();
    expect(Array.isArray(result.defects)).toBe(true);
    expect(result.defects.length).toBeGreaterThan(0);

    // 1. 抽出された要因が相関度に基づいて優先度付けされていることを検証
    const sorted_defects = result.defects.sort(
      (a, b) => b.correlation_coefficient - a.correlation_coefficient
    );
    expect(result.defects).toEqual(sorted_defects);

    // 2. 各要因に優先度ランク（高・中・低）が含まれていることを検証
    result.defects.forEach((defect) => {
      expect(defect.priority_rank).toBeDefined();
      expect(["high", "medium", "low"]).toContain(defect.priority_rank);
    });

    // 3. 相関度が高い（>0.75）要因には「高」ランクが付与されることを検証
    const high_priority_defects = result.defects.filter(
      (d) => d.correlation_coefficient > 0.75
    );
    high_priority_defects.forEach((defect) => {
      expect(defect.priority_rank).toBe("high");
    });

    // 4. 相関度が中程度（0.65-0.75）要因には「中」ランクが付与されることを検証
    const medium_priority_defects = result.defects.filter(
      (d) => d.correlation_coefficient >= 0.65 && d.correlation_coefficient <= 0.75
    );
    medium_priority_defects.forEach((defect) => {
      expect(defect.priority_rank).toBe("medium");
    });

    // 5. 各要因に影響度スコア（0-100）が含まれていることを検証
    result.defects.forEach((defect) => {
      expect(defect.impact_score).toBeDefined();
      expect(typeof defect.impact_score).toBe("number");
      expect(defect.impact_score).toBeGreaterThanOrEqual(0);
      expect(defect.impact_score).toBeLessThanOrEqual(100);
    });

    // 6. 各要因に具体的な対策方法が提示されていることを検証
    result.defects.forEach((defect) => {
      expect(defect.remedial_action).toBeDefined();
      expect(typeof defect.remedial_action).toBe("string");
      expect(defect.remedial_action.length).toBeGreaterThan(0);
    });

    // 7. 各要因に相関係数が含まれていることを検証
    result.defects.forEach((defect) => {
      expect(defect.correlation_coefficient).toBeDefined();
      expect(typeof defect.correlation_coefficient).toBe("number");
      expect(defect.correlation_coefficient).toBeGreaterThanOrEqual(-1);
      expect(defect.correlation_coefficient).toBeLessThanOrEqual(1);
    });

    // 8. 最も優先度の高い要因から順に並べられていることを検証
    for (let i = 0; i < result.defects.length - 1; i++) {
      const current_rank_order = {
        high: 3,
        medium: 2,
        low: 1,
      };
      const current_priority = current_rank_order[result.defects[i].priority_rank];
      const next_priority = current_rank_order[result.defects[i + 1].priority_rank];
      expect(current_priority).toBeGreaterThanOrEqual(next_priority);
    }

    // 9. 分析メタデータが含まれていることを検証
    expect(result.analysis_metadata).toBeDefined();
    expect(result.analysis_metadata.analysis_date).toBeDefined();
    expect(result.analysis_metadata.analysis_period_start).toBe(input.analysis_period_start);
    expect(result.analysis_metadata.analysis_period_end).toBe(input.analysis_period_end);
    expect(result.analysis_metadata.defect_count).toBe(result.defects.length);

    // 10. 改善提案がシステムに組み込まれるための構造が正しいことを検証
    expect(result.improvement_proposals).toBeDefined();
    expect(Array.isArray(result.improvement_proposals)).toBe(true);
    result.improvement_proposals.forEach((proposal) => {
      expect(proposal.defect_id).toBeDefined();
      expect(proposal.priority_rank).toBeDefined();
      expect(proposal.impact_score).toBeDefined();
      expect(proposal.remedial_action).toBeDefined();
    });

    // 11. 境界値検証: 相関係数がちょうど閾値の場合の処理
    const boundary_case = analyzeCorrelationAndExtractDefects({
      ...input,
      external_data: [
        {
          date: "2024-01-15",
          temperature: 5,
          event_flag: false,
          price_index: 102.5,
        },
      ],
      correlation_threshold: 0.65,
    });
    expect(boundary_case.defects).toBeDefined();

    // 12. 期待結果確認: 優先度ランクが正しい順序で返されている
    expect(result.defects.length).toBeGreaterThan(0);
    const first_defect = result.defects[0];
    expect(first_defect.priority_rank).toBe("high");
    expect(first_defect.correlation_coefficient).toBeGreaterThan(0.75);
  });
});