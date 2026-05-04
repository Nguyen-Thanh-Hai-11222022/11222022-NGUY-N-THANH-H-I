import { expect, test } from 'vitest'

test('Kiểm tra logic tính tổng tiền tour', () => {
  const price = 1000000;
  const quantity = 2;
  expect(price * quantity).toBe(2000000);
})