import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Rate,
  Spin,
  Table,
  TableColumnsType,
  TablePaginationConfig,
  Tooltip,
} from "antd";
import { ReviewResponseModel } from "../interfaces/review-response.interface";
import _, { filter, groupBy, lowerCase, map, startCase } from "lodash";
import {
  processInBatches,
  RefundStatusResponse,
  requestReview,
} from "./review-request.service";
import { get, getTimed, set, setTimed } from "../../helpers/Cache";
import { DatePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import "./ReviewTable.css";
import { v4 as uuidv4 } from "uuid";
import { UserContext } from "../UserContext";
import { getAuthentication } from "../../Auth";
import { updateQuota } from "../axios_base";
import moment from "moment";
import { getQuota } from "../helpers";
import { PaginationConfig } from "antd/es/pagination";
import manifest from "../../manifest";
import {
  ReviewFilters,
  ReviewFiltersEnum,
} from "../review-filters/ReviewFilters";
import { fetchDetails, parse } from "sellerapp-scraper/dist/utils/helpers";
import {
  reviewCountSchema,
  productSchema,
} from "sellerapp-scraper/dist/utils/config";
import { processProduct } from "sellerapp-scraper/dist/utils/productPreprocessor";
const { RangePicker } = DatePicker;
const webhookUrl =
  "https://api.sellerapp.com/slack/send?chanel_id=extension-subscription";
const dateFormat = "YYYY-MM-DD";

interface ProductDataType {
  productName: string;
  productImage: string;
  asin: string;
  sku: string;
  quantityOrdered: number;
  productLink: string;
  country: string;
  orderItemId: string;
  productDetails?: any;
  reviewDetails?: any;
  enabled?: boolean;
}
interface DataType {
  key: React.Key;
  orderId: string;
  relativeOrderDate: string;
  salesChannel: string;
  orderType: string;
  orderStatus: string;
  homeMarketplaceId: string;
  isRequested: boolean;
  successMessage?: string;
  errorMessage?: string;
  isLoading?: boolean;
  products: ProductDataType[];
  enabled?: boolean;
}
const renderCategory = (allBsrRanks: any[]) => {
  if (!allBsrRanks || !allBsrRanks.length) return "N/A";
  const minObject = allBsrRanks.reduce((prev, current) =>
    prev.rank < current.rank ? prev : current
  );
  return <span>{`${minObject.category} (${minObject.rank})`}</span>;
};

const renderProductColumn = (text: string, record: DataType) => (
  <div className="">
    {record.products.map((item, index) => (
      <div
        key={item.orderItemId}
        className="row flex space-x-2 justify-center items-start pt-1 pb-1"
        style={{
          borderBottom:
            index !== record.products.length - 1
              ? "1px solid #e2e2e278"
              : "none",
        }}
      >
        <img
          src={item.productImage}
          alt={item.productName}
          width="70px"
          className="object-contain	"
        />
        <div className="flex-col flex w-[calc(100%-92px)] space-y-1">
          <Tooltip placement="topLeft" title={text}>
            <a className="truncate ..." href={item.productLink} target="_blank">
              {text}
            </a>
          </Tooltip>
          <span>
            ASIN:{" "}
            <b>
              <a
                className="truncate ..."
                href={item.productLink}
                target="_blank"
              >
                {item.asin}
              </a>
            </b>
          </span>
          <span>
            SKU: <b>{item.sku}</b>
          </span>
          <span>
            Quantity Ordered: <b>{item.quantityOrdered}</b>
          </span>
          <span>
            {" "}
            <div className="flex flex-row items-center justify-start space-x-2">
              Rating:
              <Tooltip title={item?.reviewDetails?.rating} className="ml-2">
                <div>
                  <Rate
                    disabled
                    defaultValue={+item?.reviewDetails?.rating}
                    allowHalf={true}
                  />
                  {/* <p>{item.reviewDetails.rating}</p> */}
                </div>
              </Tooltip>
              <Tooltip title="# of ratings">
                <b className="ml-2">{item?.reviewDetails?.global_ratings}</b>
              </Tooltip>
            </div>
          </span>
          <span>
            Reviews: <b>{item?.reviewDetails?.total_review_formatted}</b>
          </span>
          {/* <span>
            Date Available: <b>{item.productDetails.date_first_available}</b>
          </span>
          <span>
            Category: <b>{renderCategory(item.productDetails.allBsrRanks)}</b>
          </span> */}
        </div>
      </div>
    ))}
  </div>
);

const renderOrderDetailsColumn = (text: string, record: DataType) => (
  <div className="flex flex-col space-y-2">
    <span>
      Order ID: <b>{record.orderId}</b>
    </span>
    <span>
      Order Date: <b>{record.relativeOrderDate}</b>
    </span>
    <span>
      Marketplace: <b>Amazon {record.products[0].country}</b>
    </span>
  </div>
);
let productDetails: any = {};
let reviewDetails: any = {};

const getReviewDetails = async (
  uniqProducts: { asin: string; url: string }[]
) => {
  const tempArray: any = [];
  for (const product of uniqProducts) {
    const baseUrlMatch = product.url.match(
      /^(https:\/\/www\.amazon\.[a-z\.]+)/
    );
    let reviewUrl = "";
    if (!baseUrlMatch) {
      return;
    } else {
      reviewUrl = `${baseUrlMatch[1]}/product-reviews/${product.asin}`;
    }

    if (reviewDetails[product.asin]) {
    } else {
      tempArray.push({
        asin: product.asin,
        api: () => fetchDetails(reviewUrl),
      });
    }
  }
  const data = await processInBatches(tempArray, 10);
  if (data) {
    for (const response of data) {
      const reviewDetailsParsed = parse(
        response.api as string,
        reviewCountSchema
      );
      reviewDetails[response.asin] = reviewDetailsParsed;
    }
  }
};
const getProductDetails = async (
  uniqProducts: { asin: string; url: string }[]
) => {
  const tempArray: any = [];
  for (const product of uniqProducts) {
    if (productDetails[product.asin]) {
    } else {
      tempArray.push({
        asin: product.asin,
        api: () => fetchDetails(product.url),
      });
    }
  }
  const data = await processInBatches(tempArray, 10);
  if (data) {
    for (const response of data) {
      const productDetailsParsed = parse(response.api as string, productSchema);
      productDetails[response.asin] = productDetailsParsed;
    }
  }
};

const ReviewTable = (props: {
  amazonEndpoint: string;
  isSignedIn: (isSignedIn: boolean) => void;
  refreshPage: boolean;
  isQuotaExhausted: (value: boolean) => void;
}) => {
  const [page, setPage] = useState(0);
  const [reviewData, setReviewData] = useState<DataType[]>([]);
  const [filteredData, setFilteredData] = useState<DataType[]>([]);
  const [pagination, setPagination] = useState<any>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error("MyComponent must be used within a MyProvider");
  }
  const { userDetails, setUserDetails } = userContext;
  const [reviewLoading, setReviewLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<DataType[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [pageContext, setPageContext] = useState(null);
  const [availableStatus, setavailableStatus] = useState<string[]>([]);
  const [date, setDate] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(12, "day").startOf("day"),
    dayjs().subtract(6, "day").endOf("day"),
  ]);
  const [queryValues, setQueryValues] = useState({ q: "", qt: "asin" });
  const [inPageFilters, setInpageFilters] = useState<{
    [key in ReviewFiltersEnum]: string[];
  }>({
    rating: [],
    orderStatus: [],
    orderType: [],
    sortBy: [],
  });
  useEffect(() => {
    (async () => {
      let pageSizeCached: number = 10;
      try {
        pageSizeCached = (await get("pageSize")) as number;
      } catch {
        pageSizeCached = 10;
      }
      const quota = await getQuota();
      const isFreeUser = quota.limit <= 10;
      const pageSize = isFreeUser ? 20 : pageSizeCached ? pageSizeCached : 50;

      const paginationParams = {
        ...JSON.parse(JSON.stringify(pagination)),
        pageSize,
      };
      setPagination({ ...pagination, pageSize });
      fetchReviewDetails(pageSize, pagination.current);
    })();
  }, [props.amazonEndpoint, props.refreshPage]);
  useEffect(() => {}, [reviewData, pagination]);
  useEffect(() => {
    const auth = getAuthentication();
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const quota = await getQuota();
        setUserDetails({
          ...userDetails,
          user,
          quota,
        });
      } else {
        const quota = await getQuota();
        setUserDetails({
          ...userDetails,
          user,
          quota,
        });
      }
    });
    axios
      .post(
        "https://sellercentral.amazon.com/api/brand-analytics/v1/dashboards"
      )
      .then((response) => {
        setPageContext(response?.data?.pageContext);
      });
  }, []);

  const columns: TableColumnsType<DataType> = [
    {
      title: "Product",
      dataIndex: "productName",
      render: renderProductColumn,
      ellipsis: {
        showTitle: false,
      },
      width: "30%",
    },
    {
      title: "Order Details",
      dataIndex: "quantityOrdered",
      render: renderOrderDetailsColumn,
    },
    {
      title: "Order Type",
      dataIndex: "orderType",
      render: (text: string) => {
        return <span>{startCase(text)}</span>;
      },
    },
    {
      title: "Order Status",
      dataIndex: "orderStatus",
      render: (text: string) => {
        return (
          <span
            className={
              text === "PaymentComplete"
                ? `px-4 py-2 bg-[#E3FCEE] text-[#09B253] rounded-lg`
                : `px-4 py-2 bg-[#faefd7] text-[#f19822] rounded-lg`
            }
          >
            {startCase(text)}
          </span>
        );
      },
    },
    {
      title: "Action",
      render: (_, record) => {
        return (
          <div key={record.key}>
            {record.isRequested ? (
              <p className="text-green-500">Already Requested</p>
            ) : (
              <div>
                {record.successMessage ? null : (
                  <Button
                    type="link"
                    loading={record.isLoading}
                    iconPosition={"end"}
                    className="text-[#094CC0] pl-0"
                    onClick={() => requestCustomerReview(record, "single")}
                  >
                    Request Review
                  </Button>
                )}
                <p className="text-green-500">{record.successMessage}</p>
                <p className="text-red-500">{record.errorMessage}</p>
              </div>
            )}
          </div>
        );
      },
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows(selectedRows);
    },
    getCheckboxProps: (record: DataType) => ({
      // disabled: record.name === "Disabled User", // Column configuration not to be checked
      // name: record.name,
    }),
  };
  const requestCustomerReview = async (
    record: DataType,
    type: "single" | "bulk"
  ) => {
    if (userDetails.quota.usage >= userDetails.quota.limit) {
      props.isQuotaExhausted(true);
      return record;
    } else {
      record.isLoading = true;
      setReviewData([...reviewData]);
      const response = await requestReview(
        props.amazonEndpoint,
        record.orderId,
        record.homeMarketplaceId
      );
      if (response.success) {
        record.successMessage = startCase(lowerCase(response.success)) || "";
      } else {
        record.errorMessage = startCase(lowerCase(response.error)) || "";
      }
      record.isLoading = false;
      if (type === "single") {
        await checkAndUpdateQuota([record]);
        await sendWebHook([record], type);
      }
      setReviewData([...reviewData]);
      return record;
    }
  };

  const sendWebHook = async (records: DataType[], type: "single" | "bulk") => {
    let uuid = "";
    let callCount = 0;
    const date = new Date();
    try {
      uuid = (await get("uuid")) as string;
    } catch (error) {
      uuid = uuidv4();
      set("uuid", uuid);
    }
    let text = `uuid: ${uuid}\ndate: ${date.toString()}`;
    const manifestData = chrome.runtime.getManifest();
    let data: {
      uuid: string;
      date: string;
      records: any[];
      type: string;
      customerId: string;
      marketplace: string;
      merchantId: string;
      version: string;
      email: string;
      quota: any;
    } = {
      uuid: uuid,
      date: date.toString(),
      records: [],
      type,
      customerId: (pageContext as any)?.obfuscatedCustomerId,
      merchantId: (pageContext as any)?.obfuscatedMerchantCustomerId,
      marketplace: props.amazonEndpoint,
      version: manifestData.version,
      email: userDetails.user?.email,
      quota: userDetails?.quota,
    };
    for (const record of records) {
      try {
        callCount = (await get("callCount")) as number;
        callCount++;
        set("callCount", callCount);
      } catch (error) {
        callCount = 1;
        set("callCount", callCount);
      }
      const status = record.successMessage ? "success" : "failed";
      const message = record.errorMessage || record.successMessage;
      text =
        text +
        `\nstatus: ${status}\nmessage: ${message}\ncallCount: ${callCount}`;
      data.records.push({
        status,
        message,
        callCount,
      });
    }

    axios.post(webhookUrl, {
      data,
    });
  };

  const bulkReviewRequest = async () => {
    if (
      userDetails.quota.usage >= userDetails.quota.limit ||
      selectedRows.length > userDetails.quota.limit - userDetails.quota.usage
    ) {
      props.isQuotaExhausted(true);
      return;
    } else {
      setBulkLoading(true);
      const recordsAfterCall: DataType[] = [];

      for (const row of selectedRows) {
        if (row.isRequested) continue;
        const record = await requestCustomerReview(row, "bulk");
        recordsAfterCall.push(record);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
      if (recordsAfterCall.length > 0 && recordsAfterCall) {
        await checkAndUpdateQuota(recordsAfterCall);
        await sendWebHook(recordsAfterCall, "bulk");
      }

      setSelectedRows([]);
      setSelectedRowKeys([]);
      setBulkLoading(false);
    }
  };

  const checkAndUpdateQuota = async (records: DataType[]) => {
    const successRecords = records.filter((record) => record.successMessage);
    if (successRecords.length > 0) {
      let usage = 0;
      usage = userDetails.quota?.usage + successRecords.length;
      setUserDetails({
        ...userDetails,
        quota: {
          ...userDetails.quota,
          usage,
        },
      });
      const user = await getAuthentication().currentUser;
      if (user) {
        try {
          await updateQuota(successRecords.length);
        } catch (error) {
          console.log(error);
          await setTimed(
            "quota",
            JSON.stringify({
              frequency: "",
              limit: 10,
              next_reset: "",
              usage: usage,
            }),
            moment().endOf("month")
          );
        }
      } else {
        try {
          const currentUsage = await getQuota();
          const usage = currentUsage.usage + successRecords.length;
          const limit = currentUsage.limit;
          await setTimed(
            "quota",
            JSON.stringify({
              frequency: "",
              limit: limit,
              next_reset: "",
              usage: usage,
            }),
            moment().endOf("month")
          );
        } catch (error) {
          setTimed(
            "quota",
            JSON.stringify({
              frequency: "",
              limit: 5,
              next_reset: "",
              usage: successRecords.length || 0,
            }),
            moment().endOf("month")
          );
        }
      }
    }
  };

  const patchRefundStatus = async (filteredData: DataType[]) => {
    const orderIds = filteredData.map((order) => order.orderId);
    try {
      const response = await axios.get(
        `${props.amazonEndpoint}/orders-api/refund-status?orderId=${orderIds.join(",")}`
      );
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  const fetchReviewDetails = async (
    pageSize: number,
    current: number,
    dateDetails: any = date,
    query: { q: string; qt: string } = queryValues
  ) => {
    setReviewLoading(true);
    try {
      const response = await axios.get<ReviewResponseModel>(
        `${props.amazonEndpoint}/orders-api/search?limit=${pageSize}&offset=${pageSize * current - pageSize}&sort=order_date_asc&date-range=${dateDetails[0].unix() * 1000}-${dateDetails[1].unix() * 1000}&fulfillmentType=all&orderStatus=shipped&forceOrdersTableRefreshTrigger=false${query.qt && query.q ? "&q=" + query.q + "&qt=" + query.qt : ""}`
      );
      if (typeof response.data === "string") {
        props.isSignedIn(false);
        return;
      } else {
        setPagination({
          ...pagination,
          current: current,
          pageSize: pageSize,
          total: response.data.total,
        });
        await getProductData(response.data);
        transformOrderData(response.data);
      }
    } catch (error) {
      props.isSignedIn(false);
    }
  };
  const getProductData = async (data: ReviewResponseModel) => {
    const productAsinAndUrl: { asin: string; url: string }[] = [];
    data.orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        productAsinAndUrl.push({
          asin: item.asin,
          url: item.productLink,
        });
      });
    });
    // const uniqueAsins = _.uniq(productAsinAndUrl.map((item) => item.asin));
    function uniqueBy(array: any[], key: string) {
      return map(groupBy(array, key), (group) => group[0]);
    }

    const uniqueAsins: { asin: string; url: string }[] = uniqueBy(
      productAsinAndUrl,
      "asin"
    );
    try {
      await getReviewDetails(uniqueAsins);
    } catch {}
    // await getProductDetails(uniqueAsins);
  };
  const transformOrderData = async (data: ReviewResponseModel) => {
    let allOrders: DataType[] = [];
    const orderItems = await Promise.all(
      data.orders.map(async (order) => {
        try {
          await getTimed(order.amazonOrderId);
          order.isRequested = true;
        } catch (error) {
          order.isRequested = false;
        }
        return {
          key: order.amazonOrderId,
          orderId: order.amazonOrderId,
          relativeOrderDate: order.relativeOrderDate,
          salesChannel: order.salesChannel,
          orderType: order.shippingService,
          orderStatus: order.orderFulfillmentStatus,
          homeMarketplaceId: order.homeMarketplaceId,
          isRequested: order.isRequested,
          enabled: true,
          products: order.orderItems.map((item) => {
            return {
              productName: item.productName,
              productImage: item.imageUrl,
              asin: item.asin,
              sku: item.sellerSku,
              quantityOrdered: item.quantityOrdered,
              productLink: item.productLink,
              country: item.billingCountry,
              orderItemId: item.orderItemId,
              reviewDetails: reviewDetails[item.asin],
              // productDetails: processProduct(productDetails[item.asin]),
            };
          }),
        };
      })
    );
    allOrders.push(...orderItems);
    const refundResponse: RefundStatusResponse =
      await patchRefundStatus(allOrders);
    for (const order of allOrders) {
      const refundStatus = refundResponse?.refundSummaryList?.find(
        (refund) => refund.OrderId === order.orderId
      );
      if (refundStatus) {
        order.orderStatus = "Refunded";
      }
    }
    handleInpageFilterChange(inPageFilters, allOrders);
    setReviewLoading(false);
  };
  const handleTableChange = (
    paginationMutated: any,
    filters: any,
    sorter: any
  ) => {
    set("pageSize", paginationMutated.pageSize);
    setPagination(() => {
      return {
        ...pagination,
        current: paginationMutated.current,
        pageSize: paginationMutated.pageSize,
      };
    });
    fetchReviewDetails(paginationMutated.pageSize, paginationMutated.current);
  };
  const dateChangeHandler = (date: any) => {
    const dateToPass = [
      dayjs(date[0]).startOf("days"),
      dayjs(date[1]).endOf("days"),
    ];
    setDate([dateToPass[0], dateToPass[1]]);
    fetchReviewDetails(pagination.pageSize, 1, dateToPass);
  };

  const handleFilterChange = (qtOption: string, qtValue: string) => {
    const query = { q: qtValue, qt: qtOption };
    setQueryValues(query);
    fetchReviewDetails(pagination.pageSize, 1, date, query);
  };

  const handleInpageFilterChange = (
    filters: {
      [key in ReviewFiltersEnum]: string[];
    },
    orders: DataType[] = reviewData
  ) => {
    setInpageFilters(filters);
    let filteredData: DataType[] = [];
    orders.forEach((record) => {
      record.enabled = true;
      if (filters.rating.length > 0) {
        filters.rating
          .sort((a, b) => +b - +a)
          .forEach((rat) => {
            if (
              record.products.some((product) => {
                return +product.reviewDetails.rating >= +rat;
              })
            ) {
              record.enabled = true;
            } else {
              record.enabled = false;
            }
          });
      }
      if (filters.orderStatus.length > 0) {
        if (
          filters.orderStatus.includes(record.orderStatus) &&
          record.enabled
        ) {
          record.enabled = true;
        } else {
          record.enabled = false;
        }
      }

      if (filters.orderType.length > 0) {
        if (filters.orderType.includes(record.orderType) && record.enabled) {
          record.enabled = true;
        } else {
          record.enabled = false;
        }
      }

      if (
        filters.rating.length === 0 &&
        filters.orderStatus.length === 0 &&
        filters.orderType.length === 0
      ) {
        record.enabled = true;
      }

      filteredData.push(record);
    });

    //sort
    if (filters.sortBy.length > 0) {
      if (filters.sortBy[0] === "rating-asc") {
        filteredData = filteredData.sort((a, b) =>
          +a.products[0].reviewDetails.rating >
          +b.products[0].reviewDetails.rating
            ? 1
            : -1
        );
      } else if (filters.sortBy[0] === "rating-desc") {
        filteredData = filteredData.sort((a, b) =>
          +a.products[0].reviewDetails.rating <
          +b.products[0].reviewDetails.rating
            ? 1
            : -1
        );
      } else if (filters.sortBy[0] === "reviews-asc") {
        filteredData = filteredData.sort((a, b) =>
          +a.products[0].reviewDetails.total_review_formatted >
          +b.products[0].reviewDetails.total_review_formatted
            ? 1
            : -1
        );
      } else if (filters.sortBy[0] === "reviews-desc") {
        filteredData = filteredData.sort((a, b) =>
          +a.products[0].reviewDetails.total_review_formatted <
          +b.products[0].reviewDetails.total_review_formatted
            ? 1
            : -1
        );
      }
    }
    setReviewData(orders);
    setFilteredData(filteredData.filter((record) => record.enabled));
  };
  return (
    <div className="reviewTable">
      <ReviewFilters
        onFilterChange={handleFilterChange}
        availableOrderStatus={availableStatus}
        onInPageFilterChange={handleInpageFilterChange}
        isDisabled={bulkLoading || reviewLoading}
      />
      <div
        className={`my-5 justify-between items-center flex ${
          reviewLoading ? "hidden" : "block"
        }
        `}
      >
        <h4 className="font-medium text-xl">
          Total Orders ({pagination.total})
        </h4>
        <div className="flex space-x-3">
          <Button
            type="primary"
            loading={bulkLoading}
            iconPosition={"end"}
            onClick={bulkReviewRequest}
            disabled={selectedRows.length === 0}
          >
            Bulk Request Reviews
          </Button>
          {/* <Tooltip
            title={
              userContext.userDetails.quota.limit > 10
                ? "Select Date Range"
                : "Subscribe to use this feature"
            }
          >
            <RangePicker
              minDate={dayjs().subtract(30, "day")}
              maxDate={dayjs().subtract(6, "day")}
              defaultValue={[date[0], date[1]]}
              onChange={dateChangeHandler}
              disabled={userContext.userDetails.quota.limit <= 10}
              title="Select Date Range"
            />
          </Tooltip> */}
          <Tooltip
            title={
              userContext.userDetails.quota.limit > 10
                ? "Select Date Range"
                : "Subscribe to see orders for 30 days"
            }
          >
            <RangePicker
              minDate={dayjs().subtract(
                userDetails.quota.limit <= 10 ? 12 : 36,
                "day"
              )}
              maxDate={dayjs().subtract(6, "day")}
              defaultValue={[date[0], date[1]]}
              onChange={dateChangeHandler}
              title="Select Date Range"
            />
          </Tooltip>
        </div>
      </div>

      {reviewLoading ? (
        <div className="flex justify-center items-center">
          <Spin
            tip="Loading"
            size="large"
            fullscreen={false}
            className="mt-[20%]"
          ></Spin>
        </div>
      ) : (
        <div>
          <Table
            rowSelection={{
              type: "checkbox",

              ...rowSelection,
              selectedRowKeys,
            }}
            rowClassName={(record, index) =>
              record.enabled ? "" : "disabled-row"
            }
            columns={columns}
            dataSource={filteredData}
            pagination={{
              ...pagination,
              disabled: false,
            }}
            onChange={handleTableChange}
          />
        </div>
      )}
    </div>
  );
};

export default ReviewTable;
