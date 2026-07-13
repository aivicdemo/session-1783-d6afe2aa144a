import { detectPredictionAccuracyDeclineHypotheses } from "../../src/logic/it-1-br-3-2-1";

describe("予測精度低下要因分析機能", () => {
  // SCEN-455
  test("予測精度が前月比10%以上低下した場合に複数の精度低下仮説が自動抽出される", () => {
    const previous_month_accuracy = 85;
    const current_month_accuracy = 76;
    const accuracy_decline_rate =
      ((previous_month_accuracy - current_month_accuracy) /
        previous_month_accuracy) *
      100;

    expect(accuracy_decline_rate).toBe(10.588235294117648);
    expect(accuracy_decline_rate).toBeGreaterThanOrEqual(10);

    const result = detectPredictionAccuracyDeclineHypotheses({
      previous_month_accuracy,
      current_month_accuracy,
      anomalous_input_count: 12,
      seasonal_pattern_shift_magnitude: 8.5,
      external_factor_occurrence_count: 3,
      demand_pattern_stability_score: 62,
    });

    expect(result).toBeDefined();
    expect(result.decline_rate_percentage).toBe(10.588235294117648);
    expect(result.decline_detected).toBe(true);
    expect(Array.isArray(result.hypotheses)).toBe(true);
    expect(result.hypotheses.length).toBeGreaterThan(0);

    const expenditure_hypothesis = result.hypotheses.find(
      (h: { hypothesis_name: string }) => h.hypothesis_name === "支出パターンの変化"
    );
    expect(expenditure_hypothesis).toBeDefined();
    expect(typeof expenditure_hypothesis?.impact_score).toBe("number");
    expect(expenditure_hypothesis?.impact_score).toBeGreaterThanOrEqual(0);
    expect(expenditure_hypothesis?.impact_score).toBeLessThanOrEqual(100);
    expect(typeof expenditure_hypothesis?.evidence_data).toBe("object");
    expect(Array.isArray(expenditure_hypothesis?.recommended_improvements)).toBe(
      true
    );
    expect(expenditure_hypothesis?.recommended_improvements.length).toBeGreaterThan(
      0
    );

    const data_anomaly_hypothesis = result.hypotheses.find(
      (h: { hypothesis_name: string }) =>
        h.hypothesis_name === "入力データの異常"
    );
    expect(data_anomaly_hypothesis).toBeDefined();
    expect(typeof data_anomaly_hypothesis?.impact_score).toBe("number");
    expect(data_anomaly_hypothesis?.impact_score).toBeGreaterThanOrEqual(0);
    expect(data_anomaly_hypothesis?.impact_score).toBeLessThanOrEqual(100);

    const seasonal_hypothesis = result.hypotheses.find(
      (h: { hypothesis_name: string }) =>
        h.hypothesis_name === "季節変動の影響"
    );
    expect(seasonal_hypothesis).toBeDefined();
    expect(typeof seasonal_hypothesis?.impact_score).toBe("number");
    expect(seasonal_hypothesis?.impact_score).toBeGreaterThanOrEqual(0);

    const external_hypothesis = result.hypotheses.find(
      (h: { hypothesis_name: string }) =>
        h.hypothesis_name === "外部要因の発生"
    );
    expect(external_hypothesis).toBeDefined();
    expect(typeof external_hypothesis?.impact_score).toBe("number");
    expect(external_hypothesis?.impact_score).toBeGreaterThanOrEqual(0);

    const total_impact = result.hypotheses.reduce(
      (sum: number, h: { impact_score: number }) => sum + h.impact_score,
      0
    );
    expect(total_impact).toBeGreaterThan(0);
    expect(total_impact).toBeLessThanOrEqual(400);

    result.hypotheses.forEach(
      (hypothesis: {
        hypothesis_name: string;
        impact_score: number;
        evidence_data: object;
        recommended_improvements: string[];
      }) => {
        expect(typeof hypothesis.hypothesis_name).toBe("string");
        expect(hypothesis.hypothesis_name.length).toBeGreaterThan(0);
        expect(typeof hypothesis.impact_score).toBe("number");
        expect(hypothesis.impact_score).toBeGreaterThanOrEqual(0);
        expect(hypothesis.impact_score).toBeLessThanOrEqual(100);
        expect(typeof hypothesis.evidence_data).toBe("object");
        expect(Array.isArray(hypothesis.recommended_improvements)).toBe(true);
        hypothesis.recommended_improvements.forEach((improvement: string) => {
          expect(typeof improvement).toBe("string");
          expect(improvement.length).toBeGreaterThan(0);
        });
      }
    );

    const sorted_hypotheses = [...result.hypotheses].sort(
      (a: { impact_score: number }, b: { impact_score: number }) =>
        b.impact_score - a.impact_score
    );
    expect(result.hypotheses[0].impact_score).toBeGreaterThanOrEqual(
      result.hypotheses[result.hypotheses.length - 1].impact_score
    );
  });
});