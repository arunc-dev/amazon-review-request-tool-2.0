import { useContext, useEffect, useState } from "react";
import { getAuthentication } from "../../Auth";
import { httpsCallable, Functions, getFunctions } from "firebase/functions";
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signInWithPopup,
  UserCredential,
} from "firebase/auth";
import { Button, Input } from "antd";
import { GoogleSignIn } from "../google-signIn/GoogleSignIn";
import { UserContext } from "../UserContext";
import { getQuota } from "../helpers";

type Props = {
  handleUserLoginInput: (value: boolean) => void;
};
//signIn react component
export const SignIn = (props: Props) => {
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
  useEffect(() => {
    chrome.cookies.get(
      { url: "https://sellerapp.com", name: "__session" },
      async (sessionCookie) => {
        if (sessionCookie) {
          const functionInstance = getFunctions();
          var validateSessionCookie = httpsCallable(
            functionInstance,
            "validateSessionCookie"
          );
          const token = await validateSessionCookie({
            sessionCookie: sessionCookie.value,
          });
          validateSessionCookie({ sessionCookie: sessionCookie.value }).then(
            async (result: any) => {
              const customToken = result.data.customToken;
              const userCred = await signInAnonymously(customToken);
              const user = userCred.user;
              const quota = await getQuota();
              setUserDetails({
                ...userDetails,
                user,
                quota,
              });
              const token = await userCred.user.getIdToken();
            }
          );
        } else {
          console.log("Can't get cookie! Check the name!");
        }
      }
    );

    return () => {};
  }, []);
  const signInAnonymously = (token: string): Promise<UserCredential> => {
    const auth = getAuthentication();
    return signInWithCustomToken(auth, token);
  };
  const signIn = (email: string, password: string): Promise<UserCredential> => {
    const auth = getAuthentication();
    return signInWithEmailAndPassword(auth, email, password);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCreds = await signIn(email, password);
      const user = await userCreds.user;
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

  // const handleGoogleLogin = () => {
  //   const auth = getAuthentication();
  //   const provider = new GoogleAuthProvider();
  //   signInWithPopup(auth, provider)
  //     .then((result) => {
  //       const user = result.user;
  //       console.log(user, "user");
  //     })
  //     .catch((error) => {
  //       console.log(error, "error");
  //     });
  // };

  return (
    <div className="sign-in">
      <h1>Sign In</h1>
      <form className="flex flex-col space-y-4 mt-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button disabled={loading} onClick={handleSignIn}>
          Sign In
        </Button>
        <GoogleSignIn />
        <a onClick={() => props.handleUserLoginInput(false)}>
          New to Sellerapp
        </a>
      </form>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">Signed in successfully!</p>}
    </div>
  );
};
