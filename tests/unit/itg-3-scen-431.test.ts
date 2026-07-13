import { aggregatePriceInventoryData } from '../../src/logic/it-1-br-6-2-1-1';

describe('食材流通業者・スーパーの在庫・価格データ連携インターフェース', () => {
  // SCEN-431
  test('複数の流通業者・スーパーから最新の在庫・価格データが正確に集計される', () => {
    const mockSupplierDataA = [
      {
        supplierId: 'supplier_A',
        supplierName: '業者A',
        itemId: 'item_001',
        itemName: 'トマト',
        price: 150,
        quantity: 100,
        updatedAt: new Date('2024-01-15T10:00:00Z'),
      },
      {
        supplierId: 'supplier_A',
        supplierName: '業者A',
        itemId: 'item_002',
        itemName: 'きゅうり',
        price: 120,
        quantity: 80,
        updatedAt: new Date('2024-01-15T10:00:00Z'),
      },
    ];

    const mockSupplierDataB = [
      {
        supplierId: 'supplier_B',
        supplierName: '業者B',
        itemId: 'item_001',
        itemName: 'トマト',
        price: 145,
        quantity: 120,
        updatedAt: new Date('2024-01-15T11:30:00Z'),
      },
      {
        supplierId: 'supplier_B',
        supplierName: '業者B',
        itemId: 'item_003',
        itemName: 'たまねぎ',
        price: 90,
        quantity: 150,
        updatedAt: new Date('2024-01-15T11:30:00Z'),
      },
    ];

    const mockSupplierDataC = [
      {
        supplierId: 'supplier_C',
        supplierName: '業者C',
        itemId: 'item_001',
        itemName: 'トマト',
        price: 155,
        quantity: 90,
        updatedAt: new Date('2024-01-15T09:45:00Z'),
      },
      {
        supplierId: 'supplier_C',
        supplierName: '業者C',
        itemId: 'item_002',
        itemName: 'きゅうり',
        price: 125,
        quantity: 70,
        updatedAt: new Date('2024-01-15T09:45:00Z'),
      },
    ];

    const mockSupermarketDataX = [
      {
        supermarketId: 'supermarket_X',
        supermarketName: 'スーパーX',
        itemId: 'item_001',
        itemName: 'トマト',
        price: 160,
        quantity: 60,
        updatedAt: new Date('2024-01-15T12:00:00Z'),
      },
      {
        supermarketId: 'supermarket_X',
        supermarketName: 'スーパーX',
        itemId: 'item_004',
        itemName: 'にんじん',
        price: 110,
        quantity: 200,
        updatedAt: new Date('2024-01-15T12:00:00Z'),
      },
    ];

    const mockSupermarketDataY = [
      {
        supermarketId: 'supermarket_Y',
        supermarketName: 'スーパーY',
        itemId: 'item_002',
        itemName: 'きゅうり',
        price: 130,
        quantity: 75,
        updatedAt: new Date('2024-01-15T11:15:00Z'),
      },
      {
        supermarketId: 'supermarket_Y',
        supermarketName: 'スーパーY',
        itemId: 'item_003',
        itemName: 'たまねぎ',
        price: 95,
        quantity: 140,
        updatedAt: new Date('2024-01-15T11:15:00Z'),
      },
    ];

    const allSourcesData = [
      ...mockSupplierDataA,
      ...mockSupplierDataB,
      ...mockSupplierDataC,
      ...mockSupermarketDataX,
      ...mockSupermarketDataY,
    ];

    const result = aggregatePriceInventoryData(allSourcesData);

    expect(result).toBeDefined();
    expect(Array.isArray(result.aggregatedItems)).toBe(true);

    const aggregatedItems = result.aggregatedItems;
    expect(aggregatedItems.length).toBe(5);

    const tomato = aggregatedItems.find((item) => item.itemId === 'item_001');
    expect(tomato).toBeDefined();
    expect(tomato?.itemName).toBe('トマト');
    expect(tomato?.sourceCount).toBe(4);
    expect(tomato?.prices).toContainEqual({ source: 'supplier_A', price: 150 });
    expect(tomato?.prices).toContainEqual({ source: 'supplier_B', price: 145 });
    expect(tomato?.prices).toContainEqual({ source: 'supplier_C', price: 155 });
    expect(tomato?.prices).toContainEqual({ source: 'supermarket_X', price: 160 });
    expect(tomato?.averagePrice).toBe(152.5);
    expect(tomato?.minPrice).toBe(145);
    expect(tomato?.maxPrice).toBe(160);
    expect(tomato?.inventories).toContainEqual({ source: 'supplier_A', quantity: 100 });
    expect(tomato?.inventories).toContainEqual({ source: 'supplier_B', quantity: 120 });
    expect(tomato?.inventories).toContainEqual({ source: 'supplier_C', quantity: 90 });
    expect(tomato?.inventories).toContainEqual({ source: 'supermarket_X', quantity: 60 });
    expect(tomato?.totalInventory).toBe(370);
    expect(tomato?.latestUpdatedAt).toEqual(new Date('2024-01-15T12:00:00Z'));

    const cucumber = aggregatedItems.find((item) => item.itemId === 'item_002');
    expect(cucumber).toBeDefined();
    expect(cucumber?.itemName).toBe('きゅうり');
    expect(cucumber?.sourceCount).toBe(3);
    expect(cucumber?.averagePrice).toBe(125);
    expect(cucumber?.minPrice).toBe(120);
    expect(cucumber?.maxPrice).toBe(130);
    expect(cucumber?.totalInventory).toBe(225);

    const onion = aggregatedItems.find((item) => item.itemId === 'item_003');
    expect(onion).toBeDefined();
    expect(onion?.itemName).toBe('たまねぎ');
    expect(onion?.sourceCount).toBe(2);
    expect(onion?.averagePrice).toBe(92.5);
    expect(onion?.minPrice).toBe(90);
    expect(onion?.maxPrice).toBe(95);
    expect(onion?.totalInventory).toBe(290);

    const carrot = aggregatedItems.find((item) => item.itemId === 'item_004');
    expect(carrot).toBeDefined();
    expect(carrot?.itemName).toBe('にんじん');
    expect(carrot?.sourceCount).toBe(1);
    expect(carrot?.averagePrice).toBe(110);
    expect(carrot?.minPrice).toBe(110);
    expect(carrot?.maxPrice).toBe(110);
    expect(carrot?.totalInventory).toBe(200);

    expect(result.metadata).toBeDefined();
    expect(result.metadata.totalSourcesProcessed).toBe(5);
    expect(result.metadata.totalItemsAggregated).toBe(5);
    expect(result.metadata.aggregationTimestamp).toBeDefined();
    expect(result.metadata.duplicateRecordCount).toBe(0);
    expect(result.metadata.dataConsistencyStatus).toBe('consistent');
  });
});