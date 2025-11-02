import React, { useContext } from 'react';
import { AppContext } from '../App';
import { mockAnimals, translations } from './mockData';
import { Bell, Menu, Stethoscope, FileText, Pill, Activity, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function VetDashboard() {
  const { currentUser, language, setCurrentScreen, setSelectedAnimal } = useContext(AppContext);
  const t = translations[language];

  const healthReports = mockAnimals.filter(
    (animal) => animal.health === 'fair' || animal.health === 'poor'
  );

  const recentLogs = [
    {
      animal: mockAnimals[0],
      date: 'Today, 2:30 PM',
      note: 'Voice log: Animal showing good appetite and normal behavior',
      type: 'voice',
    },
    {
      animal: mockAnimals[2],
      date: 'Today, 11:00 AM',
      note: 'Reduced appetite observed. Monitor closely.',
      type: 'health',
    },
    {
      animal: mockAnimals[1],
      date: 'Yesterday, 4:15 PM',
      note: 'Regular checkup completed. All vitals normal.',
      type: 'checkup',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-cyan-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 pb-8 rounded-b-3xl shadow-lg">
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
                {language === 'en' ? 'Vet Doctor' : 'पशु चिकित्सक'}
              </div>
              <div>{currentUser?.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentScreen('settings')}
              className="text-white hover:bg-white/20"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <h1 className="text-white">
          {language === 'en' ? 'Health Dashboard' : 'स्वास्थ्य डैशबोर्ड'}
        </h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 bg-gradient-to-br from-red-500 to-red-600 text-white">
            <div className="flex items-center justify-between mb-2">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div className="text-2xl">{healthReports.length}</div>
            <div className="text-sm opacity-90">
              {language === 'en' ? 'Need Attention' : 'ध्यान चाहिए'}
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-6 h-6" />
            </div>
            <div className="text-2xl">{mockAnimals.length - healthReports.length}</div>
            <div className="text-sm opacity-90">
              {language === 'en' ? 'Healthy' : 'स्वस्थ'}
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reports">
              {t.healthReports}
            </TabsTrigger>
            <TabsTrigger value="logs">
              {t.voiceLogs}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-3 mt-4">
            {healthReports.length > 0 ? (
              healthReports.map((animal, index) => (
                <motion.div
                  key={animal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className="p-4 bg-white cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => {
                      setSelectedAnimal(animal);
                      setCurrentScreen('animal-profile');
                    }}
                  >
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={animal.image}
                          alt={animal.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-blue-900">{animal.name}</h3>
                            <p className="text-sm text-gray-600">
                              {animal.species} #{animal.number}
                            </p>
                          </div>
                          <Badge
                            className={
                              animal.health === 'poor'
                                ? 'bg-red-500 text-white'
                                : 'bg-yellow-500 text-white'
                            }
                          >
                            {animal.health === 'poor' ? t.poor : t.fair}
                          </Badge>
                        </div>
                        {animal.notes && (
                          <p className="text-sm text-gray-700 mb-2">{animal.notes}</p>
                        )}
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-8">
                            <Pill className="w-4 h-4 mr-1" />
                            {language === 'en' ? 'Prescribe' : 'नुस्खा'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-600 text-blue-600 hover:bg-blue-50 h-8"
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            {language === 'en' ? 'Add Note' : 'नोट जोड़ें'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : (
              <Card className="p-8 text-center bg-white">
                <Stethoscope className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-600">
                  {language === 'en'
                    ? 'All animals are healthy!'
                    : 'सभी जानवर स्वस्थ हैं!'}
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="logs" className="space-y-3 mt-4">
            {recentLogs.map((log, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4 bg-white">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <ImageWithFallback
                        src={log.animal.image}
                        alt={log.animal.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-blue-900 text-sm">{log.animal.name}</h3>
                          <p className="text-xs text-gray-500">{log.date}</p>
                        </div>
                        <Badge
                          className={
                            log.type === 'voice'
                              ? 'bg-purple-100 text-purple-800'
                              : log.type === 'health'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-blue-100 text-blue-800'
                          }
                        >
                          {log.type === 'voice'
                            ? language === 'en'
                              ? 'Voice'
                              : 'वॉइस'
                            : log.type === 'health'
                            ? language === 'en'
                              ? 'Health'
                              : 'स्वास्थ्य'
                            : language === 'en'
                            ? 'Checkup'
                            : 'जांच'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700">{log.note}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
