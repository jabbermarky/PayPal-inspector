"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SDKIdentificationService = void 0;
class SDKIdentificationService {
    constructor() {
        this.patterns = {
            'PayPal JS SDK': {
                regex: /^https:\/\/www\.paypal\.com\/sdk\/js/,
                params: ['client-id']
            },
            'PayPal Checkout.js': {
                regex: /^https:\/\/www\.paypal\.com\/sdk\/js/,
                params: ['client-id', 'components=checkout']
            },
            'PayPal Buttons SDK': {
                regex: /^https:\/\/www\.paypal\.com\/sdk\/js/,
                params: ['client-id', 'components=buttons']
            },
            'PayPal Messaging SDK': {
                regex: /^https:\/\/www\.paypal\.com\/sdk\/js/,
                params: ['client-id', 'components=messages']
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
    }
    identifySDK(url) {
        var _a, _b;
        try {
            const matchedIntegrations = [];
            const parsedUrl = new URL(url);
            for (const [integrationName, config] of Object.entries(this.patterns)) {
                if (config.regex.test(url)) {
                    let version;
                    if (config.versionGroup) {
                        version = (_b = (_a = parsedUrl.href.match(config.regex)) === null || _a === void 0 ? void 0 : _a[config.versionGroup]) !== null && _b !== void 0 ? _b : undefined;
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
                            }
                            else {
                                if (parsedUrl.searchParams.has(param)) {
                                    foundParams.push(param);
                                }
                            }
                        }
                        if (foundParams.length === requiredParams.length) {
                            matchedIntegrations.push({ name: integrationName, version, isTracking: !!config.isTracking });
                        }
                    }
                    else {
                        matchedIntegrations.push({ name: integrationName, version, isTracking: !!config.isTracking });
                    }
                }
            }
            return matchedIntegrations;
        }
        catch (error) {
            console.error('Error identifying SDK:', error);
            return [];
        }
    }
}
exports.SDKIdentificationService = SDKIdentificationService;
//# sourceMappingURL=sdk-identification.js.map