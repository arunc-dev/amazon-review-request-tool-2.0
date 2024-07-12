import axios from "axios";
import { get, set, setTimed } from "../../helpers/Cache";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";

export const requestReview = async (
  baseDomain: string,
  amazonOrderId: string,
  homeMarketplaceId: string
): Promise<{ error?: string; success?: string }> => {
  let uuid = "";
  let callCount = 0;
  const date = new Date();
  try {
    uuid = (await get("uuid")) as string;
  } catch (error) {
    uuid = uuidv4();
    set("uuid", uuid);
  }
  try {
    callCount = (await get("callCount")) as number;
    callCount++;
    set("callCount", callCount);
  } catch (error) {
    callCount = 1;
    set("callCount", callCount);
  }

  return new Promise(async (resolve, reject) => {
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
        axios.post(
          "https://hooks.slack.com/services/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",
          {
            text: `uuid: ${uuid}\nstatus: failed\nmessage: ${reviewCheckResponse.data?.ineligibleReason}\ncallCount: ${callCount}\ndate: ${date.toString()}`,
          }
        );
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
          axios.post(
            "https://hooks.slack.com/services/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",
            {
              text: `uuid: ${uuid}\nstatus: failed\nmessage: ${requestReviewResponse.data?.ineligibleReason}\ncallCount: ${callCount}\ndate: ${date.toString()}`,
            }
          );
          resolve({
            error: requestReviewResponse.data?.ineligibleReason || "",
          });
        } else {
          axios.post(
            "https://hooks.slack.com/services/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",
            {
              text: `uuid: ${uuid}\nstatus: success\nmessage: Successfully Requested ${amazonOrderId}\ncallCount: ${callCount}\ndate: ${date.toString()}`,
            }
          );
          resolve({ success: "Successfully Requested " });
          setTimed(amazonOrderId, "true", moment().add(30, "days").format());
        }
      } catch (error: any) {
        error.response?.data;
        axios.post(
          "https://hooks.slack.com/services/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",
          {
            text: `uuid: ${uuid}\nstatus: failed\nmessage: ${error.response.data?.errorType}\ncallCount: ${callCount}\ndate: ${date.toString()}`,
          }
        );
        resolve({ error: error.response.data?.errorType || "" });
      }
    }
  });
};
