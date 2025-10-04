import { useState, useEffect } from "react";

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number; // Exchange rate to USD
  flag: string; // Country flag emoji
}

export interface CurrencyConfig {
  defaultCurrency: string;
  supportedCurrencies: Currency[];
  autoDetect: boolean;
}

// Exchange rates (in a real app, these would come from an API)
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  CAD: 1.35,
  EUR: 0.85,
  GBP: 0.73,
  AUD: 1.52,
  JPY: 110.0,
  CHF: 0.92,
  SEK: 8.5,
  NOK: 8.8,
  DKK: 6.3,
};

const SUPPORTED_CURRENCIES: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$", rate: 1.0, flag: "🇺🇸" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", rate: 1.35, flag: "🇨🇦" },
  { code: "EUR", name: "Euro", symbol: "€", rate: 0.85, flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", symbol: "£", rate: 0.73, flag: "🇬🇧" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", rate: 1.52, flag: "🇦🇺" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", rate: 110.0, flag: "🇯🇵" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", rate: 0.92, flag: "🇨🇭" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr", rate: 8.5, flag: "🇸🇪" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr", rate: 8.8, flag: "🇳🇴" },
  { code: "DKK", name: "Danish Krone", symbol: "kr", rate: 6.3, flag: "🇩🇰" },
];

export class CurrencyService {
  private static instance: CurrencyService;
  private currentCurrency: string = "USD";
  private exchangeRates: Record<string, number> = EXCHANGE_RATES;

  private constructor() {
    this.loadCurrencyFromStorage();
    this.updateExchangeRates();
  }

  public static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService();
    }
    return CurrencyService.instance;
  }

  private loadCurrencyFromStorage(): void {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("preferred_currency");
      if (stored && SUPPORTED_CURRENCIES.find(c => c.code === stored)) {
        this.currentCurrency = stored;
      } else {
        // Auto-detect based on browser locale
        const locale = navigator.language || "en-US";
        const detectedCurrency = this.detectCurrencyFromLocale(locale);
        this.currentCurrency = detectedCurrency;
      }
    }
  }

  private detectCurrencyFromLocale(locale: string): string {
    const localeToCurrency: Record<string, string> = {
      "en-US": "USD",
      "en-CA": "CAD",
      "en-GB": "GBP",
      "en-AU": "AUD",
      "de-DE": "EUR",
      "fr-FR": "EUR",
      "es-ES": "EUR",
      "it-IT": "EUR",
      "nl-NL": "EUR",
      "sv-SE": "SEK",
      "no-NO": "NOK",
      "da-DK": "DKK",
      "ja-JP": "JPY",
      "zh-CN": "CNY",
    };

    return localeToCurrency[locale] || "USD";
  }

  private async updateExchangeRates(): Promise<void> {
    try {
      // In a real app, you would fetch from an API like exchangerate-api.com
      // For now, we'll use static rates
      console.log("Exchange rates updated");
    } catch (error) {
      console.error("Failed to update exchange rates:", error);
    }
  }

  public getSupportedCurrencies(): Currency[] {
    return SUPPORTED_CURRENCIES;
  }

  public getCurrentCurrency(): string {
    return this.currentCurrency;
  }

  public setCurrency(currencyCode: string): void {
    if (SUPPORTED_CURRENCIES.find(c => c.code === currencyCode)) {
      this.currentCurrency = currencyCode;
      if (typeof window !== "undefined") {
        localStorage.setItem("preferred_currency", currencyCode);
      }
    }
  }

  public getCurrencyInfo(currencyCode: string): Currency | undefined {
    return SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
  }

  public convertAmount(amount: number, fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) return amount;
    
    const fromRate = this.exchangeRates[fromCurrency] || 1;
    const toRate = this.exchangeRates[toCurrency] || 1;
    
    // Convert to USD first, then to target currency
    const usdAmount = amount / fromRate;
    return usdAmount * toRate;
  }

  public formatAmount(amount: number, currencyCode?: string): string {
    const currency = currencyCode || this.currentCurrency;
    const currencyInfo = this.getCurrencyInfo(currency);
    
    if (!currencyInfo) return `$${amount.toFixed(2)}`;

    const formattedAmount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

    return formattedAmount;
  }

  public getCurrencySymbol(currencyCode?: string): string {
    const currency = currencyCode || this.currentCurrency;
    const currencyInfo = this.getCurrencyInfo(currency);
    return currencyInfo?.symbol || "$";
  }

  public getExchangeRate(fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) return 1;
    
    const fromRate = this.exchangeRates[fromCurrency] || 1;
    const toRate = this.exchangeRates[toCurrency] || 1;
    
    return toRate / fromRate;
  }
}

// React hook for currency management
export const useCurrency = () => {
  const [currency, setCurrency] = useState<string>("USD");
  const [isLoading, setIsLoading] = useState(true);
  const currencyService = CurrencyService.getInstance();

  useEffect(() => {
    setCurrency(currencyService.getCurrentCurrency());
    setIsLoading(false);
  }, []);

  const changeCurrency = (newCurrency: string) => {
    currencyService.setCurrency(newCurrency);
    setCurrency(newCurrency);
  };

  const convertAmount = (amount: number, fromCurrency: string, toCurrency: string) => {
    return currencyService.convertAmount(amount, fromCurrency, toCurrency);
  };

  const formatAmount = (amount: number, currencyCode?: string) => {
    return currencyService.formatAmount(amount, currencyCode);
  };

  const getCurrencySymbol = (currencyCode?: string) => {
    return currencyService.getCurrencySymbol(currencyCode);
  };

  const getSupportedCurrencies = () => {
    return currencyService.getSupportedCurrencies();
  };

  const getCurrentCurrencyInfo = () => {
    return currencyService.getCurrencyInfo(currency);
  };

  return {
    currency,
    isLoading,
    changeCurrency,
    convertAmount,
    formatAmount,
    getCurrencySymbol,
    getSupportedCurrencies,
    getCurrentCurrencyInfo,
  };
};

// Currency selector component
export const CurrencySelector = ({ 
  onCurrencyChange, 
  currentCurrency 
}: { 
  onCurrencyChange: (currency: string) => void;
  currentCurrency: string;
}) => {
  const { getSupportedCurrencies } = useCurrency();
  const currencies = getSupportedCurrencies();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Currency</label>
      <select
        value={currentCurrency}
        onChange={(e) => onCurrencyChange(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {currencies.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.flag} {currency.code} - {currency.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CurrencyService;
