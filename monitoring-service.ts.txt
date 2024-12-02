// src/main/services/monitoring-service.ts
import { IntegrationConfig, IntegrationMatch } from '../../shared/types/integration';

export class MonitoringService {
  private paypalIntegrationConfig: Record<string, IntegrationConfig> = {
    'PayPal JS SDK': {
      regex: /^https:\/\/www\.paypal\.com\/sdk\/js/,
      includeQueryParams: ['client-id']
    },
    'PayPal Checkout.js': {
      regex: /^https:\/\/www\.paypal\.com\/sdk\/js/,
      includeQueryParams: ['client-id', 'components=checkout']
    },
    'PayPal Buttons SDK': {
      regex: /^https:\/\/www\.paypal\.com\/sdk\/js/,
      includeQueryParams: ['client-id', 'components=buttons']
    },
    'PayPal Messaging SDK': {
      regex: /^https:\/\/www\.paypal\.com\/sdk\/js/,
      includeQueryParams: ['client-id', 'components=messages']
    },
    'PayPal Hosted Fields': {
      regex: /^https:\/\/www\.paypalobjects\.com\/web\/res\/b37\/6f84c2f6f6d12d91dd1defc7bc8d\/js\/hosted-fields\.js/
    },
    'Braintree JS SDK': {
      regex: /^https:\/\/js\.braintreegateway\.com\/web\/(\d+\.\d+\.\d+)\//,
      versionGroup: 1
    },
    'PayPal Tracking Pixel': {
      regex: /^https:\/\/t\.paypal\.com\/ts/
    },
    'Google Analytics': {
      regex: /^https:\/\/www\.google-analytics\.com\/(?:analytics\.js|r\/collect|collect)/
    }
  };

  identifyIntegrations(url: string): IntegrationMatch[] {
    const matchedIntegrations: IntegrationMatch[] = [];
    const parsedUrl = new URL(url);

    for (const [name, config] of Object.entries(this.paypalIntegrationConfig)) {
      if (config.regex.test(url)) {
        let version: string | undefined;
        const match = url.match(config.regex);
        
        if (config.versionGroup && match) {
          version = match[config.versionGroup];
        }

        if (config.includeQueryParams) {
          const hasAllParams = config.includeQueryParams.every(param => {
            if (param.includes('=')) {
              const [key, value] = param.split('=');
              return parsedUrl.searchParams.get(key) === value;
            }
            return parsedUrl.searchParams.has(param);
          });

          if (hasAllParams) {
            matchedIntegrations.push({ name, version });
          }
        } else {
          matchedIntegrations.push({ name, version });
        }
      }
    }

    return matchedIntegrations;
  }
}
