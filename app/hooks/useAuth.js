// hooks/useAuth.js
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import db from "../lib/db";

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setIsLoggedIn(true);
      setUser(parsedUser);
    }
  }

  async function handleLogin(username, password) {
    const { data, error } = await supabase
      .from("User")
      .select("*")
      .eq("username", username)
      .single();

    if (error) {
      alert("로그인 오류: " + error.message);
      return;
    }

    if (data && data.password === password) {
      setIsLoggedIn(true);
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
    } else {
      alert("잘못된 사용자 이름 또는 비밀번호입니다.");
    }
  }

  function handleLogout() {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem("user");
  }

  return {
    isLoggedIn,
    user,
    handleLogin,
    handleLogout,
  };
}
