import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoginScreen } from './components/LoginScreen';
import { ZookeeperDashboard } from './components/ZookeeperDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { VetDashboard } from './components/VetDashboard';
import { OfficerDashboard } from './components/OfficerDashboard';
import { DailyLogEntry } from './components/DailyLogEntry';
import { AnimalProfile } from './components/AnimalProfile';
import { UserManagement } from './components/UserManagement';
import { SettingsScreen } from './components/SettingsScreen';
import { SOSModal } from './components/SOSModal';
import { LogHistory } from './components/LogHistory';
import { Toaster } from './components/ui/sonner';
import { AnimatePresence } from 'motion/react';

export type UserRole = 'zookeeper' | 'admin' | 'vet' | 'officer';
export type Language = 'en' | 'hi';

export interface Animal {
  id: string;
  name: string;
  species: string;
  number?: number;
  image: string;
  health: 'excellent' | 'good' | 'fair' | 'poor';
  lastChecked: string;
  assignedTo?: string;
  mood?: string;
  appetite?: string;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  permissions: string[];
  password?: string;
}

export interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  currentScreen: string;
  setCurrentScreen: (screen: string) => void;
  selectedAnimal: Animal | null;
  setSelectedAnimal: (animal: Animal | null) => void;
  showSOS: boolean;
  setShowSOS: (show: boolean) => void;
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
}

export const AppContext = React.createContext<AppContextType>({
  currentUser: null,
  setCurrentUser: () => {},
  language: 'en',
  setLanguage: () => {},
  currentScreen: 'login',
  setCurrentScreen: () => {},
  selectedAnimal: null,
  setSelectedAnimal: () => {},
  showSOS: false,
  setShowSOS: () => {},
  darkMode: false,
  setDarkMode: () => {},
});

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [currentScreen, setCurrentScreen] = useState('login');
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [showSOS, setShowSOS] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const renderScreen = () => {
    if (!currentUser) {
      return <LoginScreen />;
    }

    switch (currentScreen) {
      case 'daily-log':
        return <DailyLogEntry />;
      case 'animal-profile':
        return <AnimalProfile />;
      case 'user-management':
        return <UserManagement />;
      case 'settings':
        return <SettingsScreen />;
      case 'logHistory':
        return <LogHistory />;
      default:
        switch (currentUser.role) {
          case 'zookeeper':
            return <ZookeeperDashboard />;
          case 'admin':
            return <AdminDashboard />;
          case 'vet':
            return <VetDashboard />;
          case 'officer':
            return <OfficerDashboard />;
          default:
            return <ZookeeperDashboard />;
        }
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        language,
        setLanguage,
        currentScreen,
        setCurrentScreen,
        selectedAnimal,
        setSelectedAnimal,
        showSOS,
        setShowSOS,
        darkMode,
        setDarkMode,
      }}
    >
      <div className={darkMode ? 'dark' : ''}>
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
          <AnimatePresence mode="wait">
            {showLanding ? (
              <LandingPage onComplete={() => setShowLanding(false)} />
            ) : (
              <>
                {renderScreen()}
                {showSOS && <SOSModal />}
              </>
            )}
          </AnimatePresence>
          <Toaster />
        </div>
      </div>
    </AppContext.Provider>
  );
}
