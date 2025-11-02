import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { mockAnimals, mockUsers, translations } from './mockData';
import { Bell, Menu, Users, Dog, AlertTriangle, Plus, UserPlus, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';

export function AdminDashboard() {
  const { currentUser, language, setCurrentScreen } = useContext(AppContext);
  const t = translations[language];
  const [animals, setAnimals] = useState(mockAnimals);
  const [isAnimalDialogOpen, setIsAnimalDialogOpen] = useState(false);
  
  // Form state for new animal
  const [newAnimalName, setNewAnimalName] = useState('');
  const [newAnimalSpecies, setNewAnimalSpecies] = useState('');
  const [newAnimalAge, setNewAnimalAge] = useState('');
  const [newAnimalEnclosure, setNewAnimalEnclosure] = useState('');

  const alerts = [
    { id: 1, type: 'sos', animal: 'Simba', message: 'Emergency alert', time: '5 mins ago' },
    { id: 2, type: 'health', animal: 'Raja', message: 'Health check due', time: '2 hours ago' },
  ];

  const stats = [
    {
      label: language === 'en' ? 'Total Animals' : 'कुल जानवर',
      value: animals.length,
      icon: Dog,
      color: 'from-green-500 to-green-600',
    },
    {
      label: language === 'en' ? 'Total Users' : 'कुल उपयोगकर्ता',
      value: mockUsers.length,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: language === 'en' ? 'Active Alerts' : 'सक्रिय अलर्ट',
      value: alerts.length,
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600',
    },
  ];

  const handleCreateAnimal = () => {
    if (!newAnimalName.trim()) {
      toast.error(language === 'en' ? 'Please enter animal name' : 'कृपया जानवर का नाम दर्ज करें');
      return;
    }
    if (!newAnimalSpecies) {
      toast.error(language === 'en' ? 'Please select species' : 'कृपया प्रजाति चुनें');
      return;
    }
    if (!newAnimalAge.trim()) {
      toast.error(language === 'en' ? 'Please enter age' : 'कृपया उम्र दर्ज करें');
      return;
    }
    if (!newAnimalEnclosure.trim()) {
      toast.error(language === 'en' ? 'Please enter enclosure' : 'कृपया बाड़ा दर्ज करें');
      return;
    }

    const newAnimal = {
      id: animals.length + 1,
      name: newAnimalName,
      species: newAnimalSpecies,
      age: newAnimalAge,
      enclosure: newAnimalEnclosure,
      image: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400',
      health: 'good' as const,
      lastFed: '2 hours ago',
    };

    setAnimals([...animals, newAnimal]);
    toast.success(language === 'en' ? 'Animal added successfully!' : 'जानवर सफलतापूर्वक जोड़ा गया!');
    
    // Reset form
    setNewAnimalName('');
    setNewAnimalSpecies('');
    setNewAnimalAge('');
    setNewAnimalEnclosure('');
    setIsAnimalDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6 pb-8 rounded-b-3xl shadow-lg">
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
              <div className="text-sm opacity-90">Admin Panel</div>
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
          {language === 'en' ? 'Dashboard Overview' : 'डैशबोर्ड अवलोकन'}
        </h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`bg-gradient-to-r ${stat.color} text-white p-5`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm opacity-90 mb-1">{stat.label}</div>
                      <div className="text-3xl">{stat.value}</div>
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                      <Icon className="w-8 h-8" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="p-6 bg-white">
          <h3 className="text-amber-900 mb-4">
            {language === 'en' ? 'Quick Actions' : 'त्वरित कार्य'}
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => setCurrentScreen('user-management')}
              className="h-24 flex flex-col gap-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              <UserPlus className="w-8 h-8" />
              <span className="text-sm">{t.manageUsers}</span>
            </Button>
            
            <Dialog open={isAnimalDialogOpen} onOpenChange={setIsAnimalDialogOpen}>
              <DialogTrigger asChild>
                <Button className="h-24 flex flex-col gap-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                  <Plus className="w-8 h-8" />
                  <span className="text-sm">{t.addAnimal}</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {language === 'en' ? 'Add New Animal' : 'नया जानवर जोड़ें'}
                  </DialogTitle>
                  <DialogDescription>
                    {language === 'en' ? 'Enter the details of the new animal to add to the zoo.' : 'चिड़ियाघर में जोड़ने के लिए नए जानवर का विवरण दर्ज करें।'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>{language === 'en' ? 'Animal Name' : 'जानवर का नाम'}</Label>
                    <Input 
                      placeholder={language === 'en' ? 'Enter animal name' : 'जानवर का नाम दर्ज करें'} 
                      value={newAnimalName}
                      onChange={(e) => setNewAnimalName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>{language === 'en' ? 'Species' : 'प्रजाति'}</Label>
                    <Select value={newAnimalSpecies} onValueChange={setNewAnimalSpecies}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'en' ? 'Select species' : 'प्रजाति चुनें'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lion">{language === 'en' ? 'Lion' : 'शेर'}</SelectItem>
                        <SelectItem value="Tiger">{language === 'en' ? 'Tiger' : 'बाघ'}</SelectItem>
                        <SelectItem value="Elephant">{language === 'en' ? 'Elephant' : 'हाथी'}</SelectItem>
                        <SelectItem value="Giraffe">{language === 'en' ? 'Giraffe' : 'जिराफ़'}</SelectItem>
                        <SelectItem value="Zebra">{language === 'en' ? 'Zebra' : 'ज़ेब्रा'}</SelectItem>
                        <SelectItem value="Monkey">{language === 'en' ? 'Monkey' : 'बंदर'}</SelectItem>
                        <SelectItem value="Bear">{language === 'en' ? 'Bear' : 'भालू'}</SelectItem>
                        <SelectItem value="Deer">{language === 'en' ? 'Deer' : 'हिरण'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{language === 'en' ? 'Age' : 'उम्र'}</Label>
                    <Input 
                      placeholder={language === 'en' ? 'e.g., 5 years' : 'जैसे, 5 साल'} 
                      value={newAnimalAge}
                      onChange={(e) => setNewAnimalAge(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>{language === 'en' ? 'Enclosure' : 'बाड़ा'}</Label>
                    <Input 
                      placeholder={language === 'en' ? 'e.g., A-12' : 'जैसे, A-12'} 
                      value={newAnimalEnclosure}
                      onChange={(e) => setNewAnimalEnclosure(e.target.value)}
                    />
                  </div>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleCreateAnimal}
                  >
                    {language === 'en' ? 'Add Animal' : 'जानवर जोड़ें'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </Card>

        {/* Active Alerts */}
        <Card className="p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-amber-900">{t.alerts}</h3>
            <Badge className="bg-red-500 text-white">{alerts.length} {language === 'en' ? 'New' : 'नया'}</Badge>
          </div>

          <div className="space-y-3">
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded"
              >
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-red-900">{alert.animal}</span>
                    <span className="text-xs text-red-600">{alert.time}</span>
                  </div>
                  <p className="text-sm text-red-700">{alert.message}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <Button
            variant="outline"
            className="w-full mt-4 border-amber-600 text-amber-600 hover:bg-amber-50"
          >
            {language === 'en' ? 'View All Alerts' : 'सभी अलर्ट देखें'}
          </Button>
        </Card>

        {/* Recent Users */}
        <Card className="p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-amber-900">
              {language === 'en' ? 'Team Members' : 'टीम के सदस्य'}
            </h3>
          </div>

          <div className="space-y-3">
            {mockUsers.slice(0, 4).map((user, index) => {
              const roleColors = {
                zookeeper: 'bg-green-100 text-green-800',
                admin: 'bg-amber-100 text-amber-800',
                vet: 'bg-blue-100 text-blue-800',
                officer: 'bg-purple-100 text-purple-800',
              };

              const roleLabels = {
                zookeeper: t.zookeeper,
                admin: t.admin,
                vet: t.vet,
                officer: t.officer,
              };

              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">
                        {user.permissions.length} {language === 'en' ? 'permissions' : 'अनुमतियाँ'}
                      </div>
                    </div>
                  </div>
                  <Badge className={roleColors[user.role]}>
                    {roleLabels[user.role]}
                  </Badge>
                </motion.div>
              );
            })}
          </div>

          <Button
            onClick={() => setCurrentScreen('user-management')}
            variant="outline"
            className="w-full mt-4 border-amber-600 text-amber-600 hover:bg-amber-50"
          >
            {language === 'en' ? 'Manage All Users' : 'सभी उपयोगकर्ता प्रबंधित करें'}
          </Button>
        </Card>
      </div>
    </div>
  );
}
