import { getAuthentication } from "../Auth";
import { getTimed } from "../helpers/Cache";
import { fetchQuota } from "./axios_base";
export interface QuotaModel {
  frequency: string;
  limit: number;
  next_reset: string;
  usage: number;
}
const getTimedQuota = async (): Promise<QuotaModel> => {
  try {
    const quota = (await getTimed("quota")) as any;
    console.log(quota, "quotaFromgssdgsdgsdg");
    return JSON.parse(quota) as QuotaModel;
  } catch (error) {
    console.log(error, "rfwefwjkebfk");
    return {
      frequency: "",
      limit: 5,
      next_reset: "",
      usage: 0,
    };
  }
};
//debounce a function call
export const debounce = (fn: any, delay: number) => {
  let timeoutID: any;
  return function (this: any, ...args: any) {
    clearTimeout(timeoutID);
    timeoutID = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

//how to use above debounce function
// const debouncedFunction = debounce(() => {

// }, 1000);

export const getQuota = async (): Promise<QuotaModel> => {
  return new Promise(async (resolve, reject) => {
    let unsubscribe: any;
    unsubscribe = await getAuthentication().onAuthStateChanged(async (user) => {
      console.log(user, "userFromQuota");
      if (user) {
        try {
          const quotaDetails = await fetchQuota();
          resolve(quotaDetails.data.data.global_quota.ext.addition);
        } catch (error) {
          console.log(error, "afkjabfkjbkfjabskjf");
          resolve(await getTimedQuota());
        }
      } else {
        resolve(await getTimedQuota());
      }
    });
  });
};

// export const getQuota = (getQuotaFunction, 1000);
