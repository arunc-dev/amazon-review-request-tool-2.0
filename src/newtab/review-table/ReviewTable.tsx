import React, { useEffect, useState } from "react";
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
import _, { set } from "lodash";
import { requestReview } from "./review-request.service";
import { getTimed } from "../../helpers/Cache";
import { DatePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import "./ReviewTable.css";
const { RangePicker } = DatePicker;
const dateFormat = "YYYY-MM-DD";
interface DataType {
  key: React.Key;
  productName: string;
  productImage: string;
  asin: string;
  sku: string;
  quantityOrdered: number;
  orderId: string;
  relativeOrderData: string;
  salesChannel: string;
  orderType: string;
  orderStatus: string;
  country: string;
  homeMarketplaceId: string;
  isRequested: boolean;
  successMessage?: string;
  errorMessage?: string;
}

const renderProductColumn = (text: string, record: DataType) => (
  <div className="row flex space-x-2 justify-center items-center">
    <img
      src={record.productImage}
      alt={record.productName}
      width="70px"
      className="object-contain	"
    />
    <div className="flex-col flex w-[calc(100%-92px)] space-y-1">
      <Tooltip placement="topLeft" title={text}>
        <span className="truncate ...">{text}</span>
      </Tooltip>
      <span>
        ASIN: <b>{record.asin}</b>
      </span>
      <span>
        SKU: <b>{record.sku}</b>
      </span>
      <span>
        {" "}
        Quantity Ordered: <b>{record.quantityOrdered}</b>
      </span>
    </div>
  </div>
);

const renderOrderDetailsColumn = (text: string, record: DataType) => (
  <div className="flex flex-col space-y-2">
    <span>
      Order ID: <b>{record.orderId}</b>
    </span>
    <span>
      Order Date: <b>{record.relativeOrderData}</b>
    </span>
    <span>
      Marketplace: <b>Amazon {record.country}</b>
    </span>
  </div>
);

const ReviewTable = (props: {
  amazonEndpoint: string;
  limit: number;
  timeFrame: string;
}) => {
  const [page, setPage] = useState(0);
  const [reviewData, setReviewData] = useState<DataType[]>([]);
  const [pagination, setPagination] = useState<any>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [reviewLoading, setReviewLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<DataType[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [date, setDate] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(6, "day").startOf("day"),
    dayjs().subtract(6, "day").endOf("day"),
  ]);
  useEffect(() => {
    fetchReviewDetails(pagination.pageSize, pagination.current);
    console.log("fetching review details", date);
  }, []);
  useEffect(() => {}, [reviewData]);

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
          <div>
            {record.isRequested ? (
              <p className="text-green-500">Already Requested</p>
            ) : (
              <div>
                <a
                  className="text-[#094CC0]"
                  onClick={() => requestCustomerReview(record)}
                >
                  Request Review
                </a>
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
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        "selectedRows: ",
        selectedRows
      );
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows(selectedRows);
    },
    getCheckboxProps: (record: DataType) => ({
      // disabled: record.name === "Disabled User", // Column configuration not to be checked
      // name: record.name,
    }),
  };
  const requestCustomerReview = async (record: DataType) => {
    const response = await requestReview(
      props.amazonEndpoint,
      record.orderId,
      record.homeMarketplaceId
    );
    console.log(response, "finalRespinse");
    if (response.success) {
      record.successMessage = _.startCase(_.lowerCase(response.success)) || "";
    } else {
      record.errorMessage = _.startCase(_.lowerCase(response.error)) || "";
    }
    setReviewData([...reviewData]);
    return response;
  };

  const bulkReviewRequest = async () => {
    setBulkLoading(true);
    console.log("selectedRows", selectedRows);
    for (const row of selectedRows) {
      await requestCustomerReview(row);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    setSelectedRows([]);
    setSelectedRowKeys([]);
    setBulkLoading(false);
  };

  const fetchReviewDetails = async (
    pageSize: number,
    current: number,
    dateDetails: any = date
  ) => {
    setReviewLoading(true);
    console.log(pagination, "pagination in fetchReviewDetails");
    const response = await axios.get<ReviewResponseModel>(
      `${props.amazonEndpoint}/orders-api/search?limit=${pageSize}&offset=${pageSize * current - pageSize}&sort=order_date_desc&date-range=${dateDetails[0].unix() * 1000}-${dateDetails[1].unix() * 1000}&fulfillmentType=all&orderStatus=shipped&forceOrdersTableRefreshTrigger=false`
    );
    setPagination({
      current: current,
      pageSize: pageSize,
      total: response.data.total,
    });
    transformOrderData(response.data);
  };
  const transformOrderData = async (data: ReviewResponseModel) => {
    let allOrders: DataType[] = [];
    await Promise.all(
      data.orders.map(async (order) => {
        const orderItems = await Promise.all(
          order.orderItems.map(async (item) => {
            try {
              await getTimed(item.orderItemId);
              item.isRequested = true;
            } catch (error) {
              item.isRequested = false;
            }
            return {
              key: item.orderItemId,
              productName: item.productName,
              productImage: item.imageUrl,
              asin: item.asin,
              sku: item.sellerSku,
              quantityOrdered: item.quantityOrdered,
              orderId: order.amazonOrderId,
              relativeOrderData: order.relativeOrderDate,
              salesChannel: order.salesChannel,
              orderType: order.shippingService,
              orderStatus: order.orderFulfillmentStatus,
              country: item.billingCountry,
              homeMarketplaceId: order.homeMarketplaceId,
              isRequested: item.isRequested,
            };
          })
        );
        allOrders.push(...orderItems);
      })
    );
    setReviewData(allOrders);
    setReviewLoading(false);
  };
  // useEffect(() => {
  //   console.log("rendered reviewtable");
  // });

  const handleTableChange = (
    paginationMutated: any,
    filters: any,
    sorter: any
  ) => {
    setPagination(() => {
      return {
        ...pagination,
        current: paginationMutated.current,
        pageSize: paginationMutated.pageSize,
      };
    });
    console.log(pagination, "pagination details in handleTableChange");
    fetchReviewDetails(paginationMutated.pageSize, paginationMutated.current);
  };
  const dateChangeHandler = (date: any) => {
    console.log(
      dayjs(date[0]).startOf("days").unix(),
      dayjs(date[1]).endOf("days").unix()
    );
    const dateToPass = [
      dayjs(date[0]).startOf("days"),
      dayjs(date[1]).endOf("days"),
    ];
    setDate([dateToPass[0], dateToPass[1]]);
    fetchReviewDetails(pagination.pageSize, 1, dateToPass);
  };
  return (
    <div className="reviewTable">
      <div className="my-5 justify-between items-center flex">
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
          <RangePicker
            minDate={dayjs().subtract(30, "day")}
            maxDate={dayjs().subtract(6, "day")}
            defaultValue={[date[0], date[1]]}
            onChange={dateChangeHandler}
          />
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
        <div className="border-2 border-indigo-600">
          <Table
            rowSelection={{
              type: "checkbox",

              ...rowSelection,
              selectedRowKeys,
            }}
            columns={columns}
            dataSource={reviewData}
            pagination={pagination}
            onChange={handleTableChange}
          />
        </div>
      )}
    </div>
  );
};

export default ReviewTable;
