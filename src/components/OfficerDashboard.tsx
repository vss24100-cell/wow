import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { mockAnimals, translations } from './mockData';
import { Bell, Menu, Apple, DollarSign, TrendingUp, Calendar, Settings, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';

export function OfficerDashboard() {
  const { currentUser, language, setCurrentScreen } = useContext(AppContext);
  const t = translations[language];

  const initialFeedingData = [
    {
      id: 1,
      animal: mockAnimals[0],
      lastFed: '2 hours ago',
      amount: '15 kg',
      cost: '₹450',
      status: 'completed',
      feedType: 'Meat',
    },
    {
      id: 2,
      animal: mockAnimals[1],
      lastFed: '4 hours ago',
      amount: '120 kg',
      cost: '₹2,400',
      status: 'completed',
      feedType: 'Vegetables',
    },
    {
      id: 3,
      animal: mockAnimals[2],
      lastFed: '6 hours ago',
      amount: '20 kg',
      cost: '₹800',
      status: 'pending',
      feedType: 'Meat',
    },
    {
      id: 4,
      animal: mockAnimals[3],
      lastFed: '1 hour ago',
      amount: '25 kg',
      cost: '₹350',
      status: 'completed',
      feedType: 'Leaves',
    },
  ];

  const [feedingData, setFeedingData] = useState(initialFeedingData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [selectedAnimalId, setSelectedAnimalId] = useState('');
  const [feedType, setFeedType] = useState('');
  const [amount, setAmount] = useState('');
  const [cost, setCost] = useState('');
  const [feedingStatus, setFeedingStatus] = useState('completed');

  const totalCost = feedingData.reduce((sum, item) => {
    const cost = parseInt(item.cost.replace('₹', '').replace(',', ''));
    return sum + cost;
  }, 0);

  const handleAddFeedingRecord = () => {
    if (!selectedAnimalId) {
      toast.error(language === 'en' ? 'Please select an animal' : 'कृपया एक जानवर चुनें');
      return;
    }
    if (!feedType) {
      toast.error(language === 'en' ? 'Please select feed type' : 'कृपया भोजन का प्रकार चुनें');
      return;
    }
    if (!amount.trim()) {
      toast.error(language === 'en' ? 'Please enter amount' : 'कृपया मात्रा दर्ज करें');
      return;
    }
    if (!cost.trim()) {
      toast.error(language === 'en' ? 'Please enter cost' : 'कृपया लागत दर्ज करें');
      return;
    }

    const selectedAnimal = mockAnimals.find(a => a.id === selectedAnimalId);
    if (!selectedAnimal) return;

    const newRecord = {
      id: feedingData.length + 1,
      animal: selectedAnimal,
      lastFed: 'Just now',
      amount: amount,
      cost: cost.startsWith('₹') ? cost : `₹${cost}`,
      status: feedingStatus as 'completed' | 'pending',
      feedType: feedType,
    };

    setFeedingData([newRecord, ...feedingData]);
    toast.success(language === 'en' ? 'Feeding record added successfully!' : 'भोजन रिकॉर्ड सफलतापूर्वक जोड़ा गया!');

    // Reset form
    setSelectedAnimalId('');
    setFeedType('');
    setAmount('');
    setCost('');
    setFeedingStatus('completed');
    setIsDialogOpen(false);
  };

  const handleMarkAsComplete = (recordId: number) => {
    setFeedingData(feedingData.map(item => 
      item.id === recordId ? { ...item, status: 'completed' as const, lastFed: 'Just now' } : item
    ));
    toast.success(language === 'en' ? 'Marked as fed!' : 'खिलाया हुआ चिह्नित किया!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 pb-8 rounded-b-3xl shadow-lg">
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
                {language === 'en' ? 'Forest Officer' : 'वन अधिकारी'}
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
          {language === 'en' ? 'Feeding & Costs' : 'भोजन और लागत'}
        </h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Add Feeding Record Button */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full h-14 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              {language === 'en' ? 'Add Feeding Record' : 'भोजन रिकॉर्ड जोड़ें'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {language === 'en' ? 'Add Feeding Record' : 'भोजन रिकॉर्ड जोड़ें'}
              </DialogTitle>
              <DialogDescription>
                {language === 'en' ? 'Record feeding details including animal, feed type, amount, and cost.' : 'जानवर, भोजन का प्रकार, मात्रा और लागत सहित भोजन विवरण रिकॉर्ड करें।'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>{language === 'en' ? 'Select Animal' : 'जानवर चुनें'}</Label>
                <Select value={selectedAnimalId} onValueChange={setSelectedAnimalId}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'en' ? 'Choose animal' : 'जानवर चुनें'} />
                  </SelectTrigger>
                  <SelectContent>
                    {mockAnimals.map((animal) => (
                      <SelectItem key={animal.id} value={animal.id}>
                        {animal.name} - {animal.species}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{language === 'en' ? 'Feed Type' : 'भोजन का प्रकार'}</Label>
                <Select value={feedType} onValueChange={setFeedType}>
                  <SelectTrigger>
                    <SelectValue placeholder={language === 'en' ? 'Select feed type' : 'भोजन का प्रकार चुनें'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Meat">{language === 'en' ? 'Meat' : 'मांस'}</SelectItem>
                    <SelectItem value="Vegetables">{language === 'en' ? 'Vegetables' : 'सब्जियाँ'}</SelectItem>
                    <SelectItem value="Fruits">{language === 'en' ? 'Fruits' : 'फल'}</SelectItem>
                    <SelectItem value="Leaves">{language === 'en' ? 'Leaves' : 'पत्तियाँ'}</SelectItem>
                    <SelectItem value="Grains">{language === 'en' ? 'Grains' : 'अनाज'}</SelectItem>
                    <SelectItem value="Fish">{language === 'en' ? 'Fish' : 'मछली'}</SelectItem>
                    <SelectItem value="Special Diet">{language === 'en' ? 'Special Diet' : 'विशेष आहार'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{language === 'en' ? 'Amount' : 'मात्रा'}</Label>
                <Input 
                  placeholder={language === 'en' ? 'e.g., 15 kg' : 'जैसे, 15 किलो'}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div>
                <Label>{language === 'en' ? 'Cost (₹)' : 'लागत (₹)'}</Label>
                <Input 
                  type="number"
                  placeholder={language === 'en' ? 'Enter cost in rupees' : 'रुपये में लागत दर्ज करें'}
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                />
              </div>

              <div>
                <Label>{language === 'en' ? 'Status' : 'स्थिति'}</Label>
                <Select value={feedingStatus} onValueChange={setFeedingStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">
                      {language === 'en' ? 'Completed' : 'पूर्ण'}
                    </SelectItem>
                    <SelectItem value="pending">
                      {language === 'en' ? 'Pending' : 'लंबित'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={handleAddFeedingRecord}
              >
                {language === 'en' ? 'Add Record' : 'रिकॉर्ड जोड़ें'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Cost Summary */}
        <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm opacity-90 mb-1">
                {language === 'en' ? "Today's Total Cost" : 'आज की कुल लागत'}
              </div>
              <div className="text-3xl">₹{totalCost.toLocaleString()}</div>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <DollarSign className="w-8 h-8" />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-3 border-t border-white/20">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">
              {language === 'en' ? '12% less than yesterday' : 'कल से 12% कम'}
            </span>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Apple className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">
                  {language === 'en' ? 'Fed Today' : 'आज खिलाया'}
                </div>
                <div className="text-purple-900">{feedingData.filter(f => f.status === 'completed').length}</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">
                  {language === 'en' ? 'Pending' : 'लंबित'}
                </div>
                <div className="text-purple-900">{feedingData.filter(f => f.status === 'pending').length}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Feeding Data */}
        <Card className="p-6 bg-white">
          <h3 className="text-purple-900 mb-4">
            {language === 'en' ? 'Feeding Records' : 'भोजन रिकॉर्ड'}
          </h3>

          <div className="space-y-3">
            {feedingData.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border-2 ${
                  item.status === 'completed'
                    ? 'border-green-200 bg-green-50'
                    : 'border-orange-200 bg-orange-50'
                }`}
              >
                <div className="flex gap-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={item.animal.image}
                      alt={item.animal.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-purple-900">{item.animal.name}</h4>
                        <p className="text-sm text-gray-600">{item.animal.species}</p>
                        <p className="text-xs text-purple-600 mt-1">{item.feedType}</p>
                      </div>
                      <Badge
                        className={
                          item.status === 'completed'
                            ? 'bg-green-500 text-white'
                            : 'bg-orange-500 text-white'
                        }
                      >
                        {item.status === 'completed'
                          ? language === 'en'
                            ? 'Fed'
                            : 'खिलाया'
                          : language === 'en'
                          ? 'Pending'
                          : 'लंबित'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                      <div>
                        <div className="text-gray-500 text-xs">
                          {language === 'en' ? 'Amount' : 'मात्रा'}
                        </div>
                        <div className="text-gray-900">{item.amount}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">
                          {language === 'en' ? 'Cost' : 'लागत'}
                        </div>
                        <div className="text-gray-900">{item.cost}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">
                          {language === 'en' ? 'Last Fed' : 'आखिरी बार'}
                        </div>
                        <div className="text-gray-900 text-xs">{item.lastFed}</div>
                      </div>
                    </div>
                    {item.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkAsComplete(item.id)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        {language === 'en' ? 'Mark as Fed' : 'खिलाया हुआ चिह्नित करें'}
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Monthly Summary */}
        <Card className="p-6 bg-white">
          <h3 className="text-purple-900 mb-4">
            {language === 'en' ? 'Monthly Summary' : 'मासिक सारांश'}
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-purple-900">
                {language === 'en' ? 'Total Animals' : 'कुल जानवर'}
              </span>
              <span className="text-purple-900">{mockAnimals.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-purple-900">
                {language === 'en' ? 'Avg. Daily Cost' : 'औसत दैनिक लागत'}
              </span>
              <span className="text-purple-900">₹{totalCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-purple-900">
                {language === 'en' ? 'Monthly Estimate' : 'मासिक अनुमान'}
              </span>
              <span className="text-purple-900">₹{(totalCost * 30).toLocaleString()}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
