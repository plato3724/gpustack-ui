import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseRates } from '../price-validation';

test('price editor accepts empty maps and explicit free model rates', () => {
  assert.deepEqual(parseRates('{}', '{}'), {
    token_prices: {},
    gpu_hour_prices: {}
  });
  assert.equal(
    parseRates(
      '{"default":{"input_per_million":0,"output_per_million":0}}',
      '{"h100":4.5}'
    ).gpu_hour_prices.h100,
    4.5
  );
});
test('price editor rejects malformed structures and invalid rates', () => {
  for (const input of [
    '[]',
    'null',
    '{"x":2}',
    '{"x":{"input_per_million":-1,"output_per_million":0}}',
    '{"x":{"input_per_million":1}}',
    '{"x":{"input_per_million":true,"output_per_million":0}}'
  ]) {
    assert.throws(() => parseRates(input, '{}'));
  }
  for (const input of [
    '[]',
    '{"x":null}',
    '{"x":-1}',
    '{"x":"2"}',
    '{"x":1e999}'
  ])
    assert.throws(() => parseRates('{}', input));
});
