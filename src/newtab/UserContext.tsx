import React, { createContext, useMemo, useState } from "react";
import { QuotaModel } from "./helpers";
export interface UserContextModel {
  isSignedIn: boolean;
  isLoading: boolean;
  quota: QuotaModel;
  user: any;
}

interface UserContextType {
  userDetails: UserContextModel;
  setUserDetails: React.Dispatch<React.SetStateAction<UserContextModel>>;
}

const intialState: UserContextModel = {
  isSignedIn: false,
  isLoading: true,
  quota: {
    frequency: "",
    limit: 5,
    next_reset: "",
    usage: 0,
  },
  user: null,
};
// Create a context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Create a provider component
const UserContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [userDetails, setUserDetails] = useState<UserContextModel>(intialState);
  const contextValue = useMemo<UserContextType>(
    () => ({ userDetails, setUserDetails }),
    [userDetails]
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export { UserContext, UserContextProvider };
