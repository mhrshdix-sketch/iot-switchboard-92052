import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FilePlus2, Info, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const AddDevice = () => {
  const navigate = useNavigate();
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
          throw new Error('فایل نامعتبر است');
        }

        // Merge connections
        if (data.connections && Array.isArray(data.connections)) {
          const existingConnections = JSON.parse(localStorage.getItem('iot_mqtt_connections') || '[]');
          const newConnections = data.connections.map((conn: any) => ({
            ...conn,
            id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          }));
          localStorage.setItem('iot_mqtt_connections', JSON.stringify([...existingConnections, ...newConnections]));
        }

        // Merge switches
        if (data.switches && Array.isArray(data.switches)) {
          const existingSwitches = JSON.parse(localStorage.getItem('iot_mqtt_switches') || '[]');
          const newSwitches = data.switches.map((sw: any) => ({
            ...sw,
            id: `switch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          }));
          localStorage.setItem('iot_mqtt_switches', JSON.stringify([...existingSwitches, ...newSwitches]));
        }

        // Merge button panels
        if (data.buttonPanels && Array.isArray(data.buttonPanels)) {
          const existingButtons = JSON.parse(localStorage.getItem('mqtt_button_panels') || '[]');
          const newButtons = data.buttonPanels.map((btn: any) => ({
            ...btn,
            id: `button_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          }));
          localStorage.setItem('mqtt_button_panels', JSON.stringify([...existingButtons, ...newButtons]));
        }

        // Merge URI launchers
        if (data.uriLaunchers && Array.isArray(data.uriLaunchers)) {
          const existingUris = JSON.parse(localStorage.getItem('mqtt_uri_launchers') || '[]');
          const newUris = data.uriLaunchers.map((uri: any) => ({
            ...uri,
            id: `uri_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          }));
          localStorage.setItem('mqtt_uri_launchers', JSON.stringify([...existingUris, ...newUris]));
        }

        toast.success('دستگاه‌ها با موفقیت اضافه شدند. لطفا صفحه را رفرش کنید.');
        
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        toast.error('خطا در خواندن فایل. لطفا از معتبر بودن فایل اطمینان حاصل کنید.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      toast.error('خطا در خواندن فایل');
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      <div className="container mx-auto px-4 py-4 safe-right safe-left" dir="rtl">
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowRight className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
                <FilePlus2 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold">افزودن دستگاه</h1>
            </div>
          </div>
          <p className="text-muted-foreground mr-14">
            افزودن دستگاه‌های جدید از فایل پشتیبان
          </p>
        </div>

        <div className="grid gap-6 max-w-4xl">
          <Card className="gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                افزودن از فایل پشتیبان
              </CardTitle>
              <CardDescription>
                دستگاه‌های جدید را از فایل پشتیبان به تنظیمات فعلی اضافه کنید (بدون جایگزینی)
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
                      <Upload className="w-4 h-4 ml-2" />
                      {isLoading ? 'در حال بارگذاری...' : 'انتخاب فایل پشتیبان'}
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

                <div className="flex items-start gap-3 p-4 bg-accent/20 border border-accent/30 rounded-lg">
                  <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm space-y-1">
                    <p className="font-medium text-primary">توجه:</p>
                    <p className="text-muted-foreground">
                      این عملیات تنظیمات جدید را به تنظیمات فعلی شما <strong>اضافه</strong> می‌کند و آن‌ها را جایگزین نمی‌کند.
                      برای جایگزینی کامل از بخش "اطلاعات داشبورد" استفاده کنید.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddDevice;
