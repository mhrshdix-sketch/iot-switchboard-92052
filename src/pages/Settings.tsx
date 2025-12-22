import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Settings as SettingsIcon, Moon, Sun, Languages, Trash2, Monitor, Download, Upload, FileJson, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTheme } from '@/components/theme-provider';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMqtt } from '@/contexts/MqttContext';

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t, dir } = useLanguage();
  const { connections, switches, buttonPanels, uriLaunchers } = useMqtt();
  const [isLoading, setIsLoading] = useState(false);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    if (newTheme === 'system') {
      toast.success(t('auto_theme'));
    } else {
      toast.success(newTheme === 'dark' ? t('dark_theme') : t('light_theme'));
    }
  };

  const handleLanguageChange = (newLang: 'fa' | 'en') => {
    setLanguage(newLang);
    toast.success(newLang === 'fa' ? 'زبان فارسی انتخاب شد' : 'English language selected');
  };

  const handleClearAllSettings = () => {
    if (confirm(t('clear_settings_confirm'))) {
      localStorage.removeItem('iot_mqtt_connections');
      localStorage.removeItem('iot_mqtt_switches');
      localStorage.removeItem('mqtt_button_panels');
      localStorage.removeItem('mqtt_uri_launchers');
      localStorage.removeItem('app_settings');
      localStorage.removeItem('iot-panel-theme');
      localStorage.removeItem('app_language');
      
      toast.success(t('settings_cleared'));
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleExport = () => {
    try {
      const settings = localStorage.getItem('app_settings');
      const themeValue = localStorage.getItem('iot-panel-theme');
      const languageValue = localStorage.getItem('app_language');
      
      const data = {
        version: '2.0',
        exportDate: new Date().toISOString(),
        connections: connections,
        switches: switches,
        buttonPanels: buttonPanels,
        uriLaunchers: uriLaunchers,
        settings: settings ? JSON.parse(settings) : {},
        theme: themeValue || 'dark',
        language: languageValue || 'fa',
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `iot-panel-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(t('backup_downloaded'));
    } catch (error) {
      toast.error(t('error'));
      console.error(error);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        if (!data.version) throw new Error(t('invalid_file'));

        localStorage.removeItem('iot_mqtt_connections');
        localStorage.removeItem('iot_mqtt_switches');
        localStorage.removeItem('mqtt_button_panels');
        localStorage.removeItem('mqtt_uri_launchers');
        localStorage.removeItem('app_settings');

        if (data.connections) localStorage.setItem('iot_mqtt_connections', JSON.stringify(data.connections));
        if (data.switches) localStorage.setItem('iot_mqtt_switches', JSON.stringify(data.switches));
        if (data.buttonPanels) localStorage.setItem('mqtt_button_panels', JSON.stringify(data.buttonPanels));
        if (data.uriLaunchers) localStorage.setItem('mqtt_uri_launchers', JSON.stringify(data.uriLaunchers));
        if (data.settings) localStorage.setItem('app_settings', JSON.stringify(data.settings));
        if (data.theme) localStorage.setItem('iot-panel-theme', data.theme);
        if (data.language) localStorage.setItem('app_language', data.language);

        toast.success(t('settings_restored'));
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        toast.error(t('file_read_error'));
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      toast.error(t('file_read_error'));
      setIsLoading(false);
    };

    reader.readAsText(file);
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
                <div className="grid grid-cols-3 gap-3">
                  <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => handleThemeChange('light')} className="h-20 flex-col gap-2">
                    <Sun className="w-6 h-6" />
                    <span>{t('light')}</span>
                  </Button>
                  <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => handleThemeChange('dark')} className="h-20 flex-col gap-2">
                    <Moon className="w-6 h-6" />
                    <span>{t('dark')}</span>
                  </Button>
                  <Button variant={theme === 'system' ? 'default' : 'outline'} onClick={() => handleThemeChange('system')} className="h-20 flex-col gap-2">
                    <Monitor className="w-6 h-6" />
                    <span>{t('auto')}</span>
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

          {/* Backup & Restore Section */}
          <Card className="gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                {t('get_backup_file')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleExport} className="w-full gradient-primary text-white" disabled={connections.length === 0 && switches.length === 0}>
                <Download className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                {t('get_backup_file')} (JSON)
              </Button>
              <div className="mt-4 p-4 bg-accent/20 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <FileJson className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">{t('backup_content_desc')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                {t('restore_settings')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <label htmlFor="import-file">
                <Button asChild variant="outline" className="w-full cursor-pointer" disabled={isLoading}>
                  <span>
                    <Upload className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                    {isLoading ? t('loading') : t('select_backup_file')}
                  </span>
                </Button>
              </label>
              <input id="import-file" type="file" accept=".json" onChange={handleImport} className="hidden" disabled={isLoading} />
              <div className="flex items-start gap-3 p-4 mt-4 bg-warning/10 border border-warning/20 rounded-lg">
                <Info className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">{t('restore_replace_note')}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="w-5 h-5" />
                {t('clear_all_settings')}
              </CardTitle>
              <CardDescription>{t('clear_all_settings_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="destructive" 
                onClick={handleClearAllSettings} 
                className="w-full"
              >
                <Trash2 className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                {t('clear_all_settings')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
