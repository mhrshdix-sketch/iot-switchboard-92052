import { useState } from 'react';
import { useMqtt } from '@/contexts/MqttContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, FileJson, Info, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const DataManagement = () => {
  const { connections, switches, buttonPanels, uriLaunchers } = useMqtt();
  const { t, dir } = useLanguage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = () => {
    try {
      const settings = localStorage.getItem('app_settings');
      const theme = localStorage.getItem('iot-panel-theme');
      const language = localStorage.getItem('app_language');
      
      const data = {
        version: '2.0',
        exportDate: new Date().toISOString(),
        connections: connections,
        switches: switches,
        buttonPanels: buttonPanels,
        uriLaunchers: uriLaunchers,
        settings: settings ? JSON.parse(settings) : {},
        theme: theme || 'dark',
        language: language || 'fa',
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

        // Clear all existing settings first (replace mode)
        localStorage.removeItem('iot_mqtt_connections');
        localStorage.removeItem('iot_mqtt_switches');
        localStorage.removeItem('mqtt_button_panels');
        localStorage.removeItem('mqtt_uri_launchers');
        localStorage.removeItem('app_settings');

        // Then set new settings
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
            <h1 className="text-3xl font-bold">{t('dashboard_info')}</h1>
          </div>
          <p className="text-muted-foreground">{t('backup_settings_desc')}</p>
        </div>

        <div className="grid gap-6 max-w-4xl">
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
        </div>
      </div>
    </div>
  );
};

export default DataManagement;
