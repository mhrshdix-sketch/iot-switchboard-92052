import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Upload, FilePlus2, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const AddDevice = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const handleMergeImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        if (!data.version) {
          throw new Error(t('invalid_file'));
        }

        // Create connection ID mapping (old ID -> new ID)
        const connectionIdMap: Record<string, string> = {};

        // Merge connections
        if (data.connections && Array.isArray(data.connections)) {
          const existingConnections = JSON.parse(localStorage.getItem('iot_mqtt_connections') || '[]');
          const newConnections = data.connections.map((conn: any) => {
            const newId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            connectionIdMap[conn.id] = newId;
            return {
              ...conn,
              id: newId,
            };
          });
          localStorage.setItem('iot_mqtt_connections', JSON.stringify([...existingConnections, ...newConnections]));
        }

        // Merge switches with mapped connectionId
        if (data.switches && Array.isArray(data.switches)) {
          const existingSwitches = JSON.parse(localStorage.getItem('iot_mqtt_switches') || '[]');
          const newSwitches = data.switches.map((sw: any) => ({
            ...sw,
            id: `switch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            connectionId: connectionIdMap[sw.connectionId] || sw.connectionId,
          }));
          localStorage.setItem('iot_mqtt_switches', JSON.stringify([...existingSwitches, ...newSwitches]));
        }

        // Merge button panels with mapped connectionId
        if (data.buttonPanels && Array.isArray(data.buttonPanels)) {
          const existingButtons = JSON.parse(localStorage.getItem('mqtt_button_panels') || '[]');
          const newButtons = data.buttonPanels.map((btn: any) => ({
            ...btn,
            id: `button_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            connectionId: connectionIdMap[btn.connectionId] || btn.connectionId,
          }));
          localStorage.setItem('mqtt_button_panels', JSON.stringify([...existingButtons, ...newButtons]));
        }

        // Merge URI launchers with mapped connectionId
        if (data.uriLaunchers && Array.isArray(data.uriLaunchers)) {
          const existingUris = JSON.parse(localStorage.getItem('mqtt_uri_launchers') || '[]');
          const newUris = data.uriLaunchers.map((uri: any) => ({
            ...uri,
            id: `uri_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            connectionId: connectionIdMap[uri.connectionId] || uri.connectionId,
          }));
          localStorage.setItem('mqtt_uri_launchers', JSON.stringify([...existingUris, ...newUris]));
        }

        toast.success(t('devices_added_success'));
        
        setTimeout(() => {
          window.location.reload();
        }, 1000);
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
      <div className="container mx-auto px-4 py-4 safe-right safe-left">
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <BackIcon className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
                <FilePlus2 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold">{t('add_device')}</h1>
            </div>
          </div>
          <p className={`text-muted-foreground ${dir === 'rtl' ? 'mr-14' : 'ml-14'}`}>
            {t('add_new_devices')}
          </p>
        </div>

        <div className="grid gap-6 max-w-4xl">
          <Card className="gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                {t('add_from_backup')}
              </CardTitle>
              <CardDescription>
                {t('add_from_backup_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <label htmlFor="merge-import-file">
                  <Button
                    asChild
                    className="w-full gradient-primary text-white cursor-pointer"
                    disabled={isLoading}
                  >
                    <span>
                      <Upload className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                      {isLoading ? t('loading') : t('select_backup_file')}
                    </span>
                  </Button>
                </label>
                <input
                  id="merge-import-file"
                  type="file"
                  accept=".json"
                  onChange={handleMergeImport}
                  className="hidden"
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddDevice;