import { Button, Layout, Progress, ProgressProps, Tag, Tooltip } from "antd";
import React, { FC, useContext, useEffect, useState } from "react";
import { ReviewGeoDropdown } from "../review-geo-dropdown/ReviewGeoDropdown";
import { Content } from "antd/es/layout/layout";
import ReviewInfoBanner from "../review-info-banner/ReviewInfoBanner";
import { geoMaps, GeoMapsModel } from "../constants/geo-constants";
import ReviewTable from "../review-table/ReviewTable";
import { getAuthentication } from "../../Auth";
import { UserContext } from "../UserContext";
import { getQuota, QuotaModel } from "../helpers";
import { GoogleSignIn } from "../google-signIn/GoogleSignIn";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  signInAnonymously,
  signInWithCustomToken,
  UserCredential,
} from "firebase/auth";
import { LogoutOutlined } from "@ant-design/icons";
import axios from "axios";

const twoColors: ProgressProps["strokeColor"] = {
  "0%": "#09B253",
  "100%": "#FF0000",
};
type Props = {
  onQuotaExhausted: (value: boolean) => void;
};

const QuotaContainer = ({ quota }: { quota: QuotaModel }) => {
  return (
    <Progress
      percent={(quota.usage / quota.limit) * 100}
      strokeColor={twoColors}
      percentPosition={{ align: "start", type: "outer" }}
      format={(percent) => `${quota.usage}/${quota.limit} `}
      size={"small"}
      className="w-32"
    />
  );
};

export default function ReviewRequestContainer(props: Props) {
  const [geoDetails, setGeoDetails] = useState<GeoMapsModel>(geoMaps.AMAZON_US);
  const userContext = useContext(UserContext);
  const [signInStateLoading, setSignInStateLoading] = useState(false);
  if (!userContext) {
    throw new Error("MyComponent must be used within a MyProvider");
  }
  const { userDetails, setUserDetails } = userContext;
  const setGeoDetailsFromProps = (geoDetails: GeoMapsModel) => {
    setIsLoggedIn(true);
    setGeoDetails(geoDetails);
  };
  const handleLogout = () => {
    const auth = getAuthentication();
    auth.signOut();
  };
  useEffect(() => {}, [userContext]);
  useEffect(() => {
    setSignInStateLoading(true);
    const auth = getAuthentication();
    chrome.cookies.get(
      { url: "https://sellerapp.com", name: "__session" },
      async (sessionCookie) => {
        if (sessionCookie) {
          const functionInstance = getFunctions();
          var validateSessionCookie = httpsCallable(
            functionInstance,
            "validateSessionCookie"
          );
          const token = await validateSessionCookie({
            sessionCookie: sessionCookie.value,
          });
          validateSessionCookie({
            sessionCookie: sessionCookie.value,
          }).then(async (result: any) => {
            try {
              const customToken = result.data.customToken;
              const userCred = await signInWithCustomTokenHandler(customToken);
              const user = userCred.user;
              const quota = await getQuota();
              setUserDetails({
                ...userDetails,
                user,
                quota,
              });
              const token = await userCred.user.getIdToken();
              setSignInStateLoading(false);
            } catch (error) {
              const quota = await getQuota();
              setUserDetails({
                ...userDetails,
                user: null,
                quota,
              });
              setSignInStateLoading(false);
            }
          });
        } else {
          const quota = await getQuota();
          setUserDetails({
            ...userDetails,
            user: null,
            quota,
          });
          setSignInStateLoading(false);
          console.log("Can't get cookie! Check the name!");
        }
      }
    );

    return () => {};
  }, []);
  const subscribe = async () => {
    try {
      await axios.post(
        "https://api.sellerapp.com/slack/send?chanel_id=extension-subscription",
        {
          message: `User clicked on subscribe`,
        }
      );
    } catch {}

    (window as any).open(
      "https://dashboard.sellerapp.com/extension-subscription",
      "_self"
    );
  };
  const signInWithCustomTokenHandler = (
    token: string
  ): Promise<UserCredential> => {
    const auth = getAuthentication();
    return signInWithCustomToken(auth, token);
  };
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [refreshPage, setRefreshPage] = useState(true);
  const handleSignIn = (isSignedIn: boolean) => {
    setIsLoggedIn(isSignedIn);
  };
  const openFeedbackForm = () => {
    window.open(
      "https://docs.google.com/forms/d/e/1FAIpQLScygCtSZiISY6IfVFuIBUphmovWrIoGGzNMOq0iWDryRUjZDg/viewform"
    );
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
          {signInStateLoading ? (
            ""
          ) : (
            <div className="flex flex-row space-x-4 items-center">
              <Tooltip
                title={
                  userDetails.quota.limit > 1000
                    ? ""
                    : "Feature Request available only for Premium users"
                }
              >
                <Button
                  onClick={() => openFeedbackForm()}
                  disabled={userDetails.quota.limit <= 10}
                >
                  Request Feature
                </Button>
              </Tooltip>
              {userDetails.quota.limit <= 10 ? (
                <Button type="primary" onClick={() => subscribe()}>
                  Upgrade to Premium
                </Button>
              ) : null}
              {userDetails.quota.limit > 10 ? (
                <Tag color="success" className="px-3 py-1">
                  Premium
                </Tag>
              ) : (
                <QuotaContainer quota={userDetails.quota} />
              )}
              <ReviewGeoDropdown selectedGeo={setGeoDetailsFromProps} />
              {userDetails.user?.displayName ? (
                <div className="flex flex-row items-center space-x-4">
                  <p className="text-sm font-medium text-nowrap ">
                    Hi {userDetails.user?.displayName}
                  </p>
                  <Tooltip title="Logout">
                    <Button
                      shape="circle"
                      onClick={handleLogout}
                      icon={<LogoutOutlined />}
                    />
                  </Tooltip>
                </div>
              ) : (
                <Button
                  type="primary"
                  onClick={() =>
                    window.open(
                      "https://dashboard.sellerapp.com/login?source=extension",
                      "_self"
                    )
                  }
                >
                  Login
                </Button>
              )}
            </div>
          )}
        </div>
      </header>
      <Content>
        <ReviewInfoBanner />
        {isLoggedIn ? (
          <ReviewTable
            isSignedIn={handleSignIn}
            amazonEndpoint={`https://${geoDetails.baseDomain}`}
            refreshPage={refreshPage}
            isQuotaExhausted={(value: boolean) => props.onQuotaExhausted(value)}
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
}
