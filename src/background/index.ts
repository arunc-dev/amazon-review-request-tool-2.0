import * as Cache from "../helpers/Cache";

console.log("background is running");

chrome.runtime.onMessage.addListener((request) => {
  if (request.type === "COUNT") {
    console.log(
      "background has received a message from popup, and count is ",
      request?.count
    );
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  console.log(tab, "tab");
  await chrome.tabs.create({ url: chrome.runtime.getURL("./newtab.html") });
});

export const checkAndShowThankyou = () => {
  Cache.get(Cache.IS_WELCOME_PAGE_SHOWN)
    .then((isShown) => {
      if (!isShown) {
        chrome.tabs.create({
          url: "https://www.sellerapp.com/amazon-review-request-tool.html",
        });
        Cache.set(Cache.IS_WELCOME_PAGE_SHOWN, true);
      }
    })
    .catch((err) => {
      chrome.tabs.create({
        url: "https://www.sellerapp.com/amazon-review-request-tool.html",
      });
      Cache.set(Cache.IS_WELCOME_PAGE_SHOWN, true);
    });
};

checkAndShowThankyou();
