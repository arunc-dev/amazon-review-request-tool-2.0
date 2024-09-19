import { Button, Input, Select, Space, Tooltip } from "antd";
import React, { useState } from "react";
import _ from "lodash";
import "./ReviewFilters.css";
import {
  FileSearchOutlined,
  InfoCircleFilled,
  SearchOutlined,
} from "@ant-design/icons";
export type ReviewFiltersProps = "rating" | "orderStatus";
export enum ReviewFiltersEnum {
  rating = "rating",
  orderStatus = "orderStatus",
  orderType = "orderType",
  sortBy = "sortBy",
}
const inPageFilters: { [key in ReviewFiltersEnum]: string[] } = {
  rating: [],
  orderStatus: [],
  orderType: [],
  sortBy: [],
};
type Props = {
  onFilterChange: (qtOption: string, qtValue: string) => void;
  availableOrderStatus: string[];
  onInPageFilterChange: (filters: {
    [key in ReviewFiltersEnum]: string[];
  }) => void;
  isDisabled: boolean;
};

const amazonFilters = [
  {
    label: "ASIN",
    value: "asin",
  },
  {
    label: "Buyer Email",
    value: "email",
  },
  {
    label: "Listing ID",
    value: "sdp-listing-id",
  },
  {
    label: "SKU",
    value: "sku",
  },
  {
    label: "Product Name",
    value: "product-name",
  },
  {
    label: "Tracking ID",
    value: "tracking-id",
  },
];

export const ReviewFilters = (props: Props) => {
  const [qtOption, setQtOption] = useState("asin");
  const [qtValue, setQtValue] = useState("");
  const handleChange = () => {
    props.onFilterChange(qtOption, qtValue);
  };
  const handleInPageFilterChange = (
    e: string[],
    filterType: ReviewFiltersEnum
  ) => {
    inPageFilters[filterType] = typeof e === "string" ? [e] : e;
    props.onInPageFilterChange(inPageFilters);
  };
  return (
    <div className="flex flex-row  flex-wrap">
      <div className="filter-container mr-6">
        <h2 className="text-base mb-2 mt-2">Amazon Filters</h2>
        <div className="space-x-2 ">
          <Select
            defaultValue="asin"
            style={{ width: 120 }}
            onChange={(e) => setQtOption(e)}
            options={amazonFilters}
            disabled={props.isDisabled}
          />
          <Space.Compact style={{ width: 250 }}>
            <Input
              placeholder="Search"
              onChange={(e) => setQtValue(e.currentTarget.value)}
              disabled={props.isDisabled}
            />
            <Button
              type="primary"
              onClick={handleChange}
              disabled={props.isDisabled}
              icon={<SearchOutlined />}
            />
          </Space.Compact>
        </div>
      </div>
      <div className="filter-container">
        <h2 className="text-base mb-2 mt-2">
          SellerApp Filters{" "}
          <Tooltip title="These filters will apply only to the results displayed on this page">
            <InfoCircleFilled></InfoCircleFilled>
          </Tooltip>
        </h2>
        <div className="flex flex-row space-x-10">
          <div className="space-x-2 flex flex-row">
            <Select
              disabled={props.isDisabled}
              style={{ width: 250 }}
              mode="multiple"
              size="middle"
              placeholder="Select Rating"
              onChange={(e) =>
                handleInPageFilterChange(e, ReviewFiltersEnum.rating)
              }
              options={[
                { label: "1★ & above", value: "1" },
                { label: "2★ & above", value: "2" },
                { label: "3★ & above", value: "3" },
                { label: "4★ & above", value: "4" },
                { label: "5★", value: "5" },
              ]}
            />
            <Select
              style={{ width: 250 }}
              disabled={props.isDisabled}
              mode="multiple"
              size="middle"
              placeholder="Select Order Type"
              onChange={(e) =>
                handleInPageFilterChange(e, ReviewFiltersEnum.orderType)
              }
              options={[
                { label: "Expedited", value: "Expedited" },
                { label: "Standard", value: "Standard" },
                { label: "Second Day", value: "SecondDay" },
              ]}
            />
            <Select
              style={{ width: 250 }}
              disabled={props.isDisabled}
              mode="multiple"
              size="middle"
              placeholder="Select Order Status"
              onChange={(e) =>
                handleInPageFilterChange(e, ReviewFiltersEnum.orderStatus)
              }
              options={[
                { label: "Payment Complete", value: "PaymentComplete" },
                { label: "Canceled", value: "Canceled" },
                { label: "Pending", value: "Pending" },
                { label: "Delivery", value: "Delivery" },
                { label: "Refunded", value: "Refunded" },
              ]}
            />
          </div>
          <div>
            <Select
              style={{ width: 250 }}
              disabled={props.isDisabled}
              size="middle"
              placeholder=" Sort By"
              onChange={(e) =>
                handleInPageFilterChange(e, ReviewFiltersEnum.sortBy)
              }
              options={[
                { label: "Reviews (descending)", value: "reviews-desc" },
                { label: "Reviews (ascending)", value: "reviews-asc" },
                // { label: "BSR(desc)", value: "bsr-desc" },
                // { label: "BSR(asc)", value: "bsr-asc" },
                // { label: "Launched Date(desc)", value: "launcedDate-desc" },
                // { label: "Launched Date(asc)", value: "launcedDate-asc" },
                { label: "Rating (descending)", value: "rating-desc" },
                { label: "Rating (ascending)", value: "rating-asc" },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
