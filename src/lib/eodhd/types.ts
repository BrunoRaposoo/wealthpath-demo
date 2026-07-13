export interface EodhdQuote {
  code: string;
  timestamp: number;
  gmtoffset: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  previousClose: number;
  change: number;
  changePct: number;
}

export interface EodhdFundamental {
  Code: string;
  Type: string;
  Name: string;
  Exchange: string;
  CurrencyCode: string;
  LastClose: number;
  Sector: string;
  Industry: string;
  Description: string;
  FullTimeEmployees: number;
  MarketCap: number;
  PE: number;
  PEForward: number;
  EPS: number;
  DivYield: number;
  DivPerShare: number;
  Beta: number;
  FiftyTwoWeekHigh: number;
  FiftyTwoWeekLow: number;
}

export interface EodhdHistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adjusted_close: number;
  volume: number;
}

export interface EodhdSearchParams {
  q: string;
  limit?: number;
}

export interface EodhdQuoteParams {
  symbols: string[];
}
