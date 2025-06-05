import { OptionParams, Greeks } from './types';

const INV_SQRT_2PI = 1 / Math.sqrt(2 * Math.PI);

function erf(x: number): number {
  // Abramowitz and Stegun formula 7.1.26
  const sign = Math.sign(x);
  const absX = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * absX);
  const y =
    1 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  return sign * y;
}

function normCdf(x: number): number {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

function normPdf(x: number): number {
  return INV_SQRT_2PI * Math.exp(-0.5 * x * x);
}

function d1(params: OptionParams): number {
  const { spot, strike, rate, dividend, vol, time } = params;
  return (
    (Math.log(spot / strike) + (rate - dividend + (vol * vol) / 2) * time) /
    (vol * Math.sqrt(time))
  );
}

function d2(params: OptionParams): number {
  return d1(params) - params.vol * Math.sqrt(params.time);
}

export function priceCall(params: OptionParams): number {
  const { spot, strike, rate, dividend, time } = params;
  const d_1 = d1(params);
  const d_2 = d2(params);
  return (
    spot * Math.exp(-dividend * time) * normCdf(d_1) -
    strike * Math.exp(-rate * time) * normCdf(d_2)
  );
}

export function pricePut(params: OptionParams): number {
  const { spot, strike, rate, dividend, time } = params;
  const d_1 = d1(params);
  const d_2 = d2(params);
  return (
    strike * Math.exp(-rate * time) * normCdf(-d_2) -
    spot * Math.exp(-dividend * time) * normCdf(-d_1)
  );
}

export function greeks(params: OptionParams, isCall: boolean): Greeks {
  const { spot, strike, rate, dividend, vol, time } = params;
  const d_1 = d1(params);
  const d_2 = d2(params);
  const Nd1 = normCdf(isCall ? d_1 : d_1 - 1e-12); // ensure direction
  const Nd2 = normCdf(isCall ? d_2 : d_2 - 1e-12);
  const pdf = normPdf(d_1);

  const delta = (isCall ? Nd1 : Nd1 - 1) * Math.exp(-dividend * time);
  const gamma =
    (Math.exp(-dividend * time) * pdf) / (spot * vol * Math.sqrt(time));
  const vega = spot * Math.exp(-dividend * time) * Math.sqrt(time) * pdf;
  const theta =
    (-spot * pdf * vol * Math.exp(-dividend * time)) / (2 * Math.sqrt(time)) +
    (isCall
      ? -rate * strike * Math.exp(-rate * time) * normCdf(d_2) +
        dividend * spot * Math.exp(-dividend * time) * normCdf(d_1)
      : rate * strike * Math.exp(-rate * time) * normCdf(-d_2) -
        dividend * spot * Math.exp(-dividend * time) * normCdf(-d_1));
  const rho = isCall
    ? strike * time * Math.exp(-rate * time) * normCdf(d_2)
    : -strike * time * Math.exp(-rate * time) * normCdf(-d_2);

  return { delta, gamma, theta, vega, rho };
}
