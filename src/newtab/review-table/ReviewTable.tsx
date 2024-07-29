import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Spin,
  Table,
  TableColumnsType,
  TablePaginationConfig,
  Tooltip,
} from "antd";
import { ReviewResponseModel } from "../interfaces/review-response.interface";
import _ from "lodash";
import { requestReview } from "./review-request.service";
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
}

const renderProductColumn = (text: string, record: DataType) => (
  <div className="">
    {record.products.map((item, index) => (
      <div
        key={item.orderItemId}
        className="row flex space-x-2 justify-center items-center pt-1 pb-1"
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
            ASIN: <b>{item.asin}</b>
          </span>
          <span>
            SKU: <b>{item.sku}</b>
          </span>
          <span>
            {" "}
            Quantity Ordered: <b>{item.quantityOrdered}</b>
          </span>
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

const ReviewTable = (props: {
  amazonEndpoint: string;
  isSignedIn: (isSignedIn: boolean) => void;
  refreshPage: boolean;
  isQuotaExhausted: (value: boolean) => void;
}) => {
  const [page, setPage] = useState(0);
  const [reviewData, setReviewData] = useState<DataType[]>([]);
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
  const [date, setDate] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(6, "day").startOf("day"),
    dayjs().subtract(6, "day").endOf("day"),
  ]);

  // useEffect(() => {
  //   if (userContext.userDetails.quota.limit <= 10) {
  //     setPagination({
  //       current: 1,
  //       pageSize: 10,
  //       total: 0,
  //     });
  //   }
  // }, []);
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
            {_.startCase(text)}
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
                <Button
                  type="link"
                  loading={record.isLoading}
                  iconPosition={"end"}
                  className="text-[#094CC0] pl-0"
                  onClick={() => requestCustomerReview(record, "single")}
                >
                  Request Review
                </Button>
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
        record.successMessage =
          _.startCase(_.lowerCase(response.success)) || "";
      } else {
        record.errorMessage = _.startCase(_.lowerCase(response.error)) || "";
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

  const fetchReviewDetails = async (
    pageSize: number,
    current: number,
    dateDetails: any = date
  ) => {
    setReviewLoading(true);
    try {
      const response = await axios.get<ReviewResponseModel>(
        `${props.amazonEndpoint}/orders-api/search?limit=${pageSize}&offset=${pageSize * current - pageSize}&sort=order_date_asc&date-range=${dateDetails[0].unix() * 1000}-${dateDetails[1].unix() * 1000}&fulfillmentType=all&orderStatus=shipped&forceOrdersTableRefreshTrigger=false`
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
        transformOrderData(response.data);
      }
    } catch (error) {
      props.isSignedIn(false);
    }
  };
  // const transformOrderData = async (data: ReviewResponseModel) => {
  //   let allOrders: DataType[] = [];
  //   await Promise.all(
  //     data.orders.map(async (order) => {
  //       const orderItems = await Promise.all(
  //         order.orderItems.map(async (item) => {
  //           try {
  //             await getTimed(item.orderItemId);
  //             item.isRequested = true;
  //           } catch (error) {
  //             item.isRequested = false;
  //           }
  //           return {
  //             key: item.orderItemId,
  //             productName: item.productName,
  //             productImage: item.imageUrl,
  //             asin: item.asin,
  //             sku: item.sellerSku,
  //             quantityOrdered: item.quantityOrdered,
  //             orderId: order.amazonOrderId,
  //             relativeOrderDate: order.relativeOrderDate,
  //             salesChannel: order.salesChannel,
  //             orderType: order.shippingService,
  //             orderStatus: order.orderFulfillmentStatus,
  //             country: item.billingCountry,
  //             homeMarketplaceId: order.homeMarketplaceId,
  //             isRequested: item.isRequested,
  //             productLink: item.productLink,
  //           };
  //         })
  //       );
  //       console.log(orderItems);
  //       allOrders.push(...orderItems);
  //     })
  //   );
  //   setReviewData(allOrders);
  //   setReviewLoading(false);
  // };
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
            };
          }),
        };
      })
    );
    allOrders.push(...orderItems);
    setReviewData(allOrders);
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
  return (
    <div className="reviewTable">
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
          {userDetails.quota.limit <= 10 ? (
            <Button
              type="primary"
              onClick={() =>
                (window as any).open(
                  "https://dashboard.sellerapp.com/extension-subscription",
                  "_self"
                )
              }
            >
              Subscribe
            </Button>
          ) : null}
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
            columns={columns}
            dataSource={reviewData}
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
