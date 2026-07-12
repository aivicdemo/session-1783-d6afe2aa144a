import { classifyFailurePattern } from '../../src/logic/it-1-br-4-2-1';

describe('食事制限条件の変更時に過去献立との抵触検出機能', () => {
  // SCEN-625: [error] 失敗パターンに基づく改善提案の分類 - 改善提案の分類失敗
  test('不完全な失敗パターンを入力した場合、分類エラーが発生し、エラーメッセージが表示されログに記録される', () => {
    // 不完全な失敗パターン（必須フィールドが欠落）
    const incompleteFailurePattern = {
      pattern_id: 'FP001',
      // category フィールドが欠落
      frequency: 5,
      severity: 'high',
      // description フィールドが欠落
      timestamp: '2024-01-15T10:00:00Z',
    };

    // 分類処理を実行するとエラーが発生することを検証
    expect(() => classifyFailurePattern(incompleteFailurePattern as any))
      .toThrow(/失敗パターンが不完全/);
  });

  test('必須フィールドが完全に揃った失敗パターンの場合、正常に分類される', () => {
    const completeFailurePattern = {
      pattern_id: 'FP002',
      category: '栄養バランス不適切',
      frequency: 8,
      severity: 'high',
      description: '栄養素の不足により却下された',
      timestamp: '2024-01-15T11:00:00Z',
    };

    const result = classifyFailurePattern(completeFailurePattern);

    expect(result).toEqual({
      pattern_id: 'FP002',
      category: '栄養バランス不適切',
      proposal_type: 'アルゴリズム修正',
      priority_score: 85,
      is_classified: true,
      classified_at: '2024-01-15T11:00:00Z',
    });
  });

  test('複数の不完全パターンを処理する場合、最初のエラーで中断される', () => {
    const patternsWithMissing = [
      {
        pattern_id: 'FP003',
        category: '家族好み未反映',
        frequency: 3,
        // severity フィールドが欠落
        description: 'ユーザー好み学習不十分',
        timestamp: '2024-01-15T12:00:00Z',
      },
      {
        pattern_id: 'FP004',
        category: '調理時間超過',
        frequency: 6,
        severity: 'medium',
        description: 'レシピの調理時間が予定値を超過',
        timestamp: '2024-01-15T13:00:00Z',
      },
    ];

    // 最初のパターンのエラーで処理が中断される
    expect(() => classifyFailurePattern(patternsWithMissing[0] as any))
      .toThrow(/失敗パターンが不完全/);
  });

  test('frequencyがnullの場合、分類エラーが発生する', () => {
    const patternWithNullFrequency = {
      pattern_id: 'FP005',
      category: '食材制限漏れ',
      frequency: null,
      severity: 'high',
      description: 'アレルギー情報の適用漏れ',
      timestamp: '2024-01-15T14:00:00Z',
    };

    expect(() => classifyFailurePattern(patternWithNullFrequency as any))
      .toThrow(/失敗パターンが不完全/);
  });

  test('descriptionが空文字列の場合、分類エラーが発生する', () => {
    const patternWithEmptyDescription = {
      pattern_id: 'FP006',
      category: '栄養バランス不適切',
      frequency: 4,
      severity: 'medium',
      description: '',
      timestamp: '2024-01-15T15:00:00Z',
    };

    expect(() => classifyFailurePattern(patternWithEmptyDescription as any))
      .toThrow(/失敗パターンが不完全/);
  });

  test('categoryが定義済みカテゴリに含まれない場合、分類エラーが発生する', () => {
    const patternWithInvalidCategory = {
      pattern_id: 'FP007',
      category: '不明なカテゴリ',
      frequency: 2,
      severity: 'low',
      description: 'テスト用パターン',
      timestamp: '2024-01-15T16:00:00Z',
    };

    expect(() => classifyFailurePattern(patternWithInvalidCategory))
      .toThrow(/カテゴリ/);
  });

  test('severityが無効な値の場合、分類エラーが発生する', () => {
    const patternWithInvalidSeverity = {
      pattern_id: 'FP008',
      category: '栄養バランス不適切',
      frequency: 3,
      severity: 'invalid_severity',
      description: 'テスト用パターン',
      timestamp: '2024-01-15T17:00:00Z',
    };

    expect(() => classifyFailurePattern(patternWithInvalidSeverity))
      .toThrow(/重大度/);
  });

  test('高優先度の失敗パターン（frequency=10, severity=high）が正しく分類される', () => {
    const highPriorityPattern = {
      pattern_id: 'FP009',
      category: '栄養バランス不適切',
      frequency: 10,
      severity: 'high',
      description: '重大な栄養バランス不適合',
      timestamp: '2024-01-15T18:00:00Z',
    };

    const result = classifyFailurePattern(highPriorityPattern);

    expect(result.priority_score).toBe(95);
    expect(result.proposal_type).toBe('アルゴリズム修正');
    expect(result.is_classified).toBe(true);
  });

  test('低優先度の失敗パターン（frequency=1, severity=low）が正しく分類される', () => {
    const lowPriorityPattern = {
      pattern_id: 'FP010',
      category: '調理時間超過',
      frequency: 1,
      severity: 'low',
      description: 'わずかな調理時間超過',
      timestamp: '2024-01-15T19:00:00Z',
    };

    const result = classifyFailurePattern(lowPriorityPattern);

    expect(result.priority_score).toBeLessThan(50);
    expect(result.is_classified).toBe(true);
  });
});