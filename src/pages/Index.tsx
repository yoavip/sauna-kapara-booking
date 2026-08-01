import { useState, useEffect } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import RegistrationScreen from "@/components/RegistrationScreen";
import ViewRegistrations from "@/components/ViewRegistrations";
import AdminUsersPage from "@/components/AdminUsersPage";
import SnookerRegistration from "@/components/SnookerRegistration";

type Screen = 'welcome' | 'register' | 'view' | 'admin-users' | 'snooker';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');

  // Helper to read screen from hash
  const getScreenFromHash = (): Screen => {
    const hash = window.location.hash.replace('#', '') as Screen;
    return hash || 'welcome';
  };

  // Initialize from hash and listen for changes
  useEffect(() => {
    setCurrentScreen(getScreenFromHash());

    const handleHashChange = () => {
      setCurrentScreen(getScreenFromHash());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (screen: Screen) => {
    window.location.hash = screen;   // always use hash navigation
  };

  const navigateBack = () => {
    window.location.hash = 'welcome';
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
        <RegistrationScreen onBack={navigateBack} />
      )}
      {currentScreen === 'view' && (
        <ViewRegistrations onBack={navigateBack} />
      )}
      {currentScreen === 'admin-users' && (
        <AdminUsersPage onBack={navigateBack} />
      )}
      {currentScreen === 'snooker' && (
        <SnookerRegistration onBack={navigateBack} />
      )}
    </div>
  );
};

export default Index;
