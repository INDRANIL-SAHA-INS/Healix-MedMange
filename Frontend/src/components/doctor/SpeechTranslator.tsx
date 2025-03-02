import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, X } from 'lucide-react';

interface Props {
  variant?: 'minimal' | 'full';
}

export const SpeechTranslator: React.FC<Props> = ({ variant = 'minimal' }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('hi-IN');
  const recognitionRef = useRef<any>(null);

  const languages = [
    { code: 'hi-IN', name: 'Hindi', apiCode: 'hi' },
    { code: 'bn-IN', name: 'Bengali', apiCode: 'bn' }
  ];

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = selectedLanguage;

      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('Transcribed text:', transcript); // Debug log
        
        try {
          const response = await fetch('https://google-api31.p.rapidapi.com/gtranslate', {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'X-RapidAPI-Key': '75e3fe6846mshdd3fd334eb78277p1ad087jsn576dc4e6f28d',
              'X-RapidAPI-Host': 'google-api31.p.rapidapi.com'
            },
            body: JSON.stringify({
              text: transcript,
              from_lang: selectedLanguage.split('-')[0], // Extract language code (hi/bn)
              to: 'en'
            })
          });
          
          const data = await response.json();
          console.log('Translation response:', data); // Debug log
          
          if (data && data.translated_text) {
            setTranslatedText(data.translated_text);
            
            // Text to speech
            if ('speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance(data.translated_text);
              utterance.lang = 'en-US';
              window.speechSynthesis.speak(utterance);
            }
          } else {
            console.error('Unexpected API response format:', data);
            throw new Error('Translation response format unexpected');
          }
        } catch (err) {
          console.error('Translation error:', err);
          setError('Translation failed. Please try again.');
        }
      };

      recognition.onerror = (event: any) => {
        setError('Error occurred in recognition: ' + event.error);
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      setError('Speech recognition not supported in this browser');
    }
  }, [selectedLanguage]); // Recreate recognition when language changes

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setError(null);
      recognitionRef.current?.start();
    }
    setIsRecording(!isRecording);
  };

  const clearTranslation = () => {
    setTranslatedText('');
    setError(null);
  };

  if (variant === 'minimal') {
    return (
      <div className="relative">
        <div className="flex items-center gap-2">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="text-xs px-2 py-1 border rounded"
            disabled={isRecording}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
          <button
            onClick={toggleRecording}
            className={`p-1.5 rounded ${
              isRecording 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isRecording ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>
        </div>
        
        {(translatedText || error) && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white shadow-lg rounded-lg border p-3 z-20">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {translatedText && <p className="text-sm text-gray-700">{translatedText}</p>}
                {error && <p className="text-xs text-red-500">{error}</p>}
              </div>
              <button 
                onClick={clearTranslation}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm mb-4">
      <div className="p-4 border-b border-blue-100">
        <h3 className="text-lg font-semibold text-blue-900">Regional Language Translator</h3>
        <p className="text-sm text-blue-600 mt-1">Communicate effectively with your patients in their preferred language</p>
      </div>
      
      <div className="p-4">
        <div className="flex items-center gap-4">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-2 rounded-lg border-2 border-blue-100 text-blue-900 font-medium focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            disabled={isRecording}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
          <button
            onClick={toggleRecording}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              isRecording 
                ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-200' 
                : 'bg-blue-500 text-white hover:bg-blue-600 shadow-blue-200'
            } shadow-lg`}
          >
            {isRecording ? (
              <>
                <MicOff className="h-5 w-5" />
                <span>Stop Recording</span>
              </>
            ) : (
              <>
                <Mic className="h-5 w-5" />
                <span>Start Recording</span>
              </>
            )}
          </button>
        </div>

        {(translatedText || error) && (
          <div className="mt-4 bg-white rounded-lg border border-blue-100 p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {translatedText && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-blue-900">Translation:</p>
                    <p className="text-base text-gray-700">{translatedText}</p>
                  </div>
                )}
                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}
              </div>
              <button 
                onClick={clearTranslation}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 