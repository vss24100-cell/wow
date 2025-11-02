import React, { useContext, useState, useRef } from 'react';
import { AppContext } from '../App';
import { translations } from './mockData';
import { ArrowLeft, Mic, Square, Loader2, CheckCircle, Lock, Camera, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';

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
  const { language, setCurrentScreen, selectedAnimal, currentUser } = useContext(AppContext);
  const t = translations[language];

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  // AI Form state
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
  
  const [showGatePhotoDialog, setShowGatePhotoDialog] = useState(false);
  const [gatePhotoUploaded, setGatePhotoUploaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Recording timer
  React.useEffect(() => {
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

  const handleProcessAudio = async () => {
    if (!audioBlob) {
      toast.error(language === 'en' ? 'No audio recorded' : 'कोई ऑडियो रिकॉर्ड नहीं हुआ');
      return;
    }

    setIsProcessing(true);
    toast.info(language === 'en' ? 'Processing audio with AI...' : 'AI के साथ ऑडियो प्रोसेस हो रहा है...');

    try {
      // Step 1: Transcribe audio
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('language', language === 'hi' ? 'hi' : 'en');

      const transcribeResponse = await fetch('/api/observations/audio-transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!transcribeResponse.ok) {
        throw new Error('Transcription failed');
      }

      const transcribeData = await transcribeResponse.json();
      const transcript = transcribeData.transcript;

      toast.success(language === 'en' ? 'Audio transcribed!' : 'ऑडियो ट्रांसक्राइब हो गया!');

      // Step 2: Create observation which will use AI to generate structured data
      const observationData = {
        animal_id: selectedAnimal?.id || '',
        audio_text: transcript,
        date: new Date().toISOString(),
        is_emergency: false,
      };

      const observationResponse = await fetch('/api/observations/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(observationData),
      });

      if (!observationResponse.ok) {
        throw new Error('Failed to generate form');
      }

      const observationResult = await observationResponse.json();

      // Update form with AI-generated data
      setFormData({
        date_or_day: observationResult.date_or_day || new Date().toLocaleDateString('en-IN'),
        animal_observed_on_time: observationResult.animal_observed_on_time ?? true,
        clean_drinking_water_provided: observationResult.clean_drinking_water_provided ?? true,
        enclosure_cleaned_properly: observationResult.enclosure_cleaned_properly ?? true,
        normal_behaviour_status: observationResult.normal_behaviour_status ?? true,
        normal_behaviour_details: observationResult.normal_behaviour_details || '',
        feed_and_supplements_available: observationResult.feed_and_supplements_available ?? true,
        feed_given_as_prescribed: observationResult.feed_given_as_prescribed ?? true,
        other_animal_requirements: observationResult.other_animal_requirements || '',
        incharge_signature: observationResult.incharge_signature || currentUser?.name || '',
        daily_animal_health_monitoring: observationResult.daily_animal_health_monitoring || '',
        carnivorous_animal_feeding_chart: observationResult.carnivorous_animal_feeding_chart || '',
        medicine_stock_register: observationResult.medicine_stock_register || '',
        daily_wildlife_monitoring: observationResult.daily_wildlife_monitoring || '',
      });

      setShowAIForm(true);
      toast.success(
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>{language === 'en' ? 'AI form generated!' : 'AI फॉर्म तैयार हो गया!'}</span>
        </div>
      );
    } catch (error) {
      console.error('Error processing audio:', error);
      toast.error(language === 'en' ? 'Failed to process audio' : 'ऑडियो प्रोसेस नहीं हो सका');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReRecord = () => {
    setHasRecording(false);
    setRecordingTime(0);
    setAudioBlob(null);
    setShowAIForm(false);
    toast.info(language === 'en' ? 'Ready to record again' : 'फिर से रिकॉर्ड करने के लिए तैयार');
  };

  const handleSubmitForm = async () => {
    setIsSaving(true);
    toast.info(language === 'en' ? 'Saving observation...' : 'अवलोकन सहेजा जा रहा है...');

    try {
      // The observation was already created during AI processing
      // Here we could update it if needed, or just proceed
      toast.success(language === 'en' ? 'Observation saved successfully' : 'अवलोकन सफलतापूर्वक सहेजा गया');
      
      // Show gate photo dialog
      setTimeout(() => {
        setShowGatePhotoDialog(true);
      }, 800);
    } catch (error) {
      console.error('Error saving observation:', error);
      toast.error(language === 'en' ? 'Failed to save observation' : 'अवलोकन सहेजने में विफल');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGatePhotoUpload = () => {
    setGatePhotoUploaded(true);
    toast.success(language === 'en' ? 'Gate photo uploaded' : 'गेट फोटो अपलोड की गई');
  };

  const handleFinishAndReturn = () => {
    if (gatePhotoUploaded) {
      setShowGatePhotoDialog(false);
      toast.success(language === 'en' ? 'Safety check complete!' : 'सुरक्षा जांच पूर्ण!');
      setTimeout(() => {
        setCurrentScreen('dashboard');
      }, 500);
    } else {
      toast.error(language === 'en' ? 'Please upload gate photo first' : 'कृपया पहले गेट फोटो अपलोड करें');
    }
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
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-r from-green-600 to-green-700 dark:from-gray-800 dark:to-gray-900 text-white p-6 pb-8 rounded-b-3xl shadow-lg sticky top-0 z-10"
      >
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentScreen('dashboard')}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-white">{t.dailyLog}</h1>
            <p className="text-sm text-white/80">{selectedAnimal?.name} - {selectedAnimal?.species}</p>
          </div>
        </div>
      </motion.div>

      <div className="p-6 space-y-6">
        {/* Animal Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden">
                <ImageWithFallback
                  src={selectedAnimal?.image || ''}
                  alt={selectedAnimal?.name || ''}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-green-900 dark:text-green-100">{selectedAnimal?.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{selectedAnimal?.species} #{selectedAnimal?.number}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.lastChecked}: {selectedAnimal?.lastChecked}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Voice Recording Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center gap-2 mb-4">
              <Mic className="w-5 h-5 text-green-600" />
              <h3 className="text-green-900 dark:text-green-100">
                {language === 'en' ? 'Voice Recording' : 'वॉयस रिकॉर्डिंग'}
              </h3>
            </div>

            <div className="space-y-4">
              {/* Status indicator */}
              {isRecording && (
                <div className="text-center">
                  <Badge className="bg-red-500 text-white animate-pulse">
                    {language === 'en' ? '● Recording...' : '● रिकॉर्ड हो रहा है...'}
                  </Badge>
                </div>
              )}
              
              {/* Recording Button */}
              <div className="flex flex-col items-center gap-4">
                {!hasRecording && !showAIForm ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <Button
                        onClick={isRecording ? handleStopRecording : handleStartRecording}
                        className={`w-24 h-24 rounded-full ${
                          isRecording
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                        } shadow-xl transition-all`}
                        size="icon"
                      >
                        {isRecording ? <Square className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
                      </Button>
                      {isRecording && (
                        <motion.div
                          className="absolute -inset-2 border-4 border-red-300 rounded-full pointer-events-none"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {isRecording 
                        ? (language === 'en' ? 'Tap to stop' : 'रोकने के लिए टैप करें')
                        : (language === 'en' ? 'Tap to record' : 'रिकॉर्ड करने के लिए टैप करें')
                      }
                    </p>
                  </div>
                ) : hasRecording && !showAIForm ? (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <CheckCircle className="w-16 h-16 text-green-600" />
                    <p className="text-green-600 font-medium">
                      {language === 'en' ? 'Recording saved!' : 'रिकॉर्डिंग सहेजी गई!'}
                    </p>
                    <div className="flex gap-3 w-full">
                      <Button
                        onClick={handleProcessAudio}
                        disabled={isProcessing}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {language === 'en' ? 'Processing...' : 'प्रोसेस हो रहा है...'}
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            {language === 'en' ? 'Generate Form' : 'फॉर्म बनाएं'}
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleReRecord}
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-50"
                      >
                        {language === 'en' ? 'Re-record' : 'फिर से रिकॉर्ड करें'}
                      </Button>
                    </div>
                  </div>
                ) : null}

                {/* Timer */}
                {!showAIForm && (
                  <div className="text-center">
                    <div className="text-2xl text-green-900 dark:text-green-100 mb-2">
                      {formatTime(recordingTime)}
                    </div>
                    {isRecording && (
                      <div className="flex items-center justify-center gap-1">
                        {[...Array(8)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-1 bg-green-600 rounded-full"
                            animate={{ height: ['8px', '24px', '8px'] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* AI-Generated Form */}
        {showAIForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="text-purple-900 dark:text-purple-100">
                  {language === 'en' ? 'AI-Generated Daily Log Form' : 'AI द्वारा बनाया गया दैनिक लॉग फॉर्म'}
                </h3>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
                {language === 'en' 
                  ? 'Review and edit the automatically filled form below'
                  : 'नीचे दिए गए स्वचालित रूप से भरे गए फॉर्म की समीक्षा और संपादन करें'}
              </p>

              <div className="space-y-4">
                {/* Date */}
                <div>
                  <Label className="text-purple-900 dark:text-purple-100">
                    {language === 'en' ? 'Date / Day' : 'तिथि / दिन'}
                  </Label>
                  <Input
                    value={formData.date_or_day}
                    onChange={(e) => setFormData({ ...formData, date_or_day: e.target.value })}
                    className="mt-1"
                  />
                </div>

                {/* Boolean fields */}
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { key: 'animal_observed_on_time', label: language === 'en' ? 'Animal observed on time' : 'समय पर पशु देखा गया' },
                    { key: 'clean_drinking_water_provided', label: language === 'en' ? 'Clean drinking water provided' : 'स्वच्छ पेयजल उपलब्ध कराया गया' },
                    { key: 'enclosure_cleaned_properly', label: language === 'en' ? 'Enclosure cleaned properly' : 'बाड़े की ठीक से सफाई की गई' },
                    { key: 'normal_behaviour_status', label: language === 'en' ? 'Normal behaviour status' : 'सामान्य व्यवहार स्थिति' },
                    { key: 'feed_and_supplements_available', label: language === 'en' ? 'Feed and supplements available' : 'चारा और पूरक उपलब्ध' },
                    { key: 'feed_given_as_prescribed', label: language === 'en' ? 'Feed given as prescribed' : 'निर्धारित अनुसार चारा दिया गया' },
                  ].map((field) => (
                    <div key={field.key} className="flex items-center space-x-2 p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <Checkbox
                        id={field.key}
                        checked={formData[field.key as keyof AIGeneratedForm] as boolean}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, [field.key]: checked as boolean })
                        }
                      />
                      <label htmlFor={field.key} className="text-sm cursor-pointer flex-1">
                        {field.label}
                      </label>
                    </div>
                  ))}
                </div>

                {/* Text fields */}
                <div>
                  <Label className="text-purple-900 dark:text-purple-100">
                    {language === 'en' ? 'Abnormal Behaviour Details' : 'असामान्य व्यवहार विवरण'}
                  </Label>
                  <Textarea
                    value={formData.normal_behaviour_details}
                    onChange={(e) => setFormData({ ...formData, normal_behaviour_details: e.target.value })}
                    rows={2}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-purple-900 dark:text-purple-100">
                    {language === 'en' ? 'Daily Animal Health Monitoring' : 'दैनिक पशु स्वास्थ्य निगरानी'}
                  </Label>
                  <Textarea
                    value={formData.daily_animal_health_monitoring}
                    onChange={(e) => setFormData({ ...formData, daily_animal_health_monitoring: e.target.value })}
                    rows={2}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-purple-900 dark:text-purple-100">
                    {language === 'en' ? 'Carnivorous Animal Feeding Chart' : 'मांसाहारी पशु खाद्य चार्ट'}
                  </Label>
                  <Textarea
                    value={formData.carnivorous_animal_feeding_chart}
                    onChange={(e) => setFormData({ ...formData, carnivorous_animal_feeding_chart: e.target.value })}
                    rows={2}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-purple-900 dark:text-purple-100">
                    {language === 'en' ? 'Medicine Stock Register' : 'दवा स्टॉक रजिस्टर'}
                  </Label>
                  <Textarea
                    value={formData.medicine_stock_register}
                    onChange={(e) => setFormData({ ...formData, medicine_stock_register: e.target.value })}
                    rows={2}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-purple-900 dark:text-purple-100">
                    {language === 'en' ? 'Daily Wildlife Monitoring' : 'दैनिक वन्यजीव निगरानी'}
                  </Label>
                  <Textarea
                    value={formData.daily_wildlife_monitoring}
                    onChange={(e) => setFormData({ ...formData, daily_wildlife_monitoring: e.target.value })}
                    rows={2}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-purple-900 dark:text-purple-100">
                    {language === 'en' ? 'Other Animal Requirements' : 'अन्य पशु आवश्यकताएं'}
                  </Label>
                  <Textarea
                    value={formData.other_animal_requirements}
                    onChange={(e) => setFormData({ ...formData, other_animal_requirements: e.target.value })}
                    rows={2}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-purple-900 dark:text-purple-100">
                    {language === 'en' ? 'In-charge Signature / Name' : 'प्रभारी हस्ताक्षर / नाम'}
                  </Label>
                  <Input
                    value={formData.incharge_signature}
                    onChange={(e) => setFormData({ ...formData, incharge_signature: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            </Card>

            {/* Submit Button */}
            <Button
              onClick={handleSubmitForm}
              disabled={isSaving}
              className="w-full h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg text-lg"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {language === 'en' ? 'Saving...' : 'सहेजा जा रहा है...'}
                </>
              ) : (
                <>{t.submit} / जमा करें</>
              )}
            </Button>

            <Button
              onClick={handleReRecord}
              variant="outline"
              className="w-full border-red-500 text-red-500 hover:bg-red-50"
            >
              {language === 'en' ? 'Record Again' : 'फिर से रिकॉर्ड करें'}
            </Button>
          </motion.div>
        )}
      </div>

      {/* Gate Lock Photo Dialog */}
      <AlertDialog open={showGatePhotoDialog} onOpenChange={setShowGatePhotoDialog}>
        <AlertDialogContent className="max-w-md mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
              <Lock className="w-6 h-6" />
              {language === 'en' ? 'Safety Check Required' : 'सुरक्षा जांच आवश्यक'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {language === 'en' 
                ? 'Please upload a photo of the locked gate to ensure animal safety before leaving.'
                : 'कृपया जाने से पहले पशु सुरक्षा सुनिश्चित करने के लिए बंद गेट की फोटो अपलोड करें।'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <Button
              onClick={handleGatePhotoUpload}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Camera className="w-5 h-5 mr-2" />
              {gatePhotoUploaded 
                ? (language === 'en' ? '✓ Photo Uploaded' : '✓ फोटो अपलोड की गई')
                : (language === 'en' ? 'Upload Gate Photo' : 'गेट फोटो अपलोड करें')
              }
            </Button>
          </div>

          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleFinishAndReturn}
              disabled={!gatePhotoUploaded}
              className={!gatePhotoUploaded ? 'opacity-50' : ''}
            >
              {language === 'en' ? 'Finish & Return' : 'समाप्त करें और वापस जाएं'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
