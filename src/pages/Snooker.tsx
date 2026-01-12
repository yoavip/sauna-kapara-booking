import { useNavigate } from "react-router-dom";
import SnookerRegistration from "@/components/SnookerRegistration";

const Snooker = () => {
  const navigate = useNavigate();

  return (
    <SnookerRegistration onBack={() => navigate("/")} />
  );
};

export default Snooker;
