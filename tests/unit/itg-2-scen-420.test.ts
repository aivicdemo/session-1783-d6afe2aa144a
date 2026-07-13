import { recordAuditLogForDietaryRestrictionChange, getAuditLogsForDietaryRestriction } from '../../src/logic/it-1-br-2-1-1-1';

describe('食事制限条件変更監査ログ記録機能', () => {
  // SCEN-420
  test('同一秒内の複数の食事制限条件変更がミリ秒精度の順序で記録される', async () => {
    const user_id = 'user_001';
    const base_timestamp = new Date('2024-01-15T10:30:45.000Z');
    const millisecond_offsets = [0, 100, 250, 500];
    const recorded_timestamps: string[] = [];

    // 同一秒内でミリ秒単位で異なるタイミングで複数の食事制限条件変更を記録
    for (const offset of millisecond_offsets) {
      const change_timestamp = new Date(base_timestamp.getTime() + offset);
      const audit_record = {
        user_id: user_id,
        restriction_type: 'gluten_free',
        change_description: `Gluten free restriction added at offset ${offset}ms`,
        recorded_at: change_timestamp.toISOString(),
        changer_user_id: 'operator_admin'
      };

      await recordAuditLogForDietaryRestrictionChange(audit_record);
      recorded_timestamps.push(change_timestamp.toISOString());
    }

    // 同一秒内に記録された複数の監査ログレコードを取得
    const audit_logs = await getAuditLogsForDietaryRestriction({
      user_id: user_id,
      start_date: new Date('2024-01-15T10:30:44.000Z'),
      end_date: new Date('2024-01-15T10:30:46.000Z')
    });

    // 取得したレコードの件数を検証
    expect(audit_logs.length).toBe(4);

    // 取得したレコードのタイムスタンプ（ミリ秒精度）を抽出
    const fetched_timestamps = audit_logs.map(log => log.recorded_at);

    // ミリ秒精度でのタイムスタンプが期待値と一致
    expect(fetched_timestamps[0]).toBe('2024-01-15T10:30:45.000Z');
    expect(fetched_timestamps[1]).toBe('2024-01-15T10:30:45.100Z');
    expect(fetched_timestamps[2]).toBe('2024-01-15T10:30:45.250Z');
    expect(fetched_timestamps[3]).toBe('2024-01-15T10:30:45.500Z');

    // 実行順序通りに昇順でソートされていることを検証
    for (let i = 0; i < fetched_timestamps.length - 1; i++) {
      const current_ms = new Date(fetched_timestamps[i]).getTime();
      const next_ms = new Date(fetched_timestamps[i + 1]).getTime();
      expect(current_ms).toBeLessThan(next_ms);
    }

    // タイムスタンプの重複がないことを検証
    const unique_timestamps = new Set(fetched_timestamps);
    expect(unique_timestamps.size).toBe(fetched_timestamps.length);

    // 各レコードの記録順序が一貫性を保つことを検証（複数回実行）
    for (let run = 0; run < 5; run++) {
      const recheck_logs = await getAuditLogsForDietaryRestriction({
        user_id: user_id,
        start_date: new Date('2024-01-15T10:30:44.000Z'),
        end_date: new Date('2024-01-15T10:30:46.000Z')
      });

      const recheck_timestamps = recheck_logs.map(log => log.recorded_at);
      expect(recheck_timestamps).toEqual(fetched_timestamps);
    }
  });
});