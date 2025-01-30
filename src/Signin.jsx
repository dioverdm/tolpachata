import React, { useState } from "react";
import GoogleIcon from "@mui/icons-material/Google";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { auth, db } from "./firebase";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import Logo from "./Logo";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisibile] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordVisibile(!passwordVisible);
  };

  const handleSignin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("¡Por favor rellene todos los campos!");
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      navigate("/");
    } catch (error) {
      setLoading(false);
      console.log(error);

      switch (error.code) {
        case "auth/user-not-found":
          alert(
            "La dirección de correo electrónico no está asociada a ninguna cuenta. Regístrese primero."
          );
          break;
        case "auth/invalid-email":
          alert("La dirección de correo electrónico no es válida.");
          break;
        case "auth/wrong-password":
          alert("¡Contraseña incorrecta!");
          break;
        default:
          alert("Algo salió mal, por favor inténtalo de nuevo más tarde.");
          break;
      }
    }
  };

  const handleGoogleSignin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        });
      }

      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen flex justify-center items-center flex-col">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="w-[400px] bg-white text-slate-700 shadow rounded-lg p-8">
        <h4 className="text-2xl font-semibold text-center mb-5">Iniciar sesión</h4>
        <form>
          <input
            type="email"
            className="w-full border border-slate-300 shadow rounded py-2 px-4 mb-3"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="flex border border-slate-300 shadow rounded py-2 px-4 mb-3">
            <input
              type={passwordVisible ? "text" : "password"}
              className="w-full"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="text-slate-400"
              onClick={togglePasswordVisibility}
            >
              {passwordVisible ? (
                <VisibilityOutlinedIcon />
              ) : (
                <VisibilityOffOutlinedIcon />
              )}
            </button>
          </div>
          <button
            type="submit"
            onClick={handleSignin}
            className="w-full bg-emerald-500 text-white px-4 py-2 rounded shadow font-semibold"
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>
        <p className="mt-3 text-center">
          ¿No tienes una cuenta?{" "}
          <Link to="/signup" className="text-emerald-500">
            Registrate
          </Link>
        </p>
        <div className="flex items-center gap-3 my-5">
          <hr className="w-full border-slate-300" />
          <p>O</p>
          <hr className="w-full border-slate-300" />
        </div>
        <button
          className="flex bg-sky-500 text-white w-full justify-between py-2 px-4 rounded shadow font-semibold"
          onClick={handleGoogleSignin}
        >
          <GoogleIcon />
          <span>Continuar con Google</span>
          <span></span>
        </button>
      </div>
    </div>
  );
};

export default Signin;
