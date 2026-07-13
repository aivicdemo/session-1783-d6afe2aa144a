import { analyzeDeviationsByCategory, generateImprovementProposals } from '../../src/logic/it-1-br-2-1-1-1';

describe('需要予測精度の乖離分析と自動改善提案生成', () => {
  // SCEN-367: [normal] 需要予測精度の乖離分析と自動改善提案生成 - カテゴリ別・時期別の誤差パターンが正しく集計される
  test('カテゴリ別・時期別の誤差パターンが正しく集計され、改善提案が生成される', () => {
    // 予測データと実績データの準備
    const predictionData = [
      // 野菜 - 春
      { category: '野菜', season: '春', predicted_value: 100, actual_value: 95 },
      { category: '野菜', season: '春', predicted_value: 110, actual_value: 105 },
      { category: '野菜', season: '春', predicted_value: 105, actual_value: 102 },
      // 野菜 - 夏
      { category: '野菜', season: '夏', predicted_value: 120, actual_value: 130 },
      { category: '野菜', season: '夏', predicted_value: 125, actual_value: 135 },
      { category: '野菜', season: '夏', predicted_value: 130, actual_value: 140 },
      // 肉類 - 春
      { category: '肉類', season: '春', predicted_value: 80, actual_value: 82 },
      { category: '肉類', season: '春', predicted_value: 85, actual_value: 87 },
      { category: '肉類', season: '春', predicted_value: 90, actual_value: 92 },
      // 肉類 - 夏
      { category: '肉類', season: '夏', predicted_value: 100, actual_value: 95 },
      { category: '肉類', season: '夏', predicted_value: 105, actual_value: 100 },
      { category: '肉類', season: '夏', predicted_value: 110, actual_value: 105 },
      // 乳製品 - 春
      { category: '乳製品', season: '春', predicted_value: 50, actual_value: 48 },
      { category: '乳製品', season: '春', predicted_value: 55, actual_value: 53 },
      // 乳製品 - 夏
      { category: '乳製品', season: '夏', predicted_value: 60, actual_value: 75 },
      { category: '乳製品', season: '夏', predicted_value: 65, actual_value: 80 },
      // 秋データ
      { category: '野菜', season: '秋', predicted_value: 115, actual_value: 110 },
      { category: '野菜', season: '秋', predicted_value: 120, actual_value: 115 },
      { category: '肉類', season: '秋', predicted_value: 95, actual_value: 93 },
      { category: '乳製品', season: '秋', predicted_value: 58, actual_value: 60 },
      // 冬データ
      { category: '野菜', season: '冬', predicted_value: 105, actual_value: 100 },
      { category: '肉類', season: '冬', predicted_value: 110, actual_value: 115 },
      { category: '乳製品', season: '冬', predicted_value: 70, actual_value: 72 },
    ];

    // カテゴリ別・時期別の誤差パターンを分析
    const deviationAnalysis = analyzeDeviationsByCategory(predictionData);

    // カテゴリ別の集計検証
    expect(deviationAnalysis.by_category).toBeDefined();
    
    // 野菜カテゴリの検証
    // 野菜データ: 春 [-5, -5, -3], 夏 [10, 10, 10], 秋 [-5, -5], 冬 [-5]
    // 全誤差: [-5, -5, -3, 10, 10, 10, -5, -5, -5] = 合計 -8, 平均 -0.889
    expect(deviationAnalysis.by_category.野菜).toBeDefined();
    expect(deviationAnalysis.by_category.野菜.mean_deviation).toBeCloseTo(-0.889, 2);
    expect(deviationAnalysis.by_category.野菜.max_deviation).toBe(10);
    expect(deviationAnalysis.by_category.野菜.min_deviation).toBe(-5);
    expect(deviationAnalysis.by_category.野菜.sample_count).toBe(9);

    // 肉類カテゴリの検証
    // 肉類データ: 春 [2, 2, 2], 夏 [-5, -5, -5], 秋 [-2], 冬 [5]
    // 全誤差: [2, 2, 2, -5, -5, -5, -2, 5] = 合計 -6, 平均 -0.75
    expect(deviationAnalysis.by_category.肉類).toBeDefined();
    expect(deviationAnalysis.by_category.肉類.mean_deviation).toBeCloseTo(-0.75, 2);
    expect(deviationAnalysis.by_category.肉類.max_deviation).toBe(5);
    expect(deviationAnalysis.by_category.肉類.min_deviation).toBe(-5);
    expect(deviationAnalysis.by_category.肉類.sample_count).toBe(8);

    // 乳製品カテゴリの検証
    // 乳製品データ: 春 [-2, -2], 夏 [15, 15], 秋 [2], 冬 [2]
    // 全誤差: [-2, -2, 15, 15, 2, 2] = 合計 30, 平均 5.0
    expect(deviationAnalysis.by_category.乳製品).toBeDefined();
    expect(deviationAnalysis.by_category.乳製品.mean_deviation).toBe(5.0);
    expect(deviationAnalysis.by_category.乳製品.max_deviation).toBe(15);
    expect(deviationAnalysis.by_category.乳製品.min_deviation).toBe(-2);
    expect(deviationAnalysis.by_category.乳製品.sample_count).toBe(6);

    // 時期別の集計検証
    expect(deviationAnalysis.by_season).toBeDefined();

    // 春の検証
    // 春データ: 野菜 [-5, -5, -3], 肉類 [2, 2, 2], 乳製品 [-2, -2]
    // 全誤差: [-5, -5, -3, 2, 2, 2, -2, -2] = 合計 -11, 平均 -1.375
    expect(deviationAnalysis.by_season.春).toBeDefined();
    expect(deviationAnalysis.by_season.春.mean_deviation).toBeCloseTo(-1.375, 2);
    expect(deviationAnalysis.by_season.春.max_deviation).toBe(2);
    expect(deviationAnalysis.by_season.春.min_deviation).toBe(-5);
    expect(deviationAnalysis.by_season.春.sample_count).toBe(8);

    // 夏の検証
    // 夏データ: 野菜 [10, 10, 10], 肉類 [-5, -5, -5], 乳製品 [15, 15]
    // 全誤差: [10, 10, 10, -5, -5, -5, 15, 15] = 合計 45, 平均 5.625
    expect(deviationAnalysis.by_season.夏).toBeDefined();
    expect(deviationAnalysis.by_season.夏.mean_deviation).toBeCloseTo(5.625, 2);
    expect(deviationAnalysis.by_season.夏.max_deviation).toBe(15);
    expect(deviationAnalysis.by_season.夏.min_deviation).toBe(-5);
    expect(deviationAnalysis.by_season.夏.sample_count).toBe(8);

    // 秋の検証
    // 秋データ: 野菜 [-5, -5], 肉類 [-2], 乳製品 [2]
    // 全誤差: [-5, -5, -2, 2] = 合計 -10, 平均 -2.5
    expect(deviationAnalysis.by_season.秋).toBeDefined();
    expect(deviationAnalysis.by_season.秋.mean_deviation).toBe(-2.5);
    expect(deviationAnalysis.by_season.秋.max_deviation).toBe(2);
    expect(deviationAnalysis.by_season.秋.min_deviation).toBe(-5);
    expect(deviationAnalysis.by_season.秋.sample_count).toBe(4);

    // 冬の検証
    // 冬データ: 野菜 [-5], 肉類 [5], 乳製品 [2]
    // 全誤差: [-5, 5, 2] = 合計 2, 平均 0.667
    expect(deviationAnalysis.by_season.冬).toBeDefined();
    expect(deviationAnalysis.by_season.冬.mean_deviation).toBeCloseTo(0.667, 2);
    expect(deviationAnalysis.by_season.冬.max_deviation).toBe(5);
    expect(deviationAnalysis.by_season.冬.min_deviation).toBe(-5);
    expect(deviationAnalysis.by_season.冬.sample_count).toBe(3);

    // クロス集計の検証（カテゴリ×時期）
    expect(deviationAnalysis.by_category_season).toBeDefined();
    
    // 野菜×春
    expect(deviationAnalysis.by_category_season['野菜_春']).toBeDefined();
    expect(deviationAnalysis.by_category_season['野菜_春'].mean_deviation).toBeCloseTo(-4.333, 2);
    expect(deviationAnalysis.by_category_season['野菜_春'].sample_count).toBe(3);
    
    // 野菜×夏
    expect(deviationAnalysis.by_category_season['野菜_夏']).toBeDefined();
    expect(deviationAnalysis.by_category_season['野菜_夏'].mean_deviation).toBe(10);
    expect(deviationAnalysis.by_category_season['野菜_夏'].sample_count).toBe(3);
    
    // 乳製品×夏
    expect(deviationAnalysis.by_category_season['乳製品_夏']).toBeDefined();
    expect(deviationAnalysis.by_category_season['乳製品_夏'].mean_deviation).toBe(15);
    expect(deviationAnalysis.by_category_season['乳製品_夏'].sample_count).toBe(2);

    // 標準偏差の検証（野菜全体）
    // 誤差: [-5, -5, -3, 10, 10, 10, -5, -5, -5]
    // 平均: -0.889
    // 分散: ((-5-(-0.889))^2 + (-5-(-0.889))^2 + ... ) / 9 ≈ 55.432
    // 標準偏差: √55.432 ≈ 7.445
    expect(deviationAnalysis.by_category.野菜.std_deviation).toBeCloseTo(7.445, 1);

    // 自動改善提案の生成
    const improvementProposals = generateImprovementProposals(deviationAnalysis);

    // 改善提案が生成されていることを確認
    expect(improvementProposals).toBeDefined();
    expect(Array.isArray(improvementProposals.proposals)).toBe(true);
    expect(improvementProposals.proposals.length).toBeGreaterThan(0);

    // 提案内容の構造を検証
    improvementProposals.proposals.forEach((proposal: any) => {
      expect(proposal).toHaveProperty('target_category');
      expect(proposal).toHaveProperty('target_season');
      expect(proposal).toHaveProperty('deviation_characteristic');
      expect(proposal).toHaveProperty('recommended_action');
      expect(proposal).toHaveProperty('priority_score');
      expect(typeof proposal.priority_score).toBe('number');
      expect(proposal.priority_score).toBeGreaterThanOrEqual(1);
      expect(proposal.priority_score).toBeLessThanOrEqual(10);
    });

    // 乳製品×夏の高誤差パターンに関する提案が含まれることを確認
    const dairyProposal = improvementProposals.proposals.find(
      (p: any) => p.target_category === '乳製品' && p.target_season === '夏'
    );
    expect(dairyProposal).toBeDefined();
    expect(dairyProposal.deviation_characteristic).toMatch(/過剰予測|オーバー|高い誤差/);
    expect(dairyProposal.priority_score).toBeGreaterThanOrEqual(8);

    // 野菜×夏の高誤差パターンに関する提案が含まれることを確認
    const vegetableProposal = improvementProposals.proposals.find(
      (p: any) => p.target_category === '野菜' && p.target_season === '夏'
    );
    expect(vegetableProposal).toBeDefined();
    expect(vegetableProposal.deviation_characteristic).toMatch(/過剰予測|オーバー|高い誤差/);
    expect(vegetableProposal.priority_score).toBeGreaterThanOrEqual(7);

    // 肉類×夏の予測不足パターンに関する提案が含まれることを確認
    const meatProposal = improvementProposals.proposals.find(
      (p: any) => p.target_category === '肉類' && p.target_season === '夏'
    );
    expect(meatProposal).toBeDefined();
    expect(meatProposal.deviation_characteristic).toMatch(/過小予測|アンダー|低い誤差/);

    // 生成された提案の数が適切であることを確認
    // 誤差パターンが明確なカテゴリ×時期の組み合わせから提案が生成されるべき
    expect(improvementProposals.proposals.length).toBeGreaterThanOrEqual(5);
    expect(improvementProposals.proposals.length).toBeLessThanOrEqual(15);

    // 提案の集計結果構造を検証
    expect(improvementProposals).toHaveProperty('total_proposals');
    expect(improvementProposals.total_proposals).toBe(improvementProposals.proposals.length);
    expect(improvementProposals).toHaveProperty('analysis_timestamp');
    expect(typeof improvementProposals.analysis_timestamp).toBe('string');
    expect(new Date(improvementProposals.analysis_timestamp).getTime()).toBeGreaterThan(0);

    // 提案の優先度スコア分布を検証
    const priorityScores = improvementProposals.proposals.map((p: any) => p.priority_score);
    const maxPriority = Math.max(...priorityScores);
    const minPriority = Math.min(...priorityScores);
    expect(maxPriority).toBeGreaterThan(minPriority);

    // 高誤差パターンほど優先度が高くなっていることを確認
    expect(dairyProposal.priority_score).toBeGreaterThan(
      improvementProposals.proposals.find(
        (p: any) => p.target_category === '肉類' && p.target_season === '冬'
      )?.priority_score || 0
    );
  });
});