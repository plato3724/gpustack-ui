import type { PriceList, TokenPrice } from '../config/types';
const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);
const rate = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;
export function parseRates(
  tokens: string,
  gpus: string
): Pick<PriceList, 'token_prices' | 'gpu_hour_prices'> {
  const tokenPrices: unknown = JSON.parse(tokens);
  const gpuPrices: unknown = JSON.parse(gpus);
  if (!isObject(tokenPrices) || !isObject(gpuPrices))
    throw new Error('billing.settings.invalidRates');
  for (const value of Object.values(tokenPrices)) {
    if (
      !isObject(value) ||
      !rate(value.input_per_million) ||
      !rate(value.output_per_million) ||
      Object.keys(value).some(
        (key) => !['input_per_million', 'output_per_million'].includes(key)
      )
    )
      throw new Error('billing.settings.invalidRates');
  }
  if (!Object.values(gpuPrices).every(rate))
    throw new Error('billing.settings.invalidRates');
  return {
    token_prices: tokenPrices as Record<string, TokenPrice>,
    gpu_hour_prices: gpuPrices as Record<string, number>
  };
}
