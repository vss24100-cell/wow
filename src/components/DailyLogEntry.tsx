import { useContext, useState, useRef, useEffect } from 'react';
import { AppContext } from '../App';
import { translations } from './mockData';
import { ArrowLeft, Mic, Square, Loader2, Sparkles, Calendar as CalendarIcon, FileText, Image as ImageIcon, Video, Lock, Upload, X, Edit2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
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

  const [animalName, setAnimalName] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [inputMethod, setInputMethod] = useState<'audio' | 'text'>('audio');
  const [textInput, setTextInput] = useState<string>('');
  const [isEmergency, setIsEmergency] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const [animalImages, setAnimalImages] = useState<File[]>([]);
  const [enclosureImages, setEnclosureImages] = useState<File[]>([]);
  const [emergencyVideo, setEmergencyVideo] = useState<File | null>(null);
  
  const [showAIForm, setShowAIForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
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
      // Check if mediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error(
          language === 'en' 
            ? 'Audio recording is not supported in this browser/environment' 
            : 'इस ब्राउज़र/वातावरण में ऑडियो रिकॉर्डिंग समर्थित नहीं है'
        );
        return;
      }

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Check if MediaRecorder is supported
      if (!window.MediaRecorder) {
        toast.error(
          language === 'en' 
            ? 'Media recording is not supported in this browser' 
            : 'इस ब्राउज़र में मीडिया रिकॉर्डिंग समर्थित नहीं है'
        );
        stream.getTracks().forEach(track => track.stop());
        return;
      }

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

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        toast.error(
          language === 'en' 
            ? 'Recording error occurred' 
            : 'रिकॉर्डिंग त्रुटि हुई'
        );
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setHasRecording(false);
      toast.success(language === 'en' ? 'Recording started' : 'रिकॉर्डिंग शुरू हुई');
    } catch (error: any) {
      console.error('Error starting recording:', error);
      
      let errorMessage = language === 'en' 
        ? 'Could not access microphone. Please grant microphone permission.' 
        : 'माइक्रोफ़ोन तक नहीं पहुंच सका। कृपया माइक्रोफ़ोन अनुमति दें।';
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = language === 'en'
          ? '🎤 Microphone permission denied. Please allow microphone access in your browser settings.'
          : '🎤 माइक्रोफ़ोन अनुमति अस्वीकार। कृपया अपने ब्राउज़र सेटिंग्स में माइक्रोफ़ोन एक्सेस की अनुमति दें।';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = language === 'en'
          ? '🎤 No microphone found. Please connect a microphone and try again.'
          : '🎤 कोई माइक्रोफ़ोन नहीं मिला। कृपया माइक्रोफ़ोन कनेक्ट करें और पुनः प्रयास करें।';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = language === 'en'
          ? '🎤 Microphone is already in use by another application.'
          : '🎤 माइक्रोफ़ोन पहले से किसी अन्य एप्लिकेशन द्वारा उपयोग में है।';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = language === 'en'
          ? '🎤 Audio recording is not supported in this environment. Try using text input instead.'
          : '🎤 इस वातावरण में ऑडियो रिकॉर्डिंग समर्थित नहीं है। इसके बजाय टेक्स्ट इनपुट का उपयोग करें।';
      }
      
      toast.error(errorMessage, { duration: 5000 });
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'animal' | 'enclosure') => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      if (type === 'animal') {
        setAnimalImages(prev => [...prev, ...files]);
        toast.success(language === 'en' ? `${files.length} animal image(s) added` : `${files.length} जानवर की तस्वीरें जोड़ी गईं`);
      } else {
        setEnclosureImages(prev => [...prev, ...files]);
        toast.success(language === 'en' ? `${files.length} enclosure image(s) added` : `${files.length} बाड़े की तस्वीरें जोड़ी गईं`);
      }
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEmergencyVideo(file);
      toast.success(language === 'en' ? 'Emergency video added' : 'आपातकालीन वीडियो जोड़ा गया');
    }
  };

  const removeImage = (index: number, type: 'animal' | 'enclosure') => {
    if (type === 'animal') {
      setAnimalImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setEnclosureImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleProcessInput = async () => {
    if (!animalName.trim()) {
      toast.error(language === 'en' ? 'Please enter animal name' : 'कृपया जानवर का नाम दर्ज करें');
      return;
    }

    if (inputMethod === 'audio' && !audioBlob) {
      toast.error(language === 'en' ? 'No audio recorded' : 'कोई ऑडियो रिकॉर्ड नहीं हुआ');
      return;
    }

    if (inputMethod === 'text' && !textInput.trim()) {
      toast.error(language === 'en' ? 'Please enter observation text' : 'कृपया अवलोकन पाठ दर्ज करें');
      return;
    }

    setIsProcessing(true);
    toast.info(language === 'en' ? 'Processing with AI...' : 'AI के साथ प्रोसेस हो रहा है...');

    try {
      let transcript = '';
      
      if (inputMethod === 'audio' && audioBlob) {
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
    if (!animalName.trim()) {
      toast.error(language === 'en' ? 'Please enter animal name' : 'कृपया जानवर का नाम दर्ज करें');
      return;
    }

    setIsSaving(true);
    const message = isEmergency 
      ? (language === 'en' ? '🚨 Saving emergency observation...' : '🚨 आपातकालीन अवलोकन सहेजा जा रहा है...')
      : (language === 'en' ? 'Saving observation...' : 'अवलोकन सहेजा जा रहा है...');
    toast.info(message);

    try {
      const observationData = {
        animal_name: animalName,
        audio_text: processedTranscript,
        date: selectedDate,
        is_emergency: isEmergency,
        has_animal_images: animalImages.length > 0,
        has_enclosure_images: enclosureImages.length > 0,
        has_emergency_video: emergencyVideo !== null,
      };

      await api.createObservation(observationData);
      
      const successMessage = isEmergency
        ? (language === 'en' ? '🚨 Emergency observation saved! Alert sent.' : '🚨 आपातकालीन अवलोकन सहेजा गया! अलर्ट भेजा गया।')
        : (language === 'en' ? '✨ Observation saved successfully!' : '✨ अवलोकन सफलतापूर्वक सहेजा गया!');
      
      toast.success(successMessage);
      
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

  const updateFormField = (field: keyof AIGeneratedForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
                  {language === 'en' ? 'Enter Animal Name' : 'जानवर का नाम दर्ज करें'}
                </Label>
                <Input
                  type="text"
                  value={animalName}
                  onChange={(e) => setAnimalName(e.target.value)}
                  placeholder={language === 'en' ? 'Enter animal name' : 'जानवर का नाम दर्ज करें'}
                  className="w-full"
                />
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
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
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 bg-white dark:bg-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <Checkbox
                    id="emergency"
                    checked={isEmergency}
                    onCheckedChange={(checked: boolean) => setIsEmergency(checked)}
                  />
                  <Label htmlFor="emergency" className="text-red-600 dark:text-red-400 font-medium cursor-pointer">
                    🚨 {language === 'en' ? 'Mark as Emergency' : 'आपातकालीन के रूप में चिह्नित करें'}
                  </Label>
                </div>
                {isEmergency && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {language === 'en' ? 'Emergency alerts will be sent to veterinarians and supervisors' : 'पशु चिकित्सकों और पर्यवेक्षकों को आपातकालीन अलर्ट भेजे जाएंगे'}
                  </p>
                )}
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="p-6 bg-white dark:bg-gray-800">
                <Tabs value={inputMethod} onValueChange={(value: string) => setInputMethod(value as 'audio' | 'text')}>
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="audio" className="flex items-center gap-2">
                      <Mic className="w-4 h-4" />
                      {language === 'en' ? 'Audio' : 'ऑडियो'}
                    </TabsTrigger>
                    <TabsTrigger value="text" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {language === 'en' ? 'Text' : 'टेक्स्ट'}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="audio" className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {language === 'en' 
                          ? '🎤 Click the microphone button to start recording. Your browser will ask for permission.' 
                          : '🎤 रिकॉर्डिंग शुरू करने के लिए माइक्रोफ़ोन बटन पर क्लिक करें।'}
                      </p>
                    </div>
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
                  </TabsContent>

                  <TabsContent value="text" className="space-y-4">
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        {language === 'en' 
                          ? '✍️ Type your observation details below. Include behavior, health, feeding, and any concerns.' 
                          : '✍️ नीचे अपने अवलोकन विवरण टाइप करें। व्यवहार, स्वास्थ्य, भोजन और किसी भी चिंता को शामिल करें।'}
                      </p>
                    </div>
                    <Textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder={language === 'en' 
                        ? 'Enter your observation notes here...\n\nExample: The tiger appeared healthy today. Fed at 9 AM with 5kg meat. Normal behavior observed, actively moving around the enclosure. Water provided and fresh.' 
                        : 'यहाँ अपने अवलोकन नोट्स दर्ज करें...\n\nउदाहरण: बाघ आज स्वस्थ दिखाई दिया। सुबह 9 बजे 5 किलो मांस के साथ खिलाया गया। सामान्य व्यवहार देखा गया।'}
                      rows={10}
                      className="w-full resize-none"
                    />
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {textInput.length} {language === 'en' ? 'characters' : 'वर्ण'}
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 bg-white dark:bg-gray-800">
                <Label className="text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  {language === 'en' ? 'Animal Photos (Optional)' : 'जानवर की फोटो (वैकल्पिक)'}
                </Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageUpload(e, 'animal')}
                      className="hidden"
                      id="animal-images"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('animal-images')?.click()}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {language === 'en' ? 'Upload Animal Photos' : 'जानवर की फोटो अपलोड करें'}
                    </Button>
                  </div>
                  {animalImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {animalImages.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={URL.createObjectURL(img)}
                            alt={`Animal ${idx + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeImage(idx, 'animal')}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Card className="p-6 bg-white dark:bg-gray-800">
                <Label className="text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  {language === 'en' ? 'Enclosure/Lock Photos (Optional)' : 'बाड़ा/ताला की फोटो (वैकल्पिक)'}
                </Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageUpload(e, 'enclosure')}
                      className="hidden"
                      id="enclosure-images"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('enclosure-images')?.click()}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {language === 'en' ? 'Upload Enclosure Photos' : 'बाड़े की फोटो अपलोड करें'}
                    </Button>
                  </div>
                  {enclosureImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {enclosureImages.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={URL.createObjectURL(img)}
                            alt={`Enclosure ${idx + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeImage(idx, 'enclosure')}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            {isEmergency && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="p-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800">
                  <Label className="text-red-900 dark:text-red-100 mb-3 flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    {language === 'en' ? 'Emergency Video (Optional)' : 'आपातकालीन वीडियो (वैकल्पिक)'}
                  </Label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                        id="emergency-video"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('emergency-video')?.click()}
                        className="w-full border-red-300 hover:bg-red-50"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {language === 'en' ? 'Upload Emergency Video' : 'आपातकालीन वीडियो अपलोड करें'}
                      </Button>
                    </div>
                    {emergencyVideo && (
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-medium">{emergencyVideo.name}</span>
                        </div>
                        <button
                          onClick={() => setEmergencyVideo(null)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <Button
                onClick={handleProcessInput}
                disabled={isProcessing || (inputMethod === 'audio' && !hasRecording) || (inputMethod === 'text' && !textInput.trim())}
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-bold text-green-900 dark:text-green-100">
                    {language === 'en' ? 'AI Generated Form' : 'AI जनरेटेड फॉर्म'}
                  </h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditMode(!isEditMode)}
                  className="flex items-center gap-1"
                >
                  <Edit2 className="w-4 h-4" />
                  {isEditMode 
                    ? (language === 'en' ? 'View' : 'देखें')
                    : (language === 'en' ? 'Edit' : 'संपादित करें')
                  }
                </Button>
              </div>
              
              <div className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg">
                <div>
                  <Label className="text-sm font-medium mb-1 block">{language === 'en' ? 'Animal' : 'जानवर'}</Label>
                  <p className="text-base font-medium text-green-700 dark:text-green-400">{animalName}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-1 block">{language === 'en' ? 'Date' : 'तारीख'}</Label>
                  {isEditMode ? (
                    <Input
                      type="text"
                      value={formData.date_or_day}
                      onChange={(e) => updateFormField('date_or_day', e.target.value)}
                    />
                  ) : (
                    <p className="text-base">{formData.date_or_day}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={formData.animal_observed_on_time}
                    onCheckedChange={(checked: boolean) => isEditMode && updateFormField('animal_observed_on_time', checked)}
                    disabled={!isEditMode}
                  />
                  <Label>{language === 'en' ? 'Animal observed on time' : 'समय पर जानवर देखा गया'}</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={formData.clean_drinking_water_provided}
                    onCheckedChange={(checked: boolean) => isEditMode && updateFormField('clean_drinking_water_provided', checked)}
                    disabled={!isEditMode}
                  />
                  <Label>{language === 'en' ? 'Clean drinking water provided' : 'स्वच्छ पेयजल प्रदान किया गया'}</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={formData.enclosure_cleaned_properly}
                    onCheckedChange={(checked: boolean) => isEditMode && updateFormField('enclosure_cleaned_properly', checked)}
                    disabled={!isEditMode}
                  />
                  <Label>{language === 'en' ? 'Enclosure cleaned properly' : 'बाड़ा ठीक से साफ किया गया'}</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={formData.normal_behaviour_status}
                    onCheckedChange={(checked: boolean) => isEditMode && updateFormField('normal_behaviour_status', checked)}
                    disabled={!isEditMode}
                  />
                  <Label>{language === 'en' ? 'Normal behaviour observed' : 'सामान्य व्यवहार देखा गया'}</Label>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-1 block">{language === 'en' ? 'Behaviour Details' : 'व्यवहार विवरण'}</Label>
                  {isEditMode ? (
                    <Textarea
                      value={formData.normal_behaviour_details}
                      onChange={(e) => updateFormField('normal_behaviour_details', e.target.value)}
                      rows={3}
                      className="w-full"
                    />
                  ) : (
                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      {formData.normal_behaviour_details}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={formData.feed_and_supplements_available}
                    onCheckedChange={(checked: boolean) => isEditMode && updateFormField('feed_and_supplements_available', checked)}
                    disabled={!isEditMode}
                  />
                  <Label>{language === 'en' ? 'Feed and supplements available' : 'चारा और सप्लीमेंट उपलब्ध'}</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={formData.feed_given_as_prescribed}
                    onCheckedChange={(checked: boolean) => isEditMode && updateFormField('feed_given_as_prescribed', checked)}
                    disabled={!isEditMode}
                  />
                  <Label>{language === 'en' ? 'Feed given as prescribed' : 'निर्धारित अनुसार चारा दिया गया'}</Label>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-1 block">{language === 'en' ? 'Other Requirements' : 'अन्य आवश्यकताएं'}</Label>
                  {isEditMode ? (
                    <Textarea
                      value={formData.other_animal_requirements}
                      onChange={(e) => updateFormField('other_animal_requirements', e.target.value)}
                      rows={2}
                      className="w-full"
                      placeholder={language === 'en' ? 'Any special needs...' : 'कोई विशेष आवश्यकता...'}
                    />
                  ) : formData.other_animal_requirements ? (
                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      {formData.other_animal_requirements}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">{language === 'en' ? 'None' : 'कोई नहीं'}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium mb-1 block">{language === 'en' ? 'Incharge Signature' : 'प्रभारी के हस्ताक्षर'}</Label>
                  {isEditMode ? (
                    <Input
                      type="text"
                      value={formData.incharge_signature}
                      onChange={(e) => updateFormField('incharge_signature', e.target.value)}
                    />
                  ) : (
                    <p className="text-base font-medium">{formData.incharge_signature}</p>
                  )}
                </div>

                {(animalImages.length > 0 || enclosureImages.length > 0 || emergencyVideo) && (
                  <div className="border-t pt-4 mt-4">
                    <Label className="text-sm font-medium mb-2 block">{language === 'en' ? 'Attachments' : 'संलग्नक'}</Label>
                    <div className="space-y-2 text-sm">
                      {animalImages.length > 0 && (
                        <p className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-green-600" />
                          {animalImages.length} {language === 'en' ? 'animal photo(s)' : 'जानवर की फोटो'}
                        </p>
                      )}
                      {enclosureImages.length > 0 && (
                        <p className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-green-600" />
                          {enclosureImages.length} {language === 'en' ? 'enclosure photo(s)' : 'बाड़े की फोटो'}
                        </p>
                      )}
                      {emergencyVideo && (
                        <p className="flex items-center gap-2 text-red-600">
                          <Video className="w-4 h-4" />
                          {language === 'en' ? '1 emergency video' : '1 आपातकालीन वीडियो'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
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
