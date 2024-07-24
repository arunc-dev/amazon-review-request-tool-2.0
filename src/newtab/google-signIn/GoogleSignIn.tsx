import React, { useContext } from "react";
import { getAuthentication } from "../../Auth";
import {
  getAdditionalUserInfo,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { getQuota } from "../helpers";
import { UserContext } from "../UserContext";
import { axiosAuthInstance } from "../axios_base";

type Props = {};

export const GoogleSignIn = (props: Props) => {
  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error("MyComponent must be used within a MyProvider");
  }
  const { userDetails, setUserDetails } = userContext;
  const handleGoogleLogin = async () => {
    chrome.identity.getAuthToken({ interactive: false }, async (token) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        // return;
      } else if (token) {
        // Authorize Firebase with the OAuth Access Token.
        const auth = getAuthentication();

        // const provider = new GoogleAuthProvider();
        const credential = GoogleAuthProvider.credential(null, token);
        const userCreds = await signInWithCredential(auth, credential);
        const isNewUser = getAdditionalUserInfo(userCreds)?.isNewUser;
        // signInWithCredential(auth, credential)
        //   .then(async (data) => {
        //     // const { isNewUser } = getAdditionalUserInfo(data);
        //     const { uid } = data.user;
        if (isNewUser) {
          const claimsPayload = {
            claims: {
              cat: 2,
              aid: userCreds.user.uid,
              isp: false,
            },
          };

          //updateclaims
          const updateClaimsResponse = await axiosAuthInstance.post(
            "/auth/user/claim",
            claimsPayload
          );
          const updatedToken = await userCreds.user.getIdToken(true);
        }
        // const user = (await userCreds).user;
        // const quota = await getQuota();
        // setUserDetails({
        //   ...userDetails,
        //   user,
        //   quota,
        // });
        //   })
        //   .catch((error) => {
        //     // The OAuth token might have been invalidated. Lets' remove it from cache.
        //     // if (error.code === "auth/invalid-credential") {
        //     //   chrome.identity.removeCachedAuthToken(
        //     //     { token: token },
        //     //     function () {
        //     //       // startAuth(interactive);
        //     //     }
        //     //   );
        //     // }
        //     console.log(error, "error");
        //     // response({
        //     //   message: getError(error.code),
        //     //   code: error.code,
        //     // });
        //   });
      } else {
        console.error("The OAuth Token was null");
      }
    });
  };
  return <button onClick={handleGoogleLogin}>Google Login</button>;
};
