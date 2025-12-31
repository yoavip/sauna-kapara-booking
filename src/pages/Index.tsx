import { useState, useEffect } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import RegistrationScreen from "@/components/RegistrationScreen";
import ViewRegistrations from "@/components/ViewRegistrations";

type Screen = 'welcome' | 'register' | 'view';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      setCurrentScreen('welcome');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (screen: Screen) => {
    if (screen !== 'welcome') {
      window.history.pushState({ screen }, '', `#${screen}`);
    }
    setCurrentScreen(screen);
  };

  const navigateBack = () => {
    if (window.history.state?.screen) {
      window.history.back();
    }
    setCurrentScreen('welcome');
  };

  return (
    <div className="min-h-screen">
      {currentScreen === 'welcome' && (
        <WelcomeScreen 
          onRegister={() => navigateTo('register')}
          onViewRegistrations={() => navigateTo('view')}
        />
      )}
      {currentScreen === 'register' && (
        <RegistrationScreen 
          onBack={navigateBack}
        />
      )}
      {currentScreen === 'view' && (
        <ViewRegistrations 
          onBack={navigateBack}
        />
      )}
    </div>
  );
};

export default Index;
