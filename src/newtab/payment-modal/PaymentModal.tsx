//if quota exceeded, show payment modal
//if signup show modal for redirect and pay
//if not sign up show sign up modal and ask if already have an account

import { Button, Modal } from "antd";
import React, { useContext, useEffect, useState } from "react";
import { SignIn } from "../sign-in/SignIn";
import { SignUp } from "../sign-up/SignUp";
import { UserContext } from "../UserContext";

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

  return (
    <>
      <Modal
        open={isModalOpen}
        footer={false}
        onCancel={handleCancel}
        onOk={handleOk}
        width={1000}
      >
        <div className="p-4">
          <img src="https://cdn.sellerapp.com/img/website-v2/common/sellerapp-black.svg" />
          <div className="bg-white flex flex-row justify-center items-center space-x-3">
            <div className="w-3/5 space-y-4">
              <h1 className="text-4xl font-medium">Uh! Oh!</h1>
              <p className="text-[#ADB5BD]">
                {userDetails.quota.limit >= userDetails.quota.usage
                  ? "It looks like you are requesting more than your user limit"
                  : "It looks like you have hit the review request limit"}
              </p>
              <Button
                type="primary"
                className="mr-4"
                onClick={() =>
                  (window as any).open(
                    "https://dashboard.sellerapp.com/extension-subscription",
                    "_self"
                  )
                }
              >
                Subscribe to Pro Version - $10
              </Button>
              <Button
                onClick={() =>
                  (window as any).open(
                    "https://www.sellerapp.com/contact.html",
                    "_blank"
                  )
                }
              >
                Get in Touch
              </Button>
            </div>
            <div className="w-2/5">
              <img src="https://cdn.sellerapp.com/dashboard/extension-payment.png" />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
