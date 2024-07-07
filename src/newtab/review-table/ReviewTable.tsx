import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, TableColumnsType, TablePaginationConfig, Tooltip } from "antd";
import { ReviewResponseModel } from "../interfaces/review-response.interface";
import _, { set } from "lodash";
import { requestReview } from "./review-request.service";
import { getTimed } from "../../helpers/Cache";
import { PaginationConfig } from "antd/es/pagination";

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
        ASIN:<b>{record.asin}</b>
      </span>
      <span>
        SKU:<b>{record.sku}</b>
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

const rowSelection = {
  onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
    console.log(
      `selectedRowKeys: ${selectedRowKeys}`,
      "selectedRows: ",
      selectedRows
    );
  },
  getCheckboxProps: (record: DataType) => ({
    // disabled: record.name === "Disabled User", // Column configuration not to be checked
    // name: record.name,
  }),
};

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
  useEffect(() => {
    fetchReviewDetails(pagination.pageSize, pagination.current);
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
        return <span>{_.startCase(text)}</span>;
      },
    },
    {
      title: "Action",
      render: (_, record) => {
        return (
          <button className="btn" onClick={() => requestCustomerReview(record)}>
            Request Review
          </button>
        );
      },
    },
  ];
  const requestCustomerReview = async (record: DataType) => {
    await requestReview(
      props.amazonEndpoint,
      record.orderId,
      record.homeMarketplaceId
    );
  };
  const fetchReviewDetails = async (pageSize: number, current: number) => {
    console.log(pagination, "pagination in fetchReviewDetails");
    const response = await axios.get<ReviewResponseModel>(
      `${props.amazonEndpoint}/orders-api/search?limit=${pageSize}&offset=${pageSize * current - pageSize}&sort=order_date_desc&date-range=${props.timeFrame}&fulfillmentType=all&orderStatus=shipped&forceOrdersTableRefreshTrigger=false`
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
  };
  // useEffect(() => {
  //   console.log("rendered reviewtable");
  // });

  const handleTableChange = (
    paginationMutated: any,
    filters: any,
    sorter: any
  ) => {
    // setPagination({
    //   ...pagination,
    //   current: paginationMutated.current,
    //   pageSize: paginationMutated.pageSize,
    // });
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

  return (
    <div className="border-2 border-indigo-600">
      <Table
        rowSelection={{
          type: "checkbox",
          ...rowSelection,
        }}
        columns={columns}
        dataSource={reviewData}
        pagination={pagination}
        onChange={handleTableChange}
      />
      {pagination.current} of {pagination.total}
    </div>
  );
};

export default ReviewTable;
