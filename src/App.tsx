import { useEffect, VFC } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useAppDispatch, useAppSelector } from "./app/hooks";

import { login, logout, selectUser } from "./features/userSlice";
import { auth } from "./firebase/firebase";
import { Feed } from "./components/Feed";
import { Auth } from "./components/Auth";
import styles from "./styles/App.module.css";

const App: VFC = () => {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        dispatch(
          login({
            uid: authUser.uid,
            photoUrl: authUser.photoURL,
            displayName: authUser.displayName,
          })
        );
      } else {
        dispatch(logout());
      }
    });

    return () => {
      unSub();
    };
  }, [dispatch]);

  return (
    <>
      {user.uid ? (
        <div className={styles.app}>
          <Feed />
        </div>
      ) : (
        <Auth />
      )}
    </>
  );
};

export default App;
