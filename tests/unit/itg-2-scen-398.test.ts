// tests/unit/itg-2-scen-398.test.ts
import { generatePeriodicNotifications } from '../../src/logic/it-1-br-2-1-2-1';

describe('栄養士からの改善提案を優先度付けして管理し、開発チームに定期通知する機能', () => {
  // SCEN-398
  test('改善提案が0件の場合に空の通知リストが正しく生成される', () => {
    // Precondition: 改善提案データベースが空の状態
    const emptyImprovementProposals: any[] = [];
    const userId = 'user-001';
    const notificationTimestamp = new Date('2024-01-15T09:00:00Z');

    // Action: 定期通知生成関数を呼び出す
    const result = generatePeriodicNotifications({
      improvementProposals: emptyImprovementProposals,
      userId: userId,
      executedAt: notificationTimestamp,
    });

    // Assertion 1: 生成された通知リストの件数が0
    expect(result).toEqual([]);
    expect(result.length).toBe(0);

    // Assertion 2: 通知リストのデータ構造が正しい空配列形式
    expect(Array.isArray(result)).toBe(true);

    // Assertion 3: 通知リストに不正なnull値やundefinedが含まれていない
    expect(result.some((item) => item === null)).toBe(false);
    expect(result.some((item) => item === undefined)).toBe(false);

    // Assertion 4: 結果がarray型であり、length プロパティが0
    expect(typeof result).toBe('object');
    expect(Array.isArray(result)).toBe(true);
    expect(Object.keys(result).length).toBe(0);
  });
});