import { detectConflictingMenus } from '../../src/logic/it-1-br-2-1-1-1';

describe('ユーザーの食事記録と栄養摂取量の推移データを自動集計し、栄養項目別の達成度と改善ギャップを可視化するダッシュボード機能', () => {
  // SCEN-323
  test('新規制限条件に抵触する献立が100件以上ある場合、全件が一覧に含まれる', () => {
    const userId = 'user_001';
    const restrictionId = 'restriction_sodium_protein_strict';
    
    // 新規制限条件: 塩分1日上限2g、タンパク質1日上限30g
    const newRestriction = {
      restrictionId: restrictionId,
      userId: userId,
      sodiumDailyLimitG: 2,
      proteinDailyLimitG: 30,
      createdAt: new Date('2024-01-15T11:00:00Z'),
    };

    // テスト対象: 過去の献立履歴から制限に抵触する献立パターンを自動検出
    // 想定: 過去献立が150件存在し、そのうち125件が新規制限に抵触
    const result = detectConflictingMenus({
      userId: userId,
      restriction: newRestriction,
      historicalMenuCount: 150,
      conflictingMenuCount: 125,
      pageSize: 20,
    });

    // 期待値の検証
    // 1. 一覧に含まれる献立件数が制限抵触献立の総数と一致
    expect(result.totalConflictingMenuCount).toBe(125);

    // 2. ページネーション計算: 125件を1ページ20件で表示 → 必要ページ数 = ceil(125/20) = 7ページ
    const expectedPageCount = Math.ceil(125 / 20);
    expect(result.totalPageCount).toBe(7);

    // 3. 最終ページのアイテム数の検証
    // 最終ページ(7ページ目) = 125 - (6 * 20) = 5件
    const expectedLastPageItemCount = 125 - (6 * 20);
    expect(result.lastPageItemCount).toBe(5);

    // 4. ページネーションが有効（複数ページ存在）
    expect(result.paginationEnabled).toBe(true);
    expect(result.totalPageCount).toBeGreaterThan(1);

    // 5. 全ページを通じて表示される献立件数が制限抵触献立総件数と一致
    const totalDisplayedMenus = (result.totalPageCount - 1) * 20 + result.lastPageItemCount;
    expect(totalDisplayedMenus).toBe(125);

    // 6. 重複がないことを確認: 各ページの献立IDセットのサイズが一意
    expect(result.menuIdSetSize).toBe(125);
    expect(result.hasDuplicates).toBe(false);

    // 7. 優先度スコアが各抵触献立に付与されていることを確認
    expect(result.conflictingMenus.length).toBeGreaterThan(0);
    result.conflictingMenus.forEach((menu) => {
      expect(typeof menu.menuId).toBe('string');
      expect(typeof menu.priorityScore).toBe('number');
      expect(menu.priorityScore).toBeGreaterThanOrEqual(1);
      expect(menu.priorityScore).toBeLessThanOrEqual(10);
      expect(['低', '中', '高']).toContain(menu.riskLevel);
    });

    // 8. 制限抵触検出の監査ログが記録されていることを確認
    expect(result.auditLog).toBeDefined();
    expect(result.auditLog.restrictionId).toBe(restrictionId);
    expect(result.auditLog.userId).toBe(userId);
    expect(result.auditLog.timestamp).toBeDefined();
    expect(typeof result.auditLog.detectedConflictCount).toBe('number');
    expect(result.auditLog.detectedConflictCount).toBe(125);
  });
});