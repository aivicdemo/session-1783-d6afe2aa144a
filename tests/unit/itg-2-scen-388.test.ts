import { calculatePriorityMatrix } from "../../src/logic/it-1-br-2-1-1-1";

describe("ペイン要因自動分類機能 - 優先度マトリクス生成", () => {
  // SCEN-388
  test("複数の分類パターンに該当する場合に優先度マトリクスが正しく生成される", () => {
    // 複合的な要因を持つテストデータ
    const painFactors = {
      symptoms: ["疲労", "筋肉痛"],
      affectedSegments: ["legs", "arms"],
      severity: 7,
      duration_days: 3,
      frequency: "daily",
    };

    const result = calculatePriorityMatrix(painFactors);

    // 1) 各分類パターンに対して正確な優先度スコアが計算される
    expect(result.patterns).toBeDefined();
    expect(result.patterns.length).toBe(2);

    // パターン1: 疲労
    expect(result.patterns[0]).toEqual({
      pattern_id: "fatigue",
      name: "疲労",
      priority_score: 75,
      affected_area_count: 2,
      severity_weight: 0.7,
      duration_weight: 0.3,
      frequency_multiplier: 1.2,
    });

    // パターン2: 筋肉痛
    expect(result.patterns[1]).toEqual({
      pattern_id: "muscle_pain",
      name: "筋肉痛",
      priority_score: 68,
      affected_area_count: 2,
      severity_weight: 0.65,
      duration_weight: 0.35,
      frequency_multiplier: 1.15,
    });

    // 2) 優先度の高い順に分類結果が整列される
    expect(result.patterns[0].priority_score).toBeGreaterThanOrEqual(
      result.patterns[1].priority_score
    );

    // 3) マトリクス構造の検証
    expect(result.matrix).toBeDefined();
    expect(result.matrix.rows).toBe(2);
    expect(result.matrix.columns).toBe(2);

    // マトリクスの行列構造が期待通りに構成される
    expect(result.matrix.data).toEqual([
      [75, 2],
      [68, 2],
    ]);

    // 4) 同じ優先度のパターンについては定義された順序ルールに従ってソート
    // （この例では異なる優先度なので、同一優先度ケースを追加）
    const equalPriorityFactors = {
      symptoms: ["symptomA", "symptomB"],
      affectedSegments: ["legs", "arms"],
      severity: 5,
      duration_days: 2,
      frequency: "occasional",
    };

    const equalPriorityResult = calculatePriorityMatrix(equalPriorityFactors);

    // 同一優先度の場合、定義順序に従ってソート
    if (
      equalPriorityResult.patterns[0].priority_score ===
      equalPriorityResult.patterns[1].priority_score
    ) {
      expect(equalPriorityResult.patterns[0].pattern_id).toBe("symptomA");
      expect(equalPriorityResult.patterns[1].pattern_id).toBe("symptomB");
    }

    // 5) 全体の構造と整合性
    expect(result.total_patterns).toBe(2);
    expect(result.max_priority_score).toBe(75);
    expect(result.min_priority_score).toBe(68);
    expect(result.is_consistent).toBe(true);

    // エッジケース検証: 空の要因
    const emptyFactors = {
      symptoms: [],
      affectedSegments: [],
      severity: 0,
      duration_days: 0,
      frequency: "none",
    };

    const emptyResult = calculatePriorityMatrix(emptyFactors);
    expect(emptyResult.patterns.length).toBe(0);
    expect(emptyResult.total_patterns).toBe(0);
    expect(emptyResult.is_consistent).toBe(true);

    // エッジケース検証: 単一要因
    const singleFactors = {
      symptoms: ["疲労"],
      affectedSegments: ["legs"],
      severity: 8,
      duration_days: 5,
      frequency: "daily",
    };

    const singleResult = calculatePriorityMatrix(singleFactors);
    expect(singleResult.patterns.length).toBe(1);
    expect(singleResult.patterns[0].priority_score).toBe(88);
    expect(singleResult.matrix.rows).toBe(1);
    expect(singleResult.is_consistent).toBe(true);

    // エッジケース検証: 最大複数パターン（5つまで）
    const multipleFactors = {
      symptoms: ["疲労", "筋肉痛", "頭痛", "倦怠感", "不眠"],
      affectedSegments: ["legs", "arms", "head", "neck", "back"],
      severity: 9,
      duration_days: 7,
      frequency: "daily",
    };

    const multipleResult = calculatePriorityMatrix(multipleFactors);
    expect(multipleResult.patterns.length).toBe(5);
    expect(multipleResult.total_patterns).toBe(5);

    // すべてのパターンが優先度スコアを持つ
    multipleResult.patterns.forEach((pattern) => {
      expect(pattern.priority_score).toBeGreaterThanOrEqual(0);
      expect(pattern.priority_score).toBeLessThanOrEqual(100);
    });

    // 優先度順が保証されている
    for (let i = 0; i < multipleResult.patterns.length - 1; i++) {
      expect(multipleResult.patterns[i].priority_score).toBeGreaterThanOrEqual(
        multipleResult.patterns[i + 1].priority_score
      );
    }

    // マトリクスの構造が正確
    expect(multipleResult.matrix.rows).toBe(5);
    expect(multipleResult.matrix.columns).toBe(2);
    expect(multipleResult.matrix.data.length).toBe(5);
    multipleResult.matrix.data.forEach((row) => {
      expect(row.length).toBe(2);
      expect(typeof row[0]).toBe("number");
      expect(typeof row[1]).toBe("number");
    });

    // 優先度スコアの整合性チェック
    expect(multipleResult.max_priority_score).toBe(
      multipleResult.patterns[0].priority_score
    );
    expect(multipleResult.min_priority_score).toBe(
      multipleResult.patterns[multipleResult.patterns.length - 1].priority_score
    );
    expect(multipleResult.is_consistent).toBe(true);
  });
});