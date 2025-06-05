import { OptionParams, Greeks } from './types';

function steps(time: number): number {
  return Math.max(200, Math.round(365 * time));
}

function optionPrice(params: OptionParams, isCall: boolean): number {
  const { spot, strike, rate, dividend, vol, time } = params;
  const N = steps(time);
  const dt = time / N;
  const u = Math.exp(vol * Math.sqrt(dt));
  const d = 1 / u;
  const p = (Math.exp((rate - dividend) * dt) - d) / (u - d);
  const discount = Math.exp(-rate * dt);

  const prices: number[] = new Array(N + 1);
  for (let i = 0; i <= N; i++) {
    const ST = spot * Math.pow(u, N - i) * Math.pow(d, i);
    prices[i] = Math.max(isCall ? ST - strike : strike - ST, 0);
  }

  for (let step = N; step > 0; step--) {
    for (let i = 0; i < step; i++) {
      const ST = spot * Math.pow(u, step - 1 - i) * Math.pow(d, i);
      const exercise = Math.max(isCall ? ST - strike : strike - ST, 0);
      const cont = discount * (p * prices[i] + (1 - p) * prices[i + 1]);
      prices[i] = Math.max(exercise, cont);
    }
  }

  return prices[0];
}

export function priceAmericanCall(params: OptionParams): number {
  return optionPrice(params, true);
}

export function priceAmericanPut(params: OptionParams): number {
  return optionPrice(params, false);
}

export function greeks(params: OptionParams, isCall: boolean): Greeks {
  const hS = params.spot * 0.01;
  const hVol = 0.01;
  const hR = 0.01;
  const hT = 1 / 365;

  const price = optionPrice(params, isCall);
  const upS = optionPrice({ ...params, spot: params.spot + hS }, isCall);
  const downS = optionPrice({ ...params, spot: params.spot - hS }, isCall);
  const delta = (upS - downS) / (2 * hS);
  const gamma = (upS - 2 * price + downS) / (hS * hS);

  const upVol = optionPrice({ ...params, vol: params.vol + hVol }, isCall);
  const vega = (upVol - price) / hVol;

  const upR = optionPrice({ ...params, rate: params.rate + hR }, isCall);
  const rho = (upR - price) / hR;

  const downT = Math.max(params.time - hT, 1e-6);
  const down = optionPrice({ ...params, time: downT }, isCall);
  const theta = (down - price) / hT;

  return { delta, gamma, theta, vega, rho };
}
