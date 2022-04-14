// 削除ボタン作成!!!!!!
import { VFC, useState, useEffect } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";

import { db } from "../firebase/firebase";
import { TextInput } from "./TextInput";
import { Post } from "./Post";
import styles from "../styles/Feed.module.css";

export const Feed: VFC = () => {
  // 型: オブジェクトの配列
  const [posts, setPosts] = useState([
    {
      id: "",
      avatar: "",
      image: "",
      text: "",
      timestamp: null,
      username: "",
    },
  ]);

  useEffect(() => {
    // orderBy => timestampで並び替え
    const qry = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    // onSnapshot => firebaseリアルタイムアップデート
    const unSub = onSnapshot(qry, (snapshot) => {
      setPosts(
        // .doc => ドキュメントの中身
        snapshot.docs.map((doc) => ({
          id: doc.id,
          avatar: doc.data().avatar,
          image: doc.data().image,
          text: doc.data().text,
          timestamp: doc.data().timestamp,
          username: doc.data().username,
        }))
      );
    });
    // アンマウント時に登録解除
    return () => {
      unSub();
    };
  }, []); // 最初に1回実行

  return (
    <div className={styles.feed}>
      <TextInput />

      {posts[0]?.id && ( // postsが存在するときのみ
        <>
          {posts.map((post) => (
            <Post
              key={post.id}
              postId={post.id}
              avatar={post.avatar}
              image={post.image}
              text={post.text}
              timestamp={post.timestamp}
              username={post.username}
            />
          ))}
        </>
      )}
    </div>
  );
};
