import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { detectLanguage, changeLanguage } from '../i18n';

interface UseLanguageDetectionProps {
  text: string;
  autoSwitch?: boolean;
}

export const useLanguageDetection = ({ 
  text, 
  autoSwitch = true 
}: UseLanguageDetectionProps) => {
  const { i18n } = useTranslation();
  
  // Detect the language of the text
  const detectedLanguage = detectLanguage(text);
  
  // Switch language automatically if requested
  useEffect(() => {
    if (autoSwitch && text && detectedLanguage !== i18n.language) {
      changeLanguage(detectedLanguage);
    }
  }, [text, detectedLanguage, i18n.language, autoSwitch]);
  
  return {
    detectedLanguage,
    currentLanguage: i18n.language,
    isHebrew: detectedLanguage === 'he'
  };
}; 