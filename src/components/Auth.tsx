import { VFC, useState } from "react";
import { useAppDispatch } from "../app/hooks";
import { updateUserProfile } from "../features/userSlice";
// Material UI
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Paper,
  Box,
  Grid,
  Typography,
  createTheme,
  ThemeProvider,
  IconButton,
  Modal,
} from "@mui/material";
// Material UI Icons
import SendIcon from "@material-ui/icons/Send";
import CameraIcon from "@material-ui/icons/Camera";
import EmailIcon from "@material-ui/icons/Email";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
//firebase v9
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  signInWithPopup,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import { auth, provider, storage } from "../firebase/firebase";
import styles from "../styles/Auth.module.css";

const theme = createTheme();

// リセットモーダル
function getModalStyle() {
  const top = 50;
  const left = 50;
  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

export const Auth: VFC = () => {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [avatarImage, setAvatarImage] = useState<File | null>(null);
  const [isLogin, setIsLogin] = useState(true); // true: loginモード, false: registerモード
  const [openModal, setOpenModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const onClicksetLogin = () => {
    setIsLogin(!isLogin);
  };
  const onClickModal = () => {
    setOpenModal(true);
  };
  const onCloseModal = () => {
    setOpenModal(false);
  };
  const onChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  const onChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };
  const onChangeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };
  const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files![0]) {
      // !: null/undefinedではない
      setAvatarImage(e.target.files![0]);
      e.target.value = ""; // 連続ファイル選択 => onChangeを毎回反応させる
    }
  };
  const onChangeResetEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResetEmail(e.target.value);
  };

  // サインイン
  const signInEmail = async () => {
    await signInWithEmailAndPassword(auth, email, password);
  };
  const signInGoogle = async () => {
    await signInWithPopup(auth, provider).catch((err) => alert(err.message));
  };

  // メール&パスワード サインアップ
  const signUpEmail = async () => {
    const authUser = await createUserWithEmailAndPassword(auth, email, password);

    let url = ""; // 保存された画像データURL
    if (avatarImage) {
      const S = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // 文字候補
      const N = 16; // 16桁のランダムな文字列
      // 同じ名前の画像ファイルがあると1枚に統一してしまう => ランダムな名前を生成
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
        .map((n) => S[n % S.length])
        .join(""); // 結合
      const fileName = randomChar + "_" + avatarImage.name;
      await uploadBytes(ref(storage, `avatars/${fileName}`), avatarImage);
      url = await getDownloadURL(ref(storage, `avatars/${fileName}`));
    }
    if (authUser.user) {
      await updateProfile(authUser.user, {
        displayName: username,
        photoURL: url,
      });
    }
    dispatch(
      updateUserProfile({
        displayName: username,
        photoUrl: url,
      })
    );
  };

  // Login/Registerボタン
  const onClickLoginRegister = async () => {
    if (isLogin) {
      try {
        await signInEmail();
      } catch (err: any) {
        alert(err.message);
      }
    } else {
      try {
        await signUpEmail();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // リセットボタン
  const sendResetEmail = async (e: React.MouseEvent<HTMLElement>) => {
    await sendPasswordResetEmail(auth, resetEmail)
      .then(() => {
        setOpenModal(false); // モーダルを閉じる
        setResetEmail("");
      })
      .catch((err) => {
        alert(err.message);
        setResetEmail("");
      });
  };

  return (
    <ThemeProvider theme={theme}>
      <Grid container component="main" sx={{ height: "100vh" }}>
        <CssBaseline />

        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: "url(https://source.unsplash.com/random)", // random
            backgroundRepeat: "no-repeat",
            backgroundColor: (t) =>
              t.palette.mode === "light" ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>

            <Typography component="h1" variant="h5">
              {isLogin ? "Login" : "Register"}
            </Typography>

            <Box component="form" noValidate sx={{ mt: 1 }}>
              {!isLogin && (
                <>
                  <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="username"
                    label="Username"
                    name="username"
                    autoComplete="username"
                    autoFocus
                    value={username}
                    onChange={onChangeUsername}
                  />
                  <Box textAlign="center">
                    <IconButton>
                      <label>
                        <AccountCircleIcon
                          className={
                            avatarImage
                              ? styles.login_addIconLoaded
                              : styles.login_addIcon
                          }
                          fontSize="large"
                        />
                        <input
                          className={styles.login_hiddenIcon}
                          type="file"
                          onChange={onChangeImageHandler}
                        />
                      </label>
                    </IconButton>
                  </Box>
                </>
              )}

              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={onChangeEmail}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={onChangePassword}
              />

              <Button
                disabled={
                  isLogin
                    ? !email || password.length < 6
                    : !username || !email || password.length < 6 || !avatarImage
                }
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                endIcon={<EmailIcon />}
                onClick={onClickLoginRegister}
              >
                {isLogin ? "Login" : "Register"}
              </Button>

              <Grid container>
                <Grid item xs>
                  <span className={styles.login_reset} onClick={onClickModal}>
                    Forgot password?
                  </span>
                </Grid>

                <Grid item>
                  <span className={styles.login_toggleMode} onClick={onClicksetLogin}>
                    {isLogin ? "Create new account?" : "Back to login"}
                  </span>
                </Grid>
              </Grid>
              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                endIcon={<CameraIcon />}
                onClick={signInGoogle}
              >
                Sign In with Google
              </Button>
            </Box>

            <Modal open={openModal} onClose={onCloseModal}>
              <Box className={styles.modal} style={getModalStyle()}>
                <div className={styles.login_modal}>
                  <TextField
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    type="email"
                    name="email"
                    label="Reset E-mail"
                    value={resetEmail}
                    onChange={onChangeResetEmail}
                  />

                  <IconButton onClick={sendResetEmail} sx={{ mt: 1 }}>
                    <SendIcon />
                  </IconButton>
                </div>
              </Box>
            </Modal>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};
