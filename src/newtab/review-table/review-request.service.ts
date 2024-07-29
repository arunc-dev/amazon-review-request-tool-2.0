import axios from "axios";
import { setTimed } from "../../helpers/Cache";
import moment from "moment";

export const requestReview = async (
  baseDomain: string,
  amazonOrderId: string,
  homeMarketplaceId: string
): Promise<{ error?: string; success?: string }> => {
  return new Promise(async (resolve, reject) => {
    try {
      const reviewCheckResponse = await axios.get(
        `${baseDomain}/messaging/api/solicitations/${amazonOrderId}/productReviewAndSellerFeedback?marketplaceId=${homeMarketplaceId}&buyerId=&customerType=&isReturn=false&documentReferrer=https%3A%2F%2Fsellercentral.amazon.com%2Forders-v3%2Forder%2F${amazonOrderId}`
      );
      const csrfToken = reviewCheckResponse.headers["anti-csrftoken-a2z"];
      if (!reviewCheckResponse.data.isSuccess) {
        if (
          reviewCheckResponse.data.ineligibleReason !==
          "REVIEW_REQUEST_ALREADY_SENT"
        ) {
          resolve({ error: reviewCheckResponse.data.ineligibleReason });
        } else {
          await setTimed(
            amazonOrderId,
            "true",
            moment().add(30, "days").format()
          );
          resolve({ success: "Already Requested" });
        }
      } else {
        try {
          const requestReviewResponse = await axios.post(
            `${baseDomain}/messaging/api/solicitations/${amazonOrderId}/productReviewAndSellerFeedback?marketplaceId=${homeMarketplaceId}&buyerId=&customerType=&isReturn=false&documentReferrer=https%3A%2F%2Fsellercentral.amazon.com%2Forders-v3%2Forder%2F${amazonOrderId}`,
            {},
            {
              headers: {
                accept: "*/*",
                "accept-language": "en-US,en;q=0.9,he;q=0.8,de;q=0.7",
                "anti-csrftoken-a2z": csrfToken,
                "content-type": "application/json",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-requested-with": csrfToken,
              },
            }
          );
          if (!requestReviewResponse.data.isSuccess) {
            resolve({
              error: requestReviewResponse.data?.ineligibleReason || "",
            });
          } else {
            resolve({ success: "Successfully Requested " });
            setTimed(amazonOrderId, "true", moment().add(30, "days").format());
          }
        } catch (error: any) {
          error.response?.data;
          resolve({ error: error.response.data?.errorType || "" });
        }
      }
    } catch (error: any) {
      resolve({ error: error.response.data?.errorType || "" });
    }
  });
};
