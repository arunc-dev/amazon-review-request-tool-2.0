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
    <Layout className="p-4 bg-white">
      <header className="">
        <div className="flex justify-between items-center">
          <div className="flex justify-center items-center">
            <img src="../src/assets/logo.png" alt="logo" width="50px" />
            <span>Review Request Tool</span>
          </div>
          <ReviewGeoDropdown selectedGeo={setGeoDetailsFromProps} />
        </div>
      </header>
      <Content style={{ padding: "0 48px" }}>
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
