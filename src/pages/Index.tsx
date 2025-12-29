import { useState } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import RegistrationScreen from "@/components/RegistrationScreen";
import ViewRegistrations from "@/components/ViewRegistrations";

type Screen = 'welcome' | 'register' | 'view';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');

  return (
    <div className="min-h-screen">
      {currentScreen === 'welcome' && (
        <WelcomeScreen 
          onRegister={() => setCurrentScreen('register')}
          onViewRegistrations={() => setCurrentScreen('view')}
        />
      )}
      {currentScreen === 'register' && (
        <RegistrationScreen 
          onBack={() => setCurrentScreen('welcome')}
        />
      )}
      {currentScreen === 'view' && (
        <ViewRegistrations 
          onBack={() => setCurrentScreen('welcome')}
        />
      )}
    </div>
  );
};

export default Index;
