export interface OptionParams {
  spot: number; // underlying price
  strike: number;
  rate: number; // risk-free rate, continuously compounded
  dividend: number; // continuous dividend yield
  vol: number; // volatility (annualised)
  time: number; // time to expiry in years
}

export interface Greeks {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}
