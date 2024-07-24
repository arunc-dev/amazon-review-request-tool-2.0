import { createContext, useContext, useEffect, useState } from "react";

import "./NewTab.css";
import ReviewRequestContainer from "./review-request-container/ReviewRequestContainer";
import { getAuthentication } from "../Auth";
import queryString from "query-string";
import { PaymentModal } from "./payment-modal/PaymentModal";
import { UserContext, UserContextProvider } from "./UserContext";
import { getQuota } from "./helpers";
import { set } from "lodash";

export const NewTab = () => {
  // const navigate = useNavigate();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [popupState, setPopupState] = useState(false);
  useEffect(() => {
    // navigate("/signIn");
    const query = queryString.parse(location.search);
    if (query.isPaymentSuccess) {
      const auth = getAuthentication();
      auth.currentUser
        ?.getIdToken(true)
        .then((token) => {
          setIsLoading(false);
        })
        .catch((error) => {
          setIsLoading(false);
        });
    }

    // const auth = getAuthentication();
    // auth.onAuthStateChanged(async (user) => {
    //   if (user) {
    //     setIsSignedIn(true);
    //     const quota = await getQuota();
    //     console.log(user, "User is signed in");
    //   } else {
    //     setIsSignedIn(false);
    //     console.log("User is signed out");
    //   }
    // });
  }, []);

  const handleQuotaExhaust = () => {
    //to reopen the modal. This is a hack to reopen the modal
    setPopupState(false);
    setTimeout(() => {
      setPopupState(true);
    }, 0);
  };
  return (
    <UserContextProvider>
      <ReviewRequestContainer onQuotaExhausted={handleQuotaExhaust} />
      <PaymentModal openPopup={popupState} />
    </UserContextProvider>
  );
};

export default NewTab;
