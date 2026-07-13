import { calculateCookingTimeImprovement } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザー食事記録と栄養摂取量の推移データ自動集計・ダッシュボード可視化', () => {
  // SCEN-574
  test('調理時間短縮度が負の値で返された場合にエラーハンドリングされる', () => {
    const beforeCookingTime = 45; // 改善前：45分
    const afterCookingTime = 60; // 改善後：60分（短縮されずに増加）
    const targetImprovementRate = 0.2; // 目標改善率：20%

    // 調理時間が増加した（短縮されなかった）場合、負の短縮度を生成
    expect(() => {
      calculateCookingTimeImprovement({
        beforeCookingTime,
        afterCookingTime,
        targetImprovementRate,
      });
    }).toThrow(/調理時間短縮度/);
  });

  test('調理時間短縮度が正の値で正常に計算される', () => {
    const beforeCookingTime = 60; // 改善前：60分
    const afterCookingTime = 45; // 改善後：45分（15分短縮）
    const targetImprovementRate = 0.2; // 目標改善率：20%

    const result = calculateCookingTimeImprovement({
      beforeCookingTime,
      afterCookingTime,
      targetImprovementRate,
    });

    // 短縮度 = (改善前 - 改善後) / 改善前 = (60 - 45) / 60 = 0.25 (25%)
    expect(result.improvementRate).toBe(0.25);
    expect(result.improvementMinutes).toBe(15);
    expect(result.meetsTarget).toBe(true); // 25% >= 20%
  });

  test('調理時間短縮度が 0 の場合（改善なし）', () => {
    const beforeCookingTime = 50;
    const afterCookingTime = 50; // 変化なし
    const targetImprovementRate = 0.15;

    const result = calculateCookingTimeImprovement({
      beforeCookingTime,
      afterCookingTime,
      targetImprovementRate,
    });

    // 短縮度 = (50 - 50) / 50 = 0 (0%)
    expect(result.improvementRate).toBe(0);
    expect(result.improvementMinutes).toBe(0);
    expect(result.meetsTarget).toBe(false); // 0% < 15%
  });

  test('不正な入力値（ゼロ以下の調理時間）でエラーハンドリングされる', () => {
    expect(() => {
      calculateCookingTimeImprovement({
        beforeCookingTime: 0,
        afterCookingTime: 30,
        targetImprovementRate: 0.2,
      });
    }).toThrow(/調理時間/);
  });

  test('改善率が目標を大きく上回る場合の計算', () => {
    const beforeCookingTime = 120; // 改善前：120分
    const afterCookingTime = 30; // 改善後：30分（90分短縮）
    const targetImprovementRate = 0.3; // 目標改善率：30%

    const result = calculateCookingTimeImprovement({
      beforeCookingTime,
      afterCookingTime,
      targetImprovementRate,
    });

    // 短縮度 = (120 - 30) / 120 = 0.75 (75%)
    expect(result.improvementRate).toBe(0.75);
    expect(result.improvementMinutes).toBe(90);
    expect(result.meetsTarget).toBe(true); // 75% >= 30%
  });
});