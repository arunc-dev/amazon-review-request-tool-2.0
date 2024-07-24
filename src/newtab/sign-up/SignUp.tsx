import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  UserCredential,
} from "firebase/auth";
import React, { useContext, useState } from "react";
import { getAuthentication } from "../../Auth";
import { axiosAuthInstance } from "../axios_base";
import { set } from "lodash";
import { Button, Input } from "antd";
import { GoogleSignIn } from "../google-signIn/GoogleSignIn";
import { UserContext } from "../UserContext";
import { getQuota } from "../helpers";

type Props = {
  handleUserLoginInput: (value: boolean) => void;
};

export const SignUp = (props: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error("MyComponent must be used within a MyProvider");
  }
  const { userDetails, setUserDetails } = userContext;
  const signUpUser = async (
    email: string,
    password: string,
    userName: string = "test"
  ) => {
    const auth = getAuthentication();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await sendEmailVerification(userCredential.user);
      await updateProfile(userCredential.user, {
        displayName: userName,
      });
      const user = await userCredential.user;
      const claimsPayload = {
        cat: 2,
        aid: user.uid,
        isp: false,
      };
      //updateclaims
      const updateClaimsResponse = await axiosAuthInstance.post(
        "/auth/user/claim",
        claimsPayload
      );
      const updatedToken = await user.getIdToken(true);
      return user;
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await signUpUser(email, password, "");
      const quota = await getQuota();
      setUserDetails({
        ...userDetails,
        user,
        quota,
      });
      setSuccess(true);
    } catch (error: any) {
      setError(error.message);
    }

    setLoading(false);
  };

  return (
    <div>
      <h1>Sign Up</h1>
      <form className="flex flex-col space-y-4 mt-4">
        <Input
          type="text"
          placeholder="Email"
          onChange={(value) => setEmail(value.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          onChange={(value) => setPassword(value.target.value)}
        />

        <Button onClick={handleSignUp}>Sign Up</Button>
        <GoogleSignIn />
        <a onClick={() => props.handleUserLoginInput(true)}>
          Already have an account?
        </a>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};
