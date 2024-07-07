import moment from "moment";
export const IS_WELCOME_PAGE_SHOWN = "IS_WELCOME_PAGE_SHOWN";

export const get = (key: string) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (results) => {
      if (results[key]) {
        resolve(results[key]);
      } else {
        reject(new Error(`key ${key} not found.`));
      }
    });
  });
};

export const set = (key: string, value: any) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, () => {
      resolve(true);
    });
  });
};

export const remove = (key: string) => {
  chrome.storage.local.remove(key, () => {
    console.log("removed");
  });
};

/* Get values cached with expiration time.
 */
export const getTimed = (key: string) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (results) => {
      if (results[key]) {
        // check for expiration
        const value = results[key];
        if (moment().isAfter(moment(value.expiration))) {
          remove(key);
          reject(new Error("expired"));
        } else {
          resolve(value.value);
        }
      } else {
        reject(new Error(`key ${key} not found.`));
      }
    });
  });
};

/* Set values cached with expiration time.
   value saved as { expiration: 'datetime', value: value }
*/
export const setTimed = (key: string, value: string, expiration: string) => {
  return new Promise((resolve, reject) => {
    const toSave = {
      [key]: {
        value,
        expiration: moment(expiration).format(),
      },
    };
    chrome.storage.local.set(toSave, () => {
      resolve({ status: "saved" });
    });
  });
};

export const clearExpired = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(null, (results) => {
      const keys = Object.keys(results);
      keys.forEach((key) => {
        const value = results[key];
        if (value.expiration && moment().isAfter(moment(value.expiration))) {
          remove(key);
        }
      });
      resolve({ status: "done" });
    });
  });
};
