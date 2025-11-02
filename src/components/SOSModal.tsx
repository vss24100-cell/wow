import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { translations } from './mockData';
import { AlertTriangle, X, Send, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner@2.0.3';

export function SOSModal() {
  const { language, setShowSOS, selectedAnimal } = useContext(AppContext);
  const t = translations[language];
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      toast.success(language === 'en' ? 'Emergency alert sent!' : 'आपातकालीन अलर्ट भेजा गया!');
      setTimeout(() => {
        setShowSOS(false);
      }, 2000);
    }, 1500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !isSending && !isSent && setShowSOS(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          className="relative w-full max-w-md"
        >
          <Card className="bg-white p-6 shadow-2xl">
            {!isSent ? (
              <>
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg"
                      animate={{
                        boxShadow: [
                          '0 0 0 0 rgba(239, 68, 68, 0.4)',
                          '0 0 0 20px rgba(239, 68, 68, 0)',
                        ],
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <AlertTriangle className="w-8 h-8 text-white" />
                    </motion.div>
                    <div>
                      <h2 className="text-red-900">
                        {t.sosAlert}
                      </h2>
                      <p className="text-sm text-red-600">
                        {language === 'en' ? 'Emergency Alert' : 'आपातकालीन अलर्ट'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSOS(false)}
                    className="text-gray-400 hover:text-gray-600"
                    disabled={isSending}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <p className="text-red-800">
                      {language === 'en'
                        ? 'This will immediately alert the Admin and Vet Doctor about an emergency situation.'
                        : 'यह एडमिन और पशु चिकित्सक को आपातकालीन स्थिति के बारे में तुरंत सचेत करेगा।'}
                    </p>
                  </div>

                  {selectedAnimal && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">
                        {language === 'en' ? 'Animal' : 'जानवर'}
                      </p>
                      <p className="text-gray-900">
                        {selectedAnimal.name} - {selectedAnimal.species}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-gray-700 mb-2">
                      {language === 'en' ? 'Emergency Details' : 'आपातकालीन विवरण'}
                    </label>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={
                        language === 'en'
                          ? 'Describe the emergency situation...'
                          : 'आपातकालीन स्थिति का वर्णन करें...'
                      }
                      rows={4}
                      className="resize-none border-red-200 focus:border-red-500"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => setShowSOS(false)}
                      variant="outline"
                      className="flex-1 h-12"
                      disabled={isSending}
                    >
                      {t.cancel}
                    </Button>
                    <Button
                      onClick={handleSend}
                      className="flex-1 h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                      disabled={isSending}
                    >
                      {isSending ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <Send className="w-5 h-5" />
                        </motion.div>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          {t.sendAlert}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>
                <h3 className="text-green-900 mb-2">
                  {language === 'en' ? 'Alert Sent!' : 'अलर्ट भेजा गया!'}
                </h3>
                <p className="text-gray-600">
                  {language === 'en'
                    ? 'Admin and Vet have been notified'
                    : 'एडमिन और पशु चिकित्सक को सूचित किया गया है'}
                </p>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
