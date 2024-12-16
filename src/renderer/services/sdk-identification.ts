interface SDKPattern {
  regex: RegExp;
  params?: string[];
  versionGroup?: number;
  isTracking?: boolean;
}

interface SDKMatch {
  name: string;
  version?: string;
  isTracking: boolean;
}

export class SDKIdentificationService {
  private patterns: Record<string, SDKPattern> = {
    'PayPal JS SDK': {
      regex: /^https:\/\/www\.paypal\.com\/sdk\/js/,
      params: ['client-id']
    },
    'PayPal Checkout.js': {
      regex: /^https:\/\/www\.paypalobjects\.com\/api\/checkout\.js/,
      //regex: /^https:\/\/www\.paypal\.com\/sdk\/js/,
      //params: ['client-id', 'components=checkout']
    },
    'PayPal Buttons SDK': {
      regex: /^https:\/\/www\.paypal\.com\/sdk\/js/,
      params: ['client-id', 'components=buttons']
    },
    'PayPal Messaging SDK': {
      regex: /^https:\/\/www\.paypal\.com\/sdk\/js/,
      params: ['client-id', 'components=messages']
    },
    'PayPal Fastlane SDK': {
      regex: /^https:\/\/www\.paypal\.com\/sdk\/js/,
      params: ['client-id', 'components=fastlane']
    },
    'PayPal Shopper Insights SDK': {
      regex: /^https:\/\/www\.paypal\.com\/sdk\/js/,
      params: ['client-id', 'components=intelligent-payment-decisions']
    },
    'PayPal Hosted Fields': {
      regex: /^https:\/\/www\.paypalobjects\.com\/web\/res\/[\w]+\/js\/hosted-fields\.js/
    },
    'Braintree JS SDK': {
      regex: /^https:\/\/js\.braintreegateway\.com\/web\/(\d+\.\d+\.\d+)\//,
      versionGroup: 1
    },
    'PayPal Conversion Tracking Pixel': {
      regex: /^https:\/\/www\.paypal\.com\/xo\/i\?a=1/,
      isTracking: true
    },
    'PayPal Analytics Tracking Pixel': {
      regex: /^https:\/\/www\.paypalobjects\.com\/webstatic\/r\/fb\/track\.js/,
      isTracking: true
    },
    'PayPal Tracking Pixel': {
      regex: /^https:\/\/t\.paypal\.com\/ts/,
      isTracking: true
    },
    'PayPal Tracking Library': {
      regex: /^https:\/\/t\.paypal\.com\/ts\.js/,
      isTracking: true
    },
    'Google Analytics Tracking Pixel': {
      regex: /^https:\/\/www\.google-analytics\.com\/(analytics\.js|r\/collect|collect)/,
      isTracking: true
    }
  };

  identifySDK(url: string): SDKMatch[] {
    try {
      const matchedIntegrations: SDKMatch[] = [];
      const parsedUrl = new URL(url);

      for (const [integrationName, config] of Object.entries(this.patterns)) {
        if (config.regex.test(url)) {
          let version: string | undefined;
          if (config.versionGroup) {
            version = parsedUrl.href.match(config.regex)?.[config.versionGroup] ?? undefined;
          }

          if (config.params) {
            const requiredParams = [...config.params];
            const foundParams = [];

            for (const param of requiredParams) {

              if (param.includes('=')) {
                const [key, value] = param.split('=');
                if (parsedUrl.searchParams.getAll(key).includes(value)) {
                  foundParams.push(param);
                }
              } else {
                if (parsedUrl.searchParams.has(param)) {
                  foundParams.push(param);
                }
              }
            }

            if (foundParams.length === requiredParams.length) {
              matchedIntegrations.push({ name: integrationName, version, isTracking: !!config.isTracking });
            }
          } else {
            matchedIntegrations.push({ name: integrationName, version, isTracking: !!config.isTracking });
          }
        }
      }

      return matchedIntegrations;
    } catch (error) {
      console.error('Error identifying SDK:', error);
      return [];
    }
  }
}