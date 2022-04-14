import { VFC, useState, useEffect } from "react";
import { useAppSelector } from "../app/hooks";
import { selectUser } from "../features/userSlice";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { makeStyles } from "@material-ui/core/styles";
import { Avatar } from "@mui/material";
import MessageIcon from "@material-ui/icons/Message";
import SendIcon from "@material-ui/icons/Send";

import { db } from "../firebase/firebase";
import styles from "../styles/Post.module.css";

type Props = {
  postId: string;
  avatar: string;
  image: string;
  text: string;
  timestamp: any;
  username: string;
};
type Comment = {
  id: string;
  avatar: string;
  text: string;
  timestamp: any;
  username: string;
};

export const Post: VFC<Props> = (props) => {
  const { postId, avatar, image, text, timestamp, username } = props;
  // 入力コメント
  const [comment, setComment] = useState("");
  // 表示コメント
  const [comments, setComments] = useState<Comment[]>([
    { id: "", avatar: "", text: "", timestamp: null, username: "" }, // 初期値
  ]);
  const [openComments, setOpenComments] = useState(false);
  const user = useAppSelector(selectUser);
  const classes = useStyles();

  // コメントをfirebaseに追加
  const onSubmitComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // onSubmit
    // コメント情報 どのpostかidを指定 collectionを追加
    addDoc(collection(db, "posts", postId, "comments"), {
      avatar: user.photoUrl, // 今ログインしているユーザー情報
      text: comment,
      timestamp: serverTimestamp(),
      username: user.displayName,
    });
    setComment(""); // コメント欄初期化
  };
  const onChangeComment = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComment(e.target.value);
  };
  const onClickMessageIcon = () => {
    setOpenComments(!openComments);
  };

  useEffect(() => {
    const qry = query(
      collection(db, "posts", postId, "comments"),
      orderBy("timestamp", "desc") // タイムスタンプ新しい順
    );
    const unSub = onSnapshot(qry, (snapshot) => {
      setComments(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          avatar: doc.data().avatar,
          text: doc.data().text,
          username: doc.data().username,
          timestamp: doc.data().timestamp,
        }))
      );
      return () => {
        unSub();
      };
    });
  }, [postId]);

  return (
    <div className={styles.post}>
      <div className={styles.post_avatar}>
        <Avatar src={avatar} />
      </div>
      <div className={styles.post_body}>
        <div>
          <div className={styles.post_header}>
            <h3>
              <span className={styles.post_headerUser}>@{username}</span>
              <span className={styles.post_headerTime}>
                {new Date(timestamp?.toDate()).toLocaleString()}
              </span>
            </h3>
          </div>
          <div className={styles.post_tweet}>
            <p>{text}</p>
          </div>
        </div>
        {image && (
          <div className={styles.post_tweetImage}>
            <img src={image} alt="tweet" />
          </div>
        )}
        <MessageIcon className={styles.post_commentIcon} onClick={onClickMessageIcon} />
        {openComments && (
          <>
            {comments.map((com) => (
              <div className={styles.post_comment} key={com.id}>
                <Avatar className={classes.small} src={com.avatar} />
                <span className={styles.post_commentUser}>@{com.username}</span>
                <span className={styles.post_commentText}>{com.text}</span>
                <span className={styles.post_headerTime}>
                  {new Date(com.timestamp?.toDate()).toLocaleString()}
                </span>
              </div>
            ))}
            <form onSubmit={onSubmitComment}>
              <div className={styles.post_form}>
                <input
                  className={styles.post_input}
                  type="text"
                  placeholder="Type new comment..."
                  value={comment}
                  onChange={onChangeComment}
                />
                <button
                  disabled={!comment}
                  className={comment ? styles.post_button : styles.post_buttonDisable}
                  type="submit"
                >
                  <SendIcon className={styles.post_sendIcon} />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginRight: theme.spacing(1),
  },
}));
