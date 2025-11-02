import React, { useContext } from 'react';
import { AppContext } from '../App';
import { translations } from './mockData';
import { ArrowLeft, Calendar, Activity, Heart, TrendingUp, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function AnimalProfile() {
  const { language, setCurrentScreen, selectedAnimal } = useContext(AppContext);
  const t = translations[language];

  if (!selectedAnimal) return null;

  const healthColors = {
    excellent: 'bg-green-500',
    good: 'bg-blue-500',
    fair: 'bg-yellow-500',
    poor: 'bg-red-500',
  };

  const healthLabels = {
    excellent: t.excellent,
    good: t.good,
    fair: t.fair,
    poor: t.poor,
  };

  const mockHealthHistory = [
    { date: 'Nov 1, 2025', status: 'excellent', note: 'Very active and healthy' },
    { date: 'Oct 30, 2025', status: 'excellent', note: 'Normal behavior' },
    { date: 'Oct 28, 2025', status: 'good', note: 'Slight decrease in appetite' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 pb-8">
      {/* Header */}
      <div className="relative">
        {/* Animal Image */}
        <div className="h-64 overflow-hidden">
          <ImageWithFallback
            src={selectedAnimal.image}
            alt={selectedAnimal.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
        </div>

        {/* Back Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentScreen('dashboard')}
          className="absolute top-6 left-6 text-white bg-black/30 backdrop-blur-sm hover:bg-black/50"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>

        {/* Animal Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-white mb-1">{selectedAnimal.name}</h1>
              <p className="text-white/90">
                {selectedAnimal.species} #{selectedAnimal.number}
              </p>
            </div>
            <Badge className={`${healthColors[selectedAnimal.health]} text-white border-0`}>
              {healthLabels[selectedAnimal.health]}
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-6 -mt-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-4 text-center bg-white">
              <Activity className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600">
                {language === 'en' ? 'Activity' : 'गतिविधि'}
              </div>
              <div className="text-green-900">
                {selectedAnimal.mood || 'Active'}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-4 text-center bg-white">
              <Heart className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <div className="text-sm text-gray-600">
                {language === 'en' ? 'Appetite' : 'भूख'}
              </div>
              <div className="text-green-900">
                {selectedAnimal.appetite || 'Good'}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-4 text-center bg-white">
              <TrendingUp className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="text-sm text-gray-600">
                {language === 'en' ? 'Trend' : 'प्रवृत्ति'}
              </div>
              <div className="text-green-900">Stable</div>
            </Card>
          </motion.div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="history">
              {language === 'en' ? 'History' : 'इतिहास'}
            </TabsTrigger>
            <TabsTrigger value="info">
              {language === 'en' ? 'Info' : 'जानकारी'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            <Card className="p-6 bg-white">
              <h3 className="text-green-900 mb-4">
                {language === 'en' ? 'Health History' : 'स्वास्थ्य इतिहास'}
              </h3>

              <div className="space-y-4">
                {mockHealthHistory.map((record, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 ${healthColors[record.status as keyof typeof healthColors]} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <Heart className="w-5 h-5 text-white" />
                      </div>
                      {index < mockHealthHistory.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-900">{record.date}</span>
                        <Badge className={`${healthColors[record.status as keyof typeof healthColors]} text-white border-0`}>
                          {healthLabels[record.status as keyof typeof healthLabels]}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm">{record.note}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="info">
            <Card className="p-6 bg-white">
              <h3 className="text-green-900 mb-4">
                {language === 'en' ? 'Animal Information' : 'जानवर की जानकारी'}
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">
                    {language === 'en' ? 'Name' : 'नाम'}
                  </span>
                  <span className="text-gray-900">{selectedAnimal.name}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">
                    {language === 'en' ? 'Species' : 'प्रजाति'}
                  </span>
                  <span className="text-gray-900">{selectedAnimal.species}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">
                    {language === 'en' ? 'ID Number' : 'आईडी नंबर'}
                  </span>
                  <span className="text-gray-900">#{selectedAnimal.number}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">
                    {language === 'en' ? 'Assigned To' : 'सौंपा गया'}
                  </span>
                  <span className="text-gray-900">{selectedAnimal.assignedTo}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">
                    {language === 'en' ? 'Last Checked' : 'अंतिम जांच'}
                  </span>
                  <span className="text-gray-900">{selectedAnimal.lastChecked}</span>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Button */}
        <Button
          onClick={() => setCurrentScreen('daily-log')}
          className="w-full h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg mt-6"
        >
          <FileText className="w-5 h-5 mr-2" />
          {language === 'en' ? 'Add Daily Log' : 'दैनिक लॉग जोड़ें'}
        </Button>
      </div>
    </div>
  );
}
