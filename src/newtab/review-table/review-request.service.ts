import axios, { AxiosPromise, AxiosRequestConfig, AxiosResponse } from "axios";
import { setTimed } from "../../helpers/Cache";
import moment from "moment";

export interface RefundStatusResponse {
  refundSummaryList: RefundSummaryList[];
}

export interface RefundSummaryList {
  ItemMap: ItemMap;
  OrderId: string;
  RefundStatus: string;
}

export interface ItemMap {
  "+NE7Z+p/vbCrXqSDNFY7hh1YR+fjIrElgUqvzS9eEVK0UF/Ou/U+jw==": number;
}
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

// Function to process tasks in batches
export async function processInBatches(
  tasks: { asin: string; api: any }[],
  batchSize: number
) {
  // console.log(tasks, "tasks");
  let allData: any[] = [];
  // Split tasks into batches
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);

    // Execute all tasks in the batch and wait for them to complete
    const data = await Promise.all(
      batch.map(async (task) => {
        const data = await task.api();
        {
          return { api: data, asin: task.asin, data: data };
        }
      })
    );
    allData = [...allData, ...data];
    // console.log(data, "fafasf");
    // return data;
    // console.log(`Batch ${Math.floor(i / batchSize) + 1} completed`);
  }
  return allData;

  // console.log("All batches completed");
}

// Usage
// processInBatches(tasks, 2)
//   .then(() => console.log("All tasks completed"))
//   .catch((err) => console.error("An error occurred:", err));
