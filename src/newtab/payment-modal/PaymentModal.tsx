//if quota exceeded, show payment modal
//if signup show modal for redirect and pay
//if not sign up show sign up modal and ask if already have an account

import { Button, Modal } from "antd";
import React, { useContext, useEffect, useState } from "react";
import { SignIn } from "../sign-in/SignIn";
import { SignUp } from "../sign-up/SignUp";
import { UserContext } from "../UserContext";
import axios from "axios";
import { CheckCircleFilled } from "@ant-design/icons";

type Props = {
  openPopup: boolean;
};

export const PaymentModal = (props: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error("MyComponent must be used within a MyProvider");
  }
  const { userDetails, setUserDetails } = userContext;
  useEffect(() => {
    handlePopup(props.openPopup);
  }, [props.openPopup]);
  // const showModal = () => {
  //   setIsModalOpen(true);
  // };
  const handlePopup = (state: boolean) => {
    setIsModalOpen(state);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const features = [
    "Unlimited review requests",
    "Freemium access to dashboard",
    "Priority support (24x7)",
    "Advanced Filtering Options",
  ];

  return (
    <>
      <Modal
        open={isModalOpen}
        footer={false}
        onCancel={handleCancel}
        onOk={handleOk}
        width={900}
      >
        <div className="p-4">
          {/* <img src="https://cdn.sellerapp.com/img/website-v2/common/sellerapp-black.svg" /> */}
          <div className="bg-white flex flex-row justify-center items-center space-x-3 pt-4">
            <div className="w-3/5 space-y-4">
              <h1 className="text-4xl font-bold">Awesome! You're on Fire! </h1>
              <p className="text-gray-500 pb-1">
                You've maxed out your requests. No worries – you can now unlock
                more requests and keep the fun going! Think of it as leveling up
                your game.
              </p>
              {features.map((feature) => (
                <div className="flex items-center space-x-2 !mt-1">
                  {/* <CheckCircleFilled className="text-green-600" /> */}
                  <span className="material-symbols-outlined text-green-600">
                    check_circle
                  </span>
                  <p>{feature}</p>
                </div>
              ))}
              <p className="space-x-1 pt-10 text-base">
                <span className="line-through text-gray-500">$49</span>{" "}
                <b className="font-medium">$10</b>{" "}
                <span className="text-red-600 bg-red-200 px-2 py-1 rounded-lg">
                  75% OFF
                </span>
              </p>
              <Button
                type="primary"
                className="mr-4"
                size="large"
                onClick={async () => {
                  try {
                    await axios.post(
                      "https://api.sellerapp.com/slack/send?chanel_id=extension-subscription",
                      {
                        message: `User clicked on subscribe`,
                        quota: userDetails?.quota,
                      }
                    );
                  } catch {}

                  (window as any).open(
                    "https://dashboard.sellerapp.com/extension-subscription",
                    "_self"
                  );
                }}
              >
                Unlimited Access for $10
              </Button>
              <Button
                size="large"
                type="link"
                onClick={async () => {
                  try {
                    await axios.post(
                      "https://api.sellerapp.com/slack/send?chanel_id=extension-subscription",
                      {
                        message: `User clicked on contact us`,
                        quota: userDetails?.quota,
                      }
                    );
                  } catch {}
                  (window as any).open(
                    "https://www.sellerapp.com/contact.html",
                    "_blank"
                  );
                }}
              >
                Contact Us
              </Button>
            </div>
            <div
              className="w-2/5"
              style={{
                position: "relative",
                minHeight: "372px",
              }}
            >
              {/* <img src="https://cdn.sellerapp.com/dashboard/extension-payment.png" /> */}
              <img
                src="./img/payment.gif"
                style={{
                  position: "absolute",
                  height: "calc(100% + 102px)",
                  right: "-40px",
                  top: "-54px",
                  borderRadius: "0px 8px 8px 0",
                }}
              />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
