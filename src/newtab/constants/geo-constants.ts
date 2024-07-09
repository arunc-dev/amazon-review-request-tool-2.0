import { tail } from "lodash";

export interface GeoMapsModel {
  baseDomain: string;
  marketPlaceId: string;
  marketPlace: string;
  marketplaceDisplay: string;
}
export const geoMaps: { [key: string]: any } = {
  AMAZON_US: {
    baseDomain: "sellercentral.amazon.com",
    marketPlaceId: "ATVPDKIKX0DER",
    marketPlace: "US",
    marketplaceDisplay: "AMAZON.COM",
    tail: ".com",
    countryCode: "us",
  },
  AMAZON_UK: {
    baseDomain: "sellercentral.amazon.co.uk",
    marketPlaceId: "A1F83G8C2ARO7P",
    marketPlace: "UK",
    marketplaceDisplay: "AMAZON.CO.UK",
    tail: ".co.uk",
    countryCode: "gb",
  },
  AMAZON_IN: {
    baseDomain: "sellercentral.amazon.in",
    marketPlaceId: "A21TJRUUN4KGV",
    marketPlace: "IN",
    marketplaceDisplay: "AMAZON.IN",
    tail: ".in",
    countryCode: "in",
  },
  AMAZON_AU: {
    baseDomain: "sellercentral.amazon.com.au",
    marketPlaceId: "A39IBJ37TRP1C6",
    marketPlace: "AU",
    marketplaceDisplay: "AMAZON.AU",
    tail: ".com.au",
    countryCode: "au",
  },
  AMAZON_CA: {
    baseDomain: "sellercentral.amazon.ca",
    marketPlaceId: "A2EUQ1WTGCTBG2",
    marketPlace: "CA",
    marketplaceDisplay: "AMAZON.CA",
    tail: ".ca",
    countryCode: "ca",
  },
  AMAZON_DE: {
    baseDomain: "sellercentral.amazon.de",
    marketPlaceId: "A1PA6795UKMFR9",
    marketPlace: "DE",
    marketplaceDisplay: "AMAZON.DE",
    tail: ".de",
    countryCode: "de",
  },
  AMAZON_JP: {
    baseDomain: "sellercentral-japan.amazon.com",
    marketPlaceId: "A1VC38T7YXB528",
    marketPlace: "JP",
    marketplaceDisplay: "AMAZON.CO.JP",
    tail: ".co.jp",
    countryCode: "jp",
  },
  AMAZON_FR: {
    baseDomain: "sellercentral.amazon.fr",
    marketPlaceId: "A13V1IB3VIYZZH",
    marketPlace: "FR",
    marketplaceDisplay: "AMAZON.FR",
    tail: ".fr",
    countryCode: "fr",
  },
  AMAZON_ES: {
    baseDomain: "sellercentral.amazon.es",
    marketPlaceId: "A1RKKUPIHCS9HS",
    marketPlace: "ES",
    marketplaceDisplay: "AMAZON.ES",
    tail: ".es",
    countryCode: "es",
  },
  AMAZON_IT: {
    baseDomain: "sellercentral.amazon.it",
    marketPlaceId: "APJ6JRA9NG5V4",
    marketPlace: "IT",
    marketplaceDisplay: "AMAZON.IT",
    tail: ".it",
    countryCode: "it",
  },
  AMAZON_AE: {
    baseDomain: "sellercentral.amazon.ae",
    marketPlaceId: "A2VIGQ35RCS4UG",
    marketPlace: "AE",
    marketplaceDisplay: "AMAZON.AE",
    tail: ".ae",
    countryCode: "ae",
  },

  AMAZON_BR: {
    baseDomain: "sellercentral.amazon.com.br",
    marketPlaceId: "A2Q3Y263D00KWC",
    marketPlace: "BR",
    marketplaceDisplay: "AMAZON.COM.BR",
    tail: ".com.br",
    countryCode: "br",
  },
  AMAZON_MX: {
    baseDomain: "sellercentral.amazon.com.mx",
    marketPlaceId: "A1AM78C64UM0Y8",
    marketPlace: "MX",
    marketplaceDisplay: "AMAZON.COM.MX",
    tail: ".com.mx",
    countryCode: "mx",
  },
  AMAZON_TR: {
    baseDomain: "sellercentral.amazon.com.tr",
    marketPlaceId: "A33AVAJ2PDY3EV",
    marketPlace: "TR",
    marketplaceDisplay: "AMAZON.COM.TR",
    tail: ".com.tr",
    countryCode: "tr",
  },
};
