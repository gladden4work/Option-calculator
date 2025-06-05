import { describe, expect, it } from 'vitest';
import { priceCall, pricePut, greeks as euroGreeks } from '../blackScholes';
import {
  priceAmericanCall,
  priceAmericanPut,
  greeks as amGreeks,
} from '../binomialCRR';
import { OptionParams } from '../types';

// Hard-coded fixtures approximating QuantLib output
const baseParams: OptionParams = {
  spot: 100,
  strike: 100,
  rate: 0.05,
  dividend: 0.02,
  vol: 0.2,
  time: 0.5,
};

const quantlib = {
  european: {
    call: {
      price: 6.307635154954198,
      greeks: {
        delta: 0.5644849344925215,
        gamma: 0.02749579441196439,
        theta: -6.877231928122733,
        vega: 27.495794411964393,
        rho: 25.07042914714897,
      },
    },
    put: {
      price: 4.833642982870657,
      greeks: {
        delta: -0.4255648992566467,
        gamma: 0.02749579441196439,
        theta: -3.9807820354794057,
        vega: 27.495794411964393,
        rho: -23.69506645426766,
      },
    },
  },
  american: {
    call: {
      price: 6.30067679637739,
      greeks: {
        delta: 0.5643992853336393,
        gamma: 0.05492288702551207,
        theta: -6.878618314074081,
        vega: 27.465310149305022,
        rho: 25.349030744103906,
      },
    },
    put: {
      price: 4.973092887655821,
      greeks: {
        delta: -0.4435144514289244,
        gamma: 0.051055359488025864,
        theta: -4.330499072024314,
        vega: 27.47218291586231,
        rho: -17.903102193325182,
      },
    },
  },
};

function withinPct(a: number, b: number, pct: number) {
  return Math.abs(a - b) / b <= pct;
}

describe('Black-Scholes European pricing', () => {
  it('matches QuantLib call', () => {
    const price = priceCall(baseParams);
    expect(withinPct(price, quantlib.european.call.price, 0.001)).toBe(true);
    const g = euroGreeks(baseParams, true);
    const exp = quantlib.european.call.greeks;
    expect(Math.abs(g.delta - exp.delta)).toBeLessThanOrEqual(0.005);
    expect(Math.abs(g.gamma - exp.gamma)).toBeLessThanOrEqual(0.005);
    expect(Math.abs(g.theta - exp.theta)).toBeLessThanOrEqual(0.005);
    expect(Math.abs(g.vega - exp.vega)).toBeLessThanOrEqual(0.005);
    expect(Math.abs(g.rho - exp.rho)).toBeLessThanOrEqual(0.005);
  });

  it('matches QuantLib put', () => {
    const price = pricePut(baseParams);
    expect(withinPct(price, quantlib.european.put.price, 0.001)).toBe(true);
    const g = euroGreeks(baseParams, false);
    const exp = quantlib.european.put.greeks;
    expect(Math.abs(g.delta - exp.delta)).toBeLessThanOrEqual(0.005);
    expect(Math.abs(g.gamma - exp.gamma)).toBeLessThanOrEqual(0.005);
    expect(Math.abs(g.theta - exp.theta)).toBeLessThanOrEqual(0.005);
    expect(Math.abs(g.vega - exp.vega)).toBeLessThanOrEqual(0.005);
    expect(Math.abs(g.rho - exp.rho)).toBeLessThanOrEqual(0.005);
  });
});

describe('CRR American pricing', () => {
  it('matches QuantLib call', () => {
    const price = priceAmericanCall(baseParams);
    expect(withinPct(price, quantlib.american.call.price, 0.001)).toBe(true);
    const g = amGreeks(baseParams, true);
    const exp = quantlib.american.call.greeks;
    expect(Math.abs(g.delta - exp.delta)).toBeLessThanOrEqual(0.005);
    expect(Math.abs(g.gamma - exp.gamma)).toBeLessThanOrEqual(0.005);
    expect(Math.abs(g.theta - exp.theta)).toBeLessThanOrEqual(0.005);
    expect(Math.abs(g.vega - exp.vega)).toBeLessThanOrEqual(0.005);
    expect(Math.abs(g.rho - exp.rho)).toBeLessThanOrEqual(0.005);
  });

  it('matches QuantLib put', () => {
    const price = priceAmericanPut(baseParams);
    expect(withinPct(price, quantlib.american.put.price, 0.001)).toBe(true);
    const g = amGreeks(baseParams, false);
    const exp = quantlib.american.put.greeks;
    expect(Math.abs(g.delta - exp.delta)).toBeLessThanOrEqual(0.005);
    expect(Math.abs(g.gamma - exp.gamma)).toBeLessThanOrEqual(0.005);
    expect(Math.abs(g.theta - exp.theta)).toBeLessThanOrEqual(0.005);
    expect(Math.abs(g.vega - exp.vega)).toBeLessThanOrEqual(0.005);
    expect(Math.abs(g.rho - exp.rho)).toBeLessThanOrEqual(0.005);
  });
});
