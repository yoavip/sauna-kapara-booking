import React from "react";
import ReactDOM from "react-dom/client";

const App = () => {
  return (
    <div style={{ fontFamily: "sans-serif", textAlign: "center", marginTop: "50px" }}>
      <h1>Hello from Sauna Kapara Booking!</h1>
      <p>If you can see this text, the deployment works 🎉</p>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
