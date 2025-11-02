import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import { translations } from './mockData';
import { api } from '../services/api';
import { Bell, Menu, Users, Dog, AlertTriangle, Plus, UserPlus, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';

export function AdminDashboard() {
  const { currentUser, language, setCurrentScreen } = useContext(AppContext);
  const t = translations[language];
  const [animals, setAnimals] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isAnimalDialogOpen, setIsAnimalDialogOpen] = useState(false);
  const [isAlertsDialogOpen, setIsAlertsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state for new animal
  const [newAnimalName, setNewAnimalName] = useState('');
  const [newAnimalSpecies, setNewAnimalSpecies] = useState('');
  const [newAnimalAge, setNewAnimalAge] = useState('');
  const [newAnimalEnclosure, setNewAnimalEnclosure] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [animalsData, usersData, observationsData] = await Promise.all([
        api.getAnimals().catch((err) => {
          console.error('Failed to load animals:', err);
          if (err.message?.includes('401') || err.message?.includes('403')) {
            toast.error(language === 'en' ? 'Please login to view data' : 'डेटा देखने के लिए कृपया लॉगिन करें');
            setTimeout(() => setCurrentScreen('login'), 2000);
          }
          return [];
        }),
        api.getUsers().catch((err) => {
          console.error('Failed to load users:', err);
          if (err.message?.includes('401') || err.message?.includes('403')) {
            toast.error(language === 'en' ? 'Please login to view data' : 'डेटा देखने के लिए कृपया लॉगिन करें');
            setTimeout(() => setCurrentScreen('login'), 2000);
          }
          return [];
        }),
        api.getObservations().catch((err) => {
          console.error('Failed to load observations:', err);
          if (err.message?.includes('401') || err.message?.includes('403')) {
            toast.error(language === 'en' ? 'Please login to view data' : 'डेटा देखने के लिए कृपया लॉगिन करें');
            setTimeout(() => setCurrentScreen('login'), 2000);
          }
          return [];
        })
      ]);
      
      setAnimals(animalsData);
      setUsers(usersData);
      
      const emergencyAlerts = observationsData.filter((obs: any) => obs.is_emergency);
      setAlerts(emergencyAlerts);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error(language === 'en' ? 'Failed to load dashboard data' : 'डैशबोर्ड डेटा लोड करने में विफल');
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      label: language === 'en' ? 'Total Animals' : 'कुल जानवर',
      value: animals.length,
      icon: Dog,
      color: 'from-green-500 to-green-600',
    },
    {
      label: language === 'en' ? 'Total Users' : 'कुल उपयोगकर्ता',
      value: users.length,
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

  const handleCreateAnimal = async () => {
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

    try {
      const newAnimal = await api.createAnimal({
        name: newAnimalName,
        species: newAnimalSpecies,
        age: newAnimalAge,
        enclosure: newAnimalEnclosure
      });

      if (newAnimal && newAnimal.id) {
        toast.success(language === 'en' ? 'Animal added successfully!' : 'जानवर सफलतापूर्वक जोड़ा गया!');
        
        // Reload animals list from server
        const updatedAnimals = await api.getAnimals().catch(() => [...animals, newAnimal]);
        setAnimals(updatedAnimals);
        
        // Reset form
        setNewAnimalName('');
        setNewAnimalSpecies('');
        setNewAnimalAge('');
        setNewAnimalEnclosure('');
        setIsAnimalDialogOpen(false);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Error creating animal:', error);
      const errorMessage = error.message?.includes('401') || error.message?.includes('403')
        ? (language === 'en' ? 'Not authorized to add animals' : 'जानवर जोड़ने के लिए अधिकृत नहीं')
        : (language === 'en' ? 'Failed to add animal' : 'जानवर जोड़ने में विफल');
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-900">{language === 'en' ? 'Loading dashboard...' : 'डैशबोर्ड लोड हो रहा है...'}</p>
        </div>
      </div>
    );
  }

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
              onClick={() => setIsAlertsDialogOpen(true)}
              className="text-white hover:bg-white/20 relative"
            >
              <Bell className="w-5 h-5" />
              {alerts.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
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
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {language === 'en' ? 'No active alerts' : 'कोई सक्रिय अलर्ट नहीं'}
              </div>
            ) : (
              alerts.slice(0, 2).map((alert, index) => {
                const alertDate = alert.created_at ? new Date(alert.created_at) : null;
                const dateStr = alertDate && !isNaN(alertDate.getTime())
                  ? alertDate.toLocaleDateString()
                  : (language === 'en' ? 'Recent' : 'हाल का');
                
                return (
                  <motion.div
                    key={alert.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded"
                  >
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-red-900">
                          {language === 'en' ? 'Emergency Alert' : 'आपातकालीन अलर्ट'}
                        </span>
                        <span className="text-xs text-red-600">{dateStr}</span>
                      </div>
                      <p className="text-sm text-red-700">{alert.date_or_day || (language === 'en' ? 'Emergency reported' : 'आपातकाल रिपोर्ट किया गया')}</p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          <Dialog open={isAlertsDialogOpen} onOpenChange={setIsAlertsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full mt-4 border-amber-600 text-amber-600 hover:bg-amber-50"
              >
                {language === 'en' ? 'View All Alerts' : 'सभी अलर्ट देखें'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {language === 'en' ? 'All Emergency Alerts' : 'सभी आपातकालीन अलर्ट'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-4">
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {language === 'en' ? 'No emergency alerts found' : 'कोई आपातकालीन अलर्ट नहीं मिला'}
                  </div>
                ) : (
                  alerts.map((alert, index) => {
                    const alertDate = alert.created_at ? new Date(alert.created_at) : null;
                    const dateStr = alertDate && !isNaN(alertDate.getTime())
                      ? alertDate.toLocaleDateString()
                      : (language === 'en' ? 'Recent' : 'हाल का');
                    
                    return (
                      <div
                        key={alert.id || index}
                        className="flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded"
                      >
                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-red-900 font-medium">
                              {language === 'en' ? 'Emergency Alert' : 'आपातकालीन अलर्ट'}
                            </span>
                            <span className="text-xs text-red-600">{dateStr}</span>
                          </div>
                          <p className="text-sm text-red-700">{alert.date_or_day || (language === 'en' ? 'Emergency reported' : 'आपातकाल रिपोर्ट किया गया')}</p>
                          <p className="text-xs text-red-600 mt-1">
                            {alert.normal_behaviour_details || (language === 'en' ? 'No additional details' : 'कोई अतिरिक्त विवरण नहीं')}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </DialogContent>
          </Dialog>
        </Card>

        {/* Recent Users */}
        <Card className="p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-amber-900">
              {language === 'en' ? 'Team Members' : 'टीम के सदस्य'}
            </h3>
          </div>

          <div className="space-y-3">
            {users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {language === 'en' ? 'No users found' : 'कोई उपयोगकर्ता नहीं मिला'}
              </div>
            ) : (
              users.slice(0, 4).map((user, index) => {
                const roleColors: Record<string, string> = {
                  zookeeper: 'bg-green-100 text-green-800',
                  admin: 'bg-amber-100 text-amber-800',
                  vet: 'bg-blue-100 text-blue-800',
                  officer: 'bg-purple-100 text-purple-800',
                };

                const roleLabels: Record<string, string> = {
                  zookeeper: t.zookeeper,
                  admin: t.admin,
                  vet: t.vet,
                  officer: t.officer,
                };

                return (
                  <motion.div
                    key={user.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-sm">
                        {user.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="text-gray-900">{user.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    <Badge className={roleColors[user.role] || 'bg-gray-100 text-gray-800'}>
                      {roleLabels[user.role] || user.role}
                    </Badge>
                  </motion.div>
                );
              })
            )}
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
