import { useNavigate } from "react-router-dom";
import SnookerRegistration from "@/components/SnookerRegistration";

const SnookerRegister = () => {
  const navigate = useNavigate();

  return (
    <SnookerRegistration onBack={() => navigate("/snooker")} />
  );
};

export default SnookerRegister;
