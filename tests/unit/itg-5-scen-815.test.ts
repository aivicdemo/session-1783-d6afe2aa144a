import { determineVariablePriorityOrder } from "../../src/logic/it-7-2-1";

describe("外部要因変数の優先度マトリクス配置と優先度判定", () => {
  // SCEN-815: 影響度と実装難度が同一値の複数変数が同じマトリクス位置に配置される場合、優先度判定が正確に行われる
  test("同一マトリクス位置の複数変数に対して副次的判定条件により一貫した優先度順序が決定される", () => {
    // テストデータ: 影響度5、実装難度3で同一マトリクス位置に配置される3つの外部要因変数
    const variables = [
      {
        id: "var_001",
        name: "気象_降雨量",
        impact: 5,
        implementationDifficulty: 3,
        registrationOrder: 1,
        description: "需要予測への降雨量の影響度を測定",
      },
      {
        id: "var_002",
        name: "イベント_セール",
        impact: 5,
        implementationDifficulty: 3,
        registrationOrder: 2,
        description: "セールイベントが購買需要に与える影響",
      },
      {
        id: "var_003",
        name: "競合施策_割引",
        impact: 5,
        implementationDifficulty: 3,
        registrationOrder: 3,
        description: "競合店舗の割引施策による需要変動",
      },
    ];

    // 第1回実行: 優先度順序を決定
    const firstResult = determineVariablePriorityOrder(variables);

    // 第1回の検証
    expect(firstResult).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          priorityRank: expect.any(Number),
          matrixPosition: expect.objectContaining({
            impact: 5,
            implementationDifficulty: 3,
          }),
          secondaryRankingBasis: expect.any(String),
        }),
      ])
    );

    // 同一マトリクス位置の3変数がすべて結果に含まれることを確認
    expect(firstResult.length).toBe(3);

    // マトリクス位置の確認（すべて同一位置）
    const allSamePosition = firstResult.every(
      (v) =>
        v.matrixPosition.impact === 5 &&
        v.matrixPosition.implementationDifficulty === 3
    );
    expect(allSamePosition).toBe(true);

    // 優先度ランクが異なることを確認（副次条件により区別されている）
    const priorityRanks = firstResult.map((v) => v.priorityRank);
    const uniqueRanks = new Set(priorityRanks);
    expect(uniqueRanks.size).toBe(3);

    // priorityRank が昇順であることを確認
    expect(firstResult[0].priorityRank).toBeLessThan(
      firstResult[1].priorityRank
    );
    expect(firstResult[1].priorityRank).toBeLessThan(
      firstResult[2].priorityRank
    );

    // 副次的判定条件（registrationOrder）に基づいて優先度が決定されていることを確認
    expect(firstResult[0].id).toBe("var_001");
    expect(firstResult[1].id).toBe("var_002");
    expect(firstResult[2].id).toBe("var_003");

    // 副次的ランキング根拠がすべて記録されていることを確認
    firstResult.forEach((result) => {
      expect(result.secondaryRankingBasis).toMatch(/registration|order|id/i);
    });

    // 第2回実行: 再現性を確認
    const secondResult = determineVariablePriorityOrder(variables);

    // 第2回の結果が第1回と完全に一致することを確認
    expect(secondResult).toEqual(firstResult);

    // 優先度ランクが再現可能であることを確認
    secondResult.forEach((result, index) => {
      expect(result.priorityRank).toBe(firstResult[index].priorityRank);
      expect(result.id).toBe(firstResult[index].id);
    });

    // 第3回実行: さらに再現性と安定性を検証
    const thirdResult = determineVariablePriorityOrder(variables);

    // ID順序が安定していることを確認
    const idSequence = thirdResult.map((v) => v.id);
    expect(idSequence).toEqual(["var_001", "var_002", "var_003"]);

    // すべての実行結果で同一マトリクス位置が維持されていることを確認
    thirdResult.forEach((result) => {
      expect(result.matrixPosition.impact).toBe(5);
      expect(result.matrixPosition.implementationDifficulty).toBe(3);
    });

    // 優先度判定結果の一貫性を確認（3回すべてで同じ順序）
    const allResultsConsistent =
      JSON.stringify(firstResult) === JSON.stringify(secondResult) &&
      JSON.stringify(secondResult) === JSON.stringify(thirdResult);
    expect(allResultsConsistent).toBe(true);

    // 各変数に対して優先度判定が実行されたことを確認（決定理由が存在）
    firstResult.forEach((result) => {
      expect(result.priorityRank).toBeGreaterThanOrEqual(1);
      expect(result.priorityRank).toBeLessThanOrEqual(3);
      expect(result.secondaryRankingBasis).toBeTruthy();
      expect(result.secondaryRankingBasis.length).toBeGreaterThan(0);
    });
  });
});