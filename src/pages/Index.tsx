import { useState, useEffect } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import RegistrationScreen from "@/components/RegistrationScreen";
import ViewRegistrations from "@/components/ViewRegistrations";
import AdminUsersPage from "@/components/AdminUsersPage";
import SnookerRegistration from "@/components/SnookerRegistration";

type Screen = 'welcome' | 'register' | 'view' | 'admin-users' | 'snooker';

const SAUNA_HOMEPAGE_REDIRECT = "https://yoavip.github.io/sauna-kapara-booking/";

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');

  // Redirect sauna homepage to the new GitHub Pages site
  useEffect(() => {
    window.location.replace(SAUNA_HOMEPAGE_REDIRECT);
  }, []);

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
          onAdminUsers={() => navigateTo('admin-users')}
          onSnooker={() => navigateTo('snooker')}
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
      {currentScreen === 'admin-users' && (
        <AdminUsersPage 
          onBack={navigateBack}
        />
      )}
      {currentScreen === 'snooker' && (
        <SnookerRegistration 
          onBack={navigateBack}
        />
      )}
    </div>
  );
};

export default Index;
