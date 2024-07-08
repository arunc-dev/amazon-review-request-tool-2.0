import { useEffect, useState } from "react";

import "./NewTab.css";
import { Flex, Layout } from "antd";
import { Content, Header } from "antd/es/layout/layout";
import ReviewTable from "./review-table/ReviewTable";
import ReviewInfoBanner from "./review-info-banner/ReviewInfoBanner";
import { ReviewGeoDropdown } from "./review-geo-dropdown/ReviewGeoDropdown";
import { geoMaps, GeoMapsModel } from "./constants/geo-constants";

export const NewTab = () => {
  const [geoDetails, setGeoDetails] = useState<GeoMapsModel>(geoMaps.AMAZON_US);
  const setGeoDetailsFromProps = (geoDetails: GeoMapsModel) => {
    // console.log(geoDetails);
    setGeoDetails(geoDetails);
  };
  useEffect(() => {
    console.log("rendered newtab");
  });
  return (
    <Layout className="p-4 bg-white mb-10" style={{ padding: "0 48px" }}>
      <header className="my-4">
        <div className="flex justify-between items-center">
          <div className="flex justify-center items-center space-x-3">
            <img src="../src/assets/logo.png" alt="logo" width="30px" />
            <span className="font-medium text-lg">
              Amazon Review Request Tool
            </span>
          </div>
          <ReviewGeoDropdown selectedGeo={setGeoDetailsFromProps} />
        </div>
      </header>
      <Content>
        <ReviewInfoBanner />
        <ReviewTable
          amazonEndpoint={`https://${geoDetails.baseDomain}`}
          limit={100}
          timeFrame="1719513000000-1719944999000"
        ></ReviewTable>
      </Content>
    </Layout>
  );
};

export default NewTab;
