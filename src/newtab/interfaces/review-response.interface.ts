export interface ReviewResponseModel {
  appliedSearchFilters: AppliedSearchFilter[];
  debugInfo: any;
  exceptions: any[];
  featureList: any[];
  offset: number;
  orders: Order[];
  requestId: string;
  total: number;
}

export interface AppliedSearchFilter {
  key: string;
  selectedValues: string[];
}

export interface Order {
  actions: string[];
  alerts: any[];
  amazonOrderId: string;
  awaitingVerification: boolean;
  badgeList: string[];
  badgesWithTooltips: any;
  blob: string;
  cancellationDate: any;
  cancellationFees: any;
  complexActionButtons: any;
  complexActions: ComplexActions;
  dbtsStatus: string;
  deliveryNoteMetadata: any;
  earliestDeliveryDate: any;
  earliestShipDate: any;
  electronicInvoiceAwaitingUpload: boolean;
  electronicInvoiceStatus: any;
  fulfillmentMethod: string;
  fulfillmentStatusReason: any;
  homeMarketplaceId: string;
  inProgressAction: any;
  instructionId: any;
  invoiceNotUploaded: boolean;
  invoiceUploadMetadata: any;
  isAccessPointOrder: boolean;
  isMerchantFulfilled: boolean;
  isShipmentInjection: boolean;
  labelAvailableDateUtc: any;
  labelStatus: any;
  latestDeliveryDate: any;
  latestShipDate: number;
  maximumTransitTimeDisplayUnit: string;
  orderDate: number;
  orderFulfillmentStatus: string;
  orderItems: OrderItem[];
  packageHandlingInstructions: any;
  pickupDate: any;
  pickupReadyDate: any;
  pluginBadges: any[];
  pluginOrderStatus: any;
  recommendedCarrierInfo: any;
  relativeOrderDate: string;
  salesChannel: string;
  scheduledSlot: any;
  sellerOrderId: string;
  shippingService: string;
  shippingServiceOption: any;
  shippingServiceStringId: string;
  timeZoneDetailsMap: TimeZoneDetailsMap;
}

export interface ComplexActions {}

export interface OrderItem {
  amazonPrograms: any;
  asin: string;
  associatedItems: any[];
  billingCountry: string;
  buyerRequestedCancel: any;
  conditionNote: any;
  conditionSubtype: any;
  conditionType: any;
  customerOrderItemCode: string;
  expenseTotal: any;
  extendedTitle: string;
  giftMessageText: any;
  giftWrapType: any;
  harmonizedCode: any;
  hasLastMileNetworkIdVAS: boolean;
  imageSourceSarek: boolean;
  imageUrl: string;
  isGift: boolean;
  isHeavyOrBulky: boolean;
  listingId: any;
  orderItemId: string;
  packageType: any;
  productLink: string;
  productName: string;
  quantityCanceled: number;
  quantityOrdered: number;
  quantityShipped: number;
  quantityUnShipped: number;
  scheduledDeliveryEndDate: any;
  scheduledDeliveryStartDate: any;
  scheduledDeliveryTimeZone: any;
  sellerSku: string;
  serialNumbers: any;
  signatureRecommended: boolean;
  transparencyItem: boolean;
  transparencyItemAttribute: any;
  unitPrice: UnitPrice;
  isRequested: boolean;
}

export interface UnitPrice {
  Amount: number;
  CurrencyCode: string;
  EncryptedAmount: any;
}

export interface TimeZoneDetailsMap {
  latestShipDate: LatestShipDate;
  orderDate: OrderDate;
}

export interface LatestShipDate {
  offset: number;
  shortenedTzString: string;
}

export interface OrderDate {
  offset: number;
  shortenedTzString: string;
}
