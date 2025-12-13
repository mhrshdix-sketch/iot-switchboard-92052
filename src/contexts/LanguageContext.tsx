import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'fa' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  fa: {
    'dashboard': 'داشبورد',
    'connections': 'اتصالات',
    'panels': 'پنل‌ها',
    'device_ip': 'IP دستگاه',
    'add_device': 'افزودن دستگاه',
    'dashboard_info': 'اطلاعات داشبورد',
    'settings': 'تنظیمات',
    'logout': 'خروج',
    'appearance': 'ظاهر',
    'language': 'زبان',
    'light': 'روشن',
    'dark': 'تاریک',
    'persian': 'فارسی',
    'english': 'انگلیسی',
    'save': 'ذخیره',
    'cancel': 'انصراف',
    'delete': 'حذف',
    'edit': 'ویرایش',
    'add': 'افزودن',
    'theme': 'تم رنگی',
    'app_language': 'زبان برنامه',
    'select_language': 'زبان مورد نظر خود را انتخاب کنید',
  },
  en: {
    'dashboard': 'Dashboard',
    'connections': 'Connections',
    'panels': 'Panels',
    'device_ip': 'Device IP',
    'add_device': 'Add Device',
    'dashboard_info': 'Dashboard Info',
    'settings': 'Settings',
    'logout': 'Logout',
    'appearance': 'Appearance',
    'language': 'Language',
    'light': 'Light',
    'dark': 'Dark',
    'persian': 'Persian',
    'english': 'English',
    'save': 'Save',
    'cancel': 'Cancel',
    'delete': 'Delete',
    'edit': 'Edit',
    'add': 'Add',
    'theme': 'Color Theme',
    'app_language': 'App Language',
    'select_language': 'Select your preferred language',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('fa');

  useEffect(() => {
    const savedLang = localStorage.getItem('app_language') as Language;
    if (savedLang && (savedLang === 'fa' || savedLang === 'en')) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
