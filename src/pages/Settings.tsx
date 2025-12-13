import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Settings as SettingsIcon, Moon, Sun, Languages } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTheme } from '@/components/theme-provider';
import { useLanguage } from '@/contexts/LanguageContext';

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t, dir } = useLanguage();

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    toast.success(newTheme === 'dark' ? t('dark_theme') : t('light_theme'));
  };

  const handleLanguageChange = (newLang: 'fa' | 'en') => {
    setLanguage(newLang);
    toast.success(newLang === 'fa' ? 'زبان فارسی انتخاب شد' : 'English language selected');
  };

  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom" dir={dir}>
      <div className="container mx-auto px-4 py-2 safe-right safe-left">
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <BackIcon className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
                <SettingsIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold">{t('settings')}</h1>
            </div>
          </div>
        </div>

        <div className="space-y-6 max-w-2xl">
          <Card className="gradient-card border-border/50">
            <CardHeader>
              <CardTitle>{t('appearance')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">{t('theme')}</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => handleThemeChange('light')} className="h-20 flex-col gap-2">
                    <Sun className="w-6 h-6" />
                    <span>{t('light')}</span>
                  </Button>
                  <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => handleThemeChange('dark')} className="h-20 flex-col gap-2">
                    <Moon className="w-6 h-6" />
                    <span>{t('dark')}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="w-5 h-5" />
                {t('app_language')}
              </CardTitle>
              <CardDescription>{t('select_language')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant={language === 'fa' ? 'default' : 'outline'} onClick={() => handleLanguageChange('fa')} className="h-20 flex-col gap-2">
                  <span className="text-2xl">🇮🇷</span>
                  <span>{t('persian')}</span>
                </Button>
                <Button variant={language === 'en' ? 'default' : 'outline'} onClick={() => handleLanguageChange('en')} className="h-20 flex-col gap-2">
                  <span className="text-2xl">🇺🇸</span>
                  <span>{t('english')}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;