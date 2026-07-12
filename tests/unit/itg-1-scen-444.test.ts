import { generateMenuAfterAlgorithmDeploy } from '../../src/logic/it-3';

describe('アルゴリズム統合・デプロイ実行後の献立生成キャッシュクリア検証', () => {
  // SCEN-444
  test('デプロイ完了直後に新アルゴリズムが即座に適用され、旧キャッシュが完全にクリアされること', () => {
    // 初期条件：家族の食事制限・アレルギー情報
    const familyConstraints = {
      familyMemberId: 'fm-001',
      allergies: ['卵', 'エビ'],
      dietaryRestrictions: ['ベジタリアン'],
      ageGroup: 'adult',
      preferredCuisines: ['和食', '洋食'],
    };

    // 冷蔵庫在庫情報
    const refrigeratorInventory = {
      ingredients: [
        { name: '鶏肉', quantity: 500, unit: 'g', expiryDate: '2024-12-31' },
        { name: '米', quantity: 5, unit: 'kg', expiryDate: '2025-03-15' },
        { name: '豆腐', quantity: 2, unit: 'パック', expiryDate: '2024-12-25' },
      ],
    };

    // 旧アルゴリズムでの献立生成（キャッシュに保存される想定）
    const oldAlgorithmMenuId = 'menu-old-v1-001';
    const oldAlgorithmMenu = {
      id: oldAlgorithmMenuId,
      algorithmVersion: 'v1.0',
      dishes: [
        { dishName: '鶏肉炒め', nutritionScore: 72, cookingTimeMinutes: 25 },
        { dishName: '米ご飯', nutritionScore: 80, cookingTimeMinutes: 20 },
      ],
      totalNutritionScore: 76,
      totalCookingTimeMinutes: 45,
      caloriesKcal: 850,
      satisfactionScorePrediction: 65,
      generatedAt: '2024-12-20T09:00:00Z',
    };

    // 新アルゴリズムロジック（v2.0）のパラメータ
    const newAlgorithmVersion = 'v2.0';
    const deploymentTimestamp = '2024-12-20T14:00:00Z';

    // デプロイ実行後、新ロジックで同じ条件で献立を再度生成
    const regeneratedMenuAfterDeploy = generateMenuAfterAlgorithmDeploy({
      familyConstraints,
      refrigeratorInventory,
      previousMenuIdToAvoid: oldAlgorithmMenuId,
      deployedAlgorithmVersion: newAlgorithmVersion,
      deploymentTimestamp,
      budgetLimitYen: 3000,
      preferredCookingTimeMinutesMax: 60,
    });

    // 期待値：新アルゴリズムv2.0の献立内容
    // v2.0では栄養スコア・満足度予測が改善されている想定
    expect(regeneratedMenuAfterDeploy.algorithmVersion).toBe('v2.0');
    expect(regeneratedMenuAfterDeploy.id).not.toBe(oldAlgorithmMenuId);
    expect(regeneratedMenuAfterDeploy.totalNutritionScore).toBeGreaterThan(76);
    expect(regeneratedMenuAfterDeploy.satisfactionScorePrediction).toBeGreaterThan(65);
    expect(regeneratedMenuAfterDeploy.totalCookingTimeMinutes).toBeLessThanOrEqual(60);
    expect(regeneratedMenuAfterDeploy.generatedAt).not.toBe('2024-12-20T09:00:00Z');

    // キャッシュストレージの旧データが完全にクリアされていることを検証
    expect(regeneratedMenuAfterDeploy.cacheStatus).toBe('cleared');
    expect(regeneratedMenuAfterDeploy.previousCacheEntries).toEqual([]);
    expect(regeneratedMenuAfterDeploy.oldAlgorithmDataPreserved).toBe(false);

    // 新アルゴリズムの栄養基準適用状況を検証
    expect(regeneratedMenuAfterDeploy.nutritionCompliance.proteinGramMin).toBe(50);
    expect(regeneratedMenuAfterDeploy.nutritionCompliance.fiberGramMin).toBe(20);
    expect(regeneratedMenuAfterDeploy.nutritionCompliance.sodiumMgMax).toBe(2300);

    // デプロイ後の複数回生成テスト：2回目の生成でも新ロジックが適用される
    const secondGenerationAfterDeploy = generateMenuAfterAlgorithmDeploy({
      familyConstraints,
      refrigeratorInventory,
      previousMenuIdToAvoid: regeneratedMenuAfterDeploy.id,
      deployedAlgorithmVersion: newAlgorithmVersion,
      deploymentTimestamp,
      budgetLimitYen: 3000,
      preferredCookingTimeMinutesMax: 60,
    });

    expect(secondGenerationAfterDeploy.algorithmVersion).toBe('v2.0');
    expect(secondGenerationAfterDeploy.id).not.toBe(regeneratedMenuAfterDeploy.id);
    expect(secondGenerationAfterDeploy.id).not.toBe(oldAlgorithmMenuId);
    expect(secondGenerationAfterDeploy.cacheStatus).toBe('cleared');

    // 3回目の生成でも新ロジックが一貫して適用される
    const thirdGenerationAfterDeploy = generateMenuAfterAlgorithmDeploy({
      familyConstraints,
      refrigeratorInventory,
      previousMenuIdToAvoid: secondGenerationAfterDeploy.id,
      deployedAlgorithmVersion: newAlgorithmVersion,
      deploymentTimestamp,
      budgetLimitYen: 3000,
      preferredCookingTimeMinutesMax: 60,
    });

    expect(thirdGenerationAfterDeploy.algorithmVersion).toBe('v2.0');
    expect(thirdGenerationAfterDeploy.cacheStatus).toBe('cleared');
    expect(thirdGenerationAfterDeploy.totalNutritionScore).toBeGreaterThan(76);

    // キャッシュストレージダンプ確認：旧v1.0データが全く残っていない
    const cacheSnapshot = regeneratedMenuAfterDeploy.cacheSnapshot;
    expect(cacheSnapshot.v1_0_entries).toEqual([]);
    expect(cacheSnapshot.v2_0_entries.length).toBeGreaterThan(0);
    expect(cacheSnapshot.lastClearTimestamp).toBe(deploymentTimestamp);

    // 旧キャッシュの同一メニューIDが新キャッシュに存在しないことを確認
    const menuIdsInNewCache = cacheSnapshot.v2_0_entries.map((entry: any) => entry.id);
    expect(menuIdsInNewCache).not.toContain(oldAlgorithmMenuId);

    // デプロイ前後のアルゴリズムバージョン境界を明確に分離
    expect(regeneratedMenuAfterDeploy.deploymentMarkerVersion).toBe('v2.0');
    expect(regeneratedMenuAfterDeploy.priorAlgorithmVersion).toBe('v1.0');
    expect(regeneratedMenuAfterDeploy.versionTransitionOccurredAt).toBe(deploymentTimestamp);
  });
});