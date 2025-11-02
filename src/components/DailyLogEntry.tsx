import { useContext, useState, useRef, useEffect } from 'react';
import { AppContext } from '../App';
import { translations } from './mockData';
import { ArrowLeft, Mic, Square, Loader2, Sparkles, Calendar as CalendarIcon, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { api } from '../services/api';

interface AIGeneratedForm {
  date_or_day: string;
  animal_observed_on_time: boolean;
  clean_drinking_water_provided: boolean;
  enclosure_cleaned_properly: boolean;
  normal_behaviour_status: boolean;
  normal_behaviour_details: string;
  feed_and_supplements_available: boolean;
  feed_given_as_prescribed: boolean;
  other_animal_requirements: string;
  incharge_signature: string;
  daily_animal_health_monitoring: string;
  carnivorous_animal_feeding_chart: string;
  medicine_stock_register: string;
  daily_wildlife_monitoring: string;
}

export function DailyLogEntry() {
  const { language, setCurrentScreen, currentUser } = useContext(AppContext);
  const t = translations[language];

  const [animals, setAnimals] = useState<any[]>([]);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [inputMode, setInputMode] = useState<'audio' | 'text'>('text');
  const [textInput, setTextInput] = useState('');

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const [showAIForm, setShowAIForm] = useState(false);
  const [formData, setFormData] = useState<AIGeneratedForm>({
    date_or_day: new Date().toLocaleDateString('en-IN'),
    animal_observed_on_time: true,
    clean_drinking_water_provided: true,
    enclosure_cleaned_properly: true,
    normal_behaviour_status: true,
    normal_behaviour_details: '',
    feed_and_supplements_available: true,
    feed_given_as_prescribed: true,
    other_animal_requirements: '',
    incharge_signature: currentUser?.name || '',
    daily_animal_health_monitoring: '',
    carnivorous_animal_feeding_chart: '',
    medicine_stock_register: '',
    daily_wildlife_monitoring: '',
  });
  
  const [isSaving, setIsSaving] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const animalsData = await api.getAnimals();
        setAnimals(animalsData);
        if (animalsData.length > 0) {
          setSelectedAnimalId(animalsData[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch animals:', error);
        toast.error(language === 'en' ? 'Failed to load animals' : 'जानवर लोड करने में विफल');
      }
    };

    fetchAnimals();
  }, [language]);

  useEffect(() => {
    if (isRecording) {
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRecording]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        setHasRecording(true);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setHasRecording(false);
      toast.success(language === 'en' ? 'Recording started' : 'रिकॉर्डिंग शुरू हुई');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error(language === 'en' ? 'Could not access microphone' : 'माइक्रोफ़ोन तक नहीं पहुंच सका');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success(language === 'en' ? 'Recording saved' : 'रिकॉर्डिंग सहेजी गई');
    }
  };

  const [processedTranscript, setProcessedTranscript] = useState('');

  const handleProcessInput = async () => {
    if (!selectedAnimalId) {
      toast.error(language === 'en' ? 'Please select an animal' : 'कृपया एक जानवर चुनें');
      return;
    }

    if (inputMode === 'audio' && !audioBlob) {
      toast.error(language === 'en' ? 'No audio recorded' : 'कोई ऑडियो रिकॉर्ड नहीं हुआ');
      return;
    }

    if (inputMode === 'text' && !textInput.trim()) {
      toast.error(language === 'en' ? 'Please enter observation text' : 'कृपया अवलोकन टेक्स्ट दर्ज करें');
      return;
    }

    setIsProcessing(true);
    toast.info(language === 'en' ? 'Processing with AI...' : 'AI के साथ प्रोसेस हो रहा है...');

    try {
      let transcript = '';

      if (inputMode === 'audio' && audioBlob) {
        const transcribeResult = await api.transcribeAudio(audioBlob, language === 'hi' ? 'hi' : 'en');
        transcript = transcribeResult.transcript;
        toast.success(language === 'en' ? 'Audio transcribed!' : 'ऑडियो ट्रांसक्राइब हो गया!');
      } else {
        transcript = textInput;
      }

      setProcessedTranscript(transcript);

      setFormData(prev => ({
        ...prev,
        date_or_day: selectedDate,
        incharge_signature: currentUser?.name || '',
        normal_behaviour_details: language === 'en' 
          ? `Observation: ${transcript}` 
          : `अवलोकन: ${transcript}`,
      }));

      setShowAIForm(true);
      toast.success(
        language === 'en' ? '✨ Ready to review and submit!' : '✨ समीक्षा और जमा करने के लिए तैयार!'
      );
    } catch (error) {
      console.error('Error processing input:', error);
      toast.error(language === 'en' ? 'Failed to process input' : 'इनपुट प्रोसेस नहीं हो सका');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitForm = async () => {
    if (!selectedAnimalId) {
      toast.error(language === 'en' ? 'Please select an animal' : 'कृपया एक जानवर चुनें');
      return;
    }

    setIsSaving(true);
    toast.info(language === 'en' ? 'Saving observation with AI...' : 'AI के साथ अवलोकन सहेजा जा रहा है...');

    try {
      const observationData = {
        animal_id: selectedAnimalId,
        audio_text: processedTranscript,
        date: selectedDate,
        is_emergency: false,
      };

      await api.createObservation(observationData);
      
      toast.success(language === 'en' ? '✨ Observation saved successfully!' : '✨ अवलोकन सफलतापूर्वक सहेजा गया!');
      
      setTimeout(() => {
        setCurrentScreen('dashboard');
      }, 1000);
    } catch (error) {
      console.error('Error saving observation:', error);
      toast.error(language === 'en' ? 'Failed to save observation' : 'अवलोकन सहेजने में विफल');
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const selectedAnimal = animals.find(a => a.id === selectedAnimalId);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 pb-8"
    >
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-r from-green-600 to-green-700 dark:from-gray-800 dark:to-gray-900 text-white p-6 pb-8 rounded-b-3xl shadow-lg sticky top-0 z-10"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentScreen('dashboard')}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{t.dailyLog}</h1>
            <p className="text-sm text-white/80">
              {language === 'en' ? 'Record animal observation' : 'जानवर का अवलोकन रिकॉर्ड करें'}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="p-6 space-y-6">
        {!showAIForm ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 bg-white dark:bg-gray-800">
                <Label className="text-green-900 dark:text-green-100 mb-2 block">
                  {language === 'en' ? 'Select Animal' : 'जानवर चुनें'}
                </Label>
                <Select value={selectedAnimalId} onValueChange={setSelectedAnimalId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={language === 'en' ? 'Choose an animal' : 'एक जानवर चुनें'} />
                  </SelectTrigger>
                  <SelectContent>
                    {animals.map((animal) => (
                      <SelectItem key={animal.id} value={animal.id}>
                        {animal.name} - {animal.species}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 bg-white dark:bg-gray-800">
                <Label className="text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  {language === 'en' ? 'Select Date' : 'तारीख चुनें'}
                </Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full"
                />
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 bg-white dark:bg-gray-800">
                <div className="flex gap-3 mb-4">
                  <Button
                    onClick={() => setInputMode('text')}
                    variant={inputMode === 'text' ? 'default' : 'outline'}
                    className="flex-1"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'Text' : 'टेक्स्ट'}
                  </Button>
                  <Button
                    onClick={() => setInputMode('audio')}
                    variant={inputMode === 'audio' ? 'default' : 'outline'}
                    className="flex-1"
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'Audio' : 'ऑडियो'}
                  </Button>
                </div>

                {inputMode === 'text' ? (
                  <div className="space-y-3">
                    <Label className="text-green-900 dark:text-green-100">
                      {language === 'en' ? 'Enter observation details' : 'अवलोकन विवरण दर्ज करें'}
                    </Label>
                    <Textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder={language === 'en' 
                        ? 'Describe the animal\'s behavior, health, feeding, etc...' 
                        : 'जानवर के व्यवहार, स्वास्थ्य, भोजन आदि का वर्णन करें...'}
                      rows={6}
                      className="w-full"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center gap-4">
                      {!hasRecording ? (
                        <>
                          <div className="text-center">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={isRecording ? handleStopRecording : handleStartRecording}
                              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg ${
                                isRecording 
                                  ? 'bg-red-500 hover:bg-red-600' 
                                  : 'bg-green-600 hover:bg-green-700'
                              }`}
                            >
                              {isRecording ? (
                                <Square className="w-8 h-8 text-white" />
                              ) : (
                                <Mic className="w-8 h-8 text-white" />
                              )}
                            </motion.button>
                          </div>
                          {isRecording && (
                            <div className="text-center">
                              <p className="text-2xl font-mono text-red-600">{formatTime(recordingTime)}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {language === 'en' ? 'Recording in progress...' : 'रिकॉर्डिंग चल रही है...'}
                              </p>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center space-y-3">
                          <p className="text-green-600 font-medium">
                            ✓ {language === 'en' ? 'Recording completed' : 'रिकॉर्डिंग पूर्ण'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {language === 'en' ? 'Duration:' : 'अवधि:'} {formatTime(recordingTime)}
                          </p>
                          <Button variant="outline" onClick={() => {
                            setHasRecording(false);
                            setAudioBlob(null);
                            setRecordingTime(0);
                          }}>
                            {language === 'en' ? 'Record Again' : 'फिर से रिकॉर्ड करें'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                onClick={handleProcessInput}
                disabled={isProcessing || (inputMode === 'text' && !textInput.trim()) || (inputMode === 'audio' && !hasRecording)}
                className="w-full h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {language === 'en' ? 'Processing...' : 'प्रोसेस हो रहा है...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    {language === 'en' ? 'Generate AI Form' : 'AI फॉर्म बनाएं'}
                  </>
                )}
              </Button>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 border-2 border-green-200">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-bold text-green-900 dark:text-green-100">
                  {language === 'en' ? 'AI Generated Form' : 'AI जनरेटेड फॉर्म'}
                </h2>
              </div>
              
              <div className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">{language === 'en' ? 'Animal' : 'जानवर'}</Label>
                  <p className="text-base">{selectedAnimal?.name} - {selectedAnimal?.species}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium">{language === 'en' ? 'Date' : 'तारीख'}</Label>
                  <p className="text-base">{formData.date_or_day}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox checked={formData.animal_observed_on_time} />
                  <Label>{language === 'en' ? 'Animal observed on time' : 'समय पर जानवर देखा गया'}</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox checked={formData.clean_drinking_water_provided} />
                  <Label>{language === 'en' ? 'Clean drinking water provided' : 'स्वच्छ पेयजल प्रदान किया गया'}</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox checked={formData.enclosure_cleaned_properly} />
                  <Label>{language === 'en' ? 'Enclosure cleaned properly' : 'बाड़ा ठीक से साफ किया गया'}</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox checked={formData.normal_behaviour_status} />
                  <Label>{language === 'en' ? 'Normal behaviour observed' : 'सामान्य व्यवहार देखा गया'}</Label>
                </div>

                {formData.normal_behaviour_details && (
                  <div>
                    <Label className="text-sm font-medium">{language === 'en' ? 'Behaviour Details' : 'व्यवहार विवरण'}</Label>
                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      {formData.normal_behaviour_details}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Checkbox checked={formData.feed_and_supplements_available} />
                  <Label>{language === 'en' ? 'Feed and supplements available' : 'चारा और सप्लीमेंट उपलब्ध'}</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox checked={formData.feed_given_as_prescribed} />
                  <Label>{language === 'en' ? 'Feed given as prescribed' : 'निर्धारित अनुसार चारा दिया गया'}</Label>
                </div>

                {formData.other_animal_requirements && (
                  <div>
                    <Label className="text-sm font-medium">{language === 'en' ? 'Other Requirements' : 'अन्य आवश्यकताएं'}</Label>
                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      {formData.other_animal_requirements}
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium">{language === 'en' ? 'Incharge Signature' : 'प्रभारी के हस्ताक्षर'}</Label>
                  <p className="text-base">{formData.incharge_signature}</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  onClick={handleSubmitForm}
                  disabled={isSaving}
                  className="w-full h-12 bg-green-600 hover:bg-green-700"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {language === 'en' ? 'Saving...' : 'सहेजा जा रहा है...'}
                    </>
                  ) : (
                    language === 'en' ? 'Submit Observation' : 'अवलोकन जमा करें'
                  )}
                </Button>
                
                <Button
                  onClick={() => setShowAIForm(false)}
                  variant="outline"
                  className="w-full"
                  disabled={isSaving}
                >
                  {language === 'en' ? 'Back to Input' : 'इनपुट पर वापस जाएं'}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
