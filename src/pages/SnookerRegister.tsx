import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SnookerRegistration from "@/components/SnookerRegistration";

const SnookerRegister = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "הרשמה | ביליארד בית קשת 🎱";
  }, []);

  return (
    <SnookerRegistration onBack={() => navigate("/snooker")} />
  );
};

export default SnookerRegister;
