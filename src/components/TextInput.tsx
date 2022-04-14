import { VFC, useState } from "react";
import { useAppSelector } from "../app/hooks";
import { selectUser } from "../features/userSlice";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Avatar, Button, IconButton } from "@mui/material";
import AddAPhotoIcon from "@material-ui/icons/AddAPhoto";

import { auth, db, storage } from "../firebase/firebase";
import styles from "../styles/TextInput.module.css";

export const TextInput: VFC = () => {
  const user = useAppSelector(selectUser);
  const [images, setImages] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  const onClickAvatar = async () => {
    await auth.signOut();
  };
  const onSubmitSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (images) {
      // ランダムな画像ファイル名を作成
      const S = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const N = 16;
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
        .map((n) => S[n % S.length])
        .join("");
      const fileName = randomChar + "_" + images.name;
      const uploadImages = uploadBytesResumable(
        ref(storage, `images/${fileName}`),
        images
      );
      uploadImages.on(
        "state_changed",
        () => {},
        (err) => {
          alert(err.message);
        },
        async () => {
          await getDownloadURL(ref(storage, `images/${fileName}`)).then(async (url) => {
            addDoc(collection(db, "posts"), {
              avatar: user.photoUrl,
              image: url,
              text: message,
              timestamp: serverTimestamp(),
              username: user.displayName,
            });
          });
        }
      );
    } else {
      // 画像がないとき
      addDoc(collection(db, "posts"), {
        avatar: user.photoUrl,
        image: "",
        text: message,
        timestamp: serverTimestamp(),
        username: user.displayName,
      });
    }
    // リセット
    setImages(null);
    setMessage("");
  };
  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };
  // 画像をファイルから選択し，受け取る
  const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files![0]) {
      setImages(e.target.files![0]);
      e.target.value = "";
    }
  };

  return (
    <>
      <form onSubmit={onSubmitSend}>
        <div className={styles.text_form}>
          <Avatar
            className={styles.text_avatar}
            src={user.photoUrl}
            onClick={onClickAvatar}
          />

          <input
            className={styles.text_input}
            placeholder="hello world!!"
            type="text"
            autoFocus
            value={message}
            onChange={onChangeInput}
          />

          <IconButton>
            <label>
              <AddAPhotoIcon
                className={images ? styles.text_addIconLoaded : styles.text_addIcon}
              />

              <input
                className={styles.text_hiddenIcon}
                type="file"
                onChange={onChangeImageHandler}
              />
            </label>
          </IconButton>
        </div>

        <Button
          className={message ? styles.text_sendBtn : styles.text_sendDisableBtn}
          type="submit"
          disabled={!message}
        >
          Send
        </Button>
      </form>
    </>
  );
};
