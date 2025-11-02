import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { mockAnimals, translations } from './mockData';
import { AlertCircle, Bell, Plus, Search, Menu, AlertTriangle, Calendar, History, Mic } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { AnimalCard } from './AnimalCard';
import { TaskWidget } from './TaskWidget';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function ZookeeperDashboard() {
  const { currentUser, language, setCurrentScreen, setSelectedAnimal, setShowSOS } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');
  const t = translations[language];

  const myAnimals = mockAnimals.filter(
    (animal) => animal.assignedTo === currentUser?.name
  );

  const filteredAnimals = myAnimals.filter(
    (animal) =>
      animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.id.includes(searchQuery)
  );

  const pendingAnimals = myAnimals.filter(
    (animal) => animal.lastChecked.includes('day') || animal.lastChecked.includes('hours')
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen pb-24"
    >
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-gradient-to-r from-green-600 to-green-700 dark:from-gray-800 dark:to-gray-900 text-white p-6 pb-8 rounded-b-3xl shadow-lg sticky top-0 z-10"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <Menu className="w-6 h-6" />
            </Button>
            <div>
              <div className="text-sm opacity-90">
                {language === 'en' ? 'Welcome' : 'स्वागत है'}
              </div>
              <div>{currentUser?.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 relative"
              >
                <Bell className="w-5 h-5" />
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    delay: 0.5,
                    type: "spring",
                    stiffness: 500,
                    damping: 10
                  }}
                  className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
                >
                  <motion.span
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-red-500 rounded-full opacity-75"
                  />
                </motion.span>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder={language === 'en' ? 'Search animals by name, ID, or type...' : 'नाम, आईडी या प्रकार से खोजें...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/95 border-0 h-12 rounded-xl shadow-sm transition-all duration-300 focus:shadow-lg focus:bg-white"
          />
        </motion.div>
      </motion.div>

      <div className="p-6 space-y-6">
        {/* Today's Tasks Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <TaskWidget tasks={pendingAnimals.length} />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-4 bg-white dark:bg-gray-800 hover:shadow-xl transition-shadow duration-300">
            <motion.h3 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="text-green-900 dark:text-green-100 mb-3"
            >
              {language === 'en' ? 'Quick Actions' : 'त्वरित क्रियाएं'}
            </motion.h3>
            <div className="grid grid-cols-3 gap-3">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  onClick={() => {
                    if (myAnimals.length > 0) {
                      setSelectedAnimal(myAnimals[0]);
                      setCurrentScreen('dailyLog');
                    } else {
                      // toast.error implementation would go here
                    }
                  }}
                  variant="outline"
                  className="w-full h-20 flex flex-col gap-2 border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 hover:shadow-lg"
                >
                  <Mic className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs">{language === 'en' ? 'Audio Log' : 'ऑडियो लॉग'}</span>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  onClick={() => setCurrentScreen('logHistory')}
                  variant="outline"
                  className="w-full h-20 flex flex-col gap-2 border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-300 hover:shadow-lg"
                >
                  <History className="w-6 h-6 text-green-600 dark:text-green-400" />
                  <span className="text-xs">{language === 'en' ? 'History' : 'इतिहास'}</span>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  onClick={() => setShowSOS(true)}
                  variant="outline"
                  className="w-full h-20 flex flex-col gap-2 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 hover:shadow-lg"
                >
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
                  >
                    <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </motion.div>
                  <span className="text-xs">{language === 'en' ? 'SOS' : 'SOS'}</span>
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* My Animals Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-green-900 dark:text-green-100">
              {t.myAnimals} ({filteredAnimals.length})
            </h2>
          </div>

          <div className="space-y-3">
            {filteredAnimals.map((animal, index) => (
              <motion.div
                key={animal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <AnimalCard animal={animal} />
              </motion.div>
            ))}
          </div>

          {filteredAnimals.length === 0 && (
            <Card className="p-8 text-center bg-white/50">
              <p className="text-gray-500">
                {language === 'en' ? 'No animals found' : 'कोई जानवर नहीं मिला'}
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Floating SOS Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Button
          onClick={() => setShowSOS(true)}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-2xl"
          size="icon"
        >
          <AlertTriangle className="w-8 h-8" />
        </Button>
      </motion.div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-around p-3">
          <Button
            variant="ghost"
            className="flex-1 flex flex-col items-center gap-1 h-auto py-2 text-green-600"
            onClick={() => setCurrentScreen('dashboard')}
          >
            <div className="w-8 h-1 bg-green-600 rounded-full mb-1"></div>
            <span className="text-xs">{t.dashboard}</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-1 flex flex-col items-center gap-1 h-auto py-2 text-gray-500"
            onClick={() => setCurrentScreen('settings')}
          >
            <AlertCircle className="w-5 h-5" />
            <span className="text-xs">{t.alerts}</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
