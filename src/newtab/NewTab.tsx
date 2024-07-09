import { useEffect, useState } from "react";

import "./NewTab.css";
import { Button, Flex, Layout } from "antd";
import { Content, Header } from "antd/es/layout/layout";
import ReviewTable from "./review-table/ReviewTable";
import ReviewInfoBanner from "./review-info-banner/ReviewInfoBanner";
import { ReviewGeoDropdown } from "./review-geo-dropdown/ReviewGeoDropdown";
import { geoMaps, GeoMapsModel } from "./constants/geo-constants";

export const NewTab = () => {
  const [geoDetails, setGeoDetails] = useState<GeoMapsModel>(geoMaps.AMAZON_US);
  const setGeoDetailsFromProps = (geoDetails: GeoMapsModel) => {
    setIsLoggedIn(true);
    setGeoDetails(geoDetails);
  };
  useEffect(() => {});
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [refreshPage, setRefreshPage] = useState(true);
  const handleSignIn = (isSignedIn: boolean) => {
    setIsLoggedIn(isSignedIn);
  };
  return (
    <Layout className="p-4 bg-white mb-10" style={{ padding: "0 48px" }}>
      <header className="my-4">
        <div className="flex justify-between items-center">
          <div className="flex justify-center items-center space-x-3">
            <img src="./img/logo.png" alt="logo" width="30px" />
            <span className="font-medium text-lg">
              Amazon Review Request Tool
            </span>
          </div>
          <ReviewGeoDropdown selectedGeo={setGeoDetailsFromProps} />
        </div>
      </header>
      <Content>
        <ReviewInfoBanner />
        {isLoggedIn ? (
          <ReviewTable
            isSignedIn={handleSignIn}
            amazonEndpoint={`https://${geoDetails.baseDomain}`}
            refreshPage={refreshPage}
          ></ReviewTable>
        ) : (
          <div className="text-center min-h-80 flex justify-center items-center flex-col space-y-4 p-16">
            <img src="./img/sellercentral-not-available.png" />
            <h4 className="text-2xl font-medium">
              Unable to access Amazon Seller Central Account.
            </h4>
            <h4 className="text-base">
              Please login to your Amazon Seller Central Account & choose the
              marketplace <br />
              of your choice. Refresh to see the updated content.
            </h4>
            <div className="space-x-4">
              <Button
                onClick={() =>
                  (window as any).open(
                    `https://${geoDetails.baseDomain}`,
                    "_blank"
                  )
                }
              >
                Open Seller Central{" "}
                <span className="material-symbols-outlined">open_in_new</span>
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  setRefreshPage(true);
                  setIsLoggedIn(true);
                }}
              >
                Refresh
                <span className="material-symbols-outlined">refresh</span>
              </Button>
            </div>
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default NewTab;
