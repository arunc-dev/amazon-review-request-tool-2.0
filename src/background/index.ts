import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { getAuthentication } from "../Auth";
import * as Cache from "../helpers/Cache";

console.log("background is running");

chrome.action.onClicked.addListener(async (tab) => {
  await chrome.tabs.create({ url: chrome.runtime.getURL("./newtab.html") });
});

const handleSignIn = () => {
  chrome.identity.getAuthToken({ interactive: true }, (token) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    } else if (token) {
      console.log(token, "token");
      // Authorize Firebase with the OAuth Access Token.
      const auth = getAuthentication();

      // const provider = new GoogleAuthProvider();
      const credential = GoogleAuthProvider.credential(null, token);
      signInWithCredential(auth, credential)
        .then(async (data) => {
          // const { isNewUser } = getAdditionalUserInfo(data);
          const { uid } = data.user;

          // if (isNewUser) {
          //   const token = await data.user.getIdToken();
          //   const payload = {
          //     claims: {
          //       cat: 2,
          //       aid: uid,
          //       isp: false,
          //     },
          //     token,
          //   };
          //   // await addSessionClaimsV2(payload);
          //   response({
          //     code: "Please complete onboarding before using extension",
          //     message: "Please complete onboarding before using extension",
          //   });
          //   logoutUser();
          // } else {
          //   const user = data.user;
          //   store.dispatch(setUserInfo(user as any));
          //   response(user);
          // }
        })
        .catch((error) => {
          // The OAuth token might have been invalidated. Lets' remove it from cache.
          if (error.code === "auth/invalid-credential") {
            chrome.identity.removeCachedAuthToken(
              { token: token },
              function () {
                // startAuth(interactive);
              }
            );
          }
          console.log(error, "error");
          // response({
          //   message: getError(error.code),
          //   code: error.code,
          // });
        });
    } else {
      console.error("The OAuth Token was null");
    }
  });
};

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
// handleSignIn();
