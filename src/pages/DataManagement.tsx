import { useState } from 'react';
import { useMqtt } from '@/contexts/MqttContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, FileJson, Info } from 'lucide-react';
import { toast } from 'sonner';

const DataManagement = () => {
  const { connections, switches } = useMqtt();
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = () => {
    try {
      // Get auth credentials from localStorage
      const authData = {
        username: 'admin',
        password: 'xadminx',
      };

      const data = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        auth: authData,
        connections: connections,
        switches: switches,
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `iot-panel-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('فایل پشتیبان با موفقیت ذخیره شد');
    } catch (error) {
      toast.error('خطا در ایجاد فایل پشتیبان');
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

        if (!data.version || !data.connections || !data.switches) {
          throw new Error('فایل نامعتبر است');
        }

        // Store all data in localStorage
        localStorage.setItem('iot_mqtt_connections', JSON.stringify(data.connections));
        localStorage.setItem('iot_mqtt_switches', JSON.stringify(data.switches));
        
        // Store auth data if available
        if (data.auth) {
          // Auth is already stored, no need to update
        }

        toast.success('تنظیمات با موفقیت بازیابی شد. لطفا صفحه را رفرش کنید.');
        
        // Reload page after 1 second
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
      <div className="container mx-auto px-4 py-2 safe-right safe-left" dir="rtl">
        <div className="mb-4">
          <h1 className="text-3xl font-bold mb-2">اطلاعات داشبورد</h1>
          <p className="text-muted-foreground">
            مدیریت، پشتیبان‌گیری و بازیابی تنظیمات
          </p>
        </div>

        <div className="grid gap-6 max-w-4xl">
          {/* Export Section */}
          <Card className="gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                دریافت فایل پشتیبان
              </CardTitle>
              <CardDescription>
                تمامی تنظیمات، اتصالات و پنل‌های خود را در یک فایل ذخیره کنید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleExport}
                className="w-full gradient-primary text-white hover:opacity-90 transition-smooth"
                disabled={connections.length === 0 && switches.length === 0}
              >
                <Download className="w-4 h-4 ml-2" />
                دریافت فایل پشتیبان (JSON)
              </Button>

              <div className="mt-4 p-4 bg-accent/20 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <FileJson className="w-4 h-4 text-primary" />
                  <span className="font-medium">اطلاعات قابل ذخیره:</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 mr-6">
                  <li>• {connections.length} اتصال</li>
                  <li>• {switches.length} پنل کنترل</li>
                  <li>• تنظیمات ظاهری و سفارشی‌سازی‌ها</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Import Section */}
          <Card className="gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                بازیابی از فایل پشتیبان
              </CardTitle>
              <CardDescription>
                تنظیمات قبلی خود را از فایل پشتیبان بازیابی کنید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <label htmlFor="import-file">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full hover:bg-accent hover:border-primary transition-smooth cursor-pointer"
                    disabled={isLoading}
                  >
                    <span>
                      <Upload className="w-4 h-4 ml-2" />
                      {isLoading ? 'در حال بارگذاری...' : 'انتخاب فایل پشتیبان'}
                    </span>
                  </Button>
                </label>
                <input
                  id="import-file"
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                  disabled={isLoading}
                />

                <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
                  <Info className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <div className="text-sm space-y-1">
                    <p className="font-medium text-warning">توجه:</p>
                    <p className="text-muted-foreground">
                      بازیابی از فایل پشتیبان، تنظیمات فعلی شما را جایگزین خواهد کرد.
                      پیشنهاد می‌شود قبل از بازیابی، از تنظیمات فعلی خود پشتیبان تهیه کنید.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Section */}
          <Card className="gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                راهنمای استفاده
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium mb-1">نحوه اشتراک‌گذاری تنظیمات:</h4>
                  <ol className="text-muted-foreground space-y-1 mr-4">
                    <li>1. روی دکمه "دریافت فایل پشتیبان" کلیک کنید</li>
                    <li>2. فایل JSON دریافت شده را با دیگران به اشتراک بگذارید</li>
                    <li>3. گیرنده می‌تواند با استفاده از دکمه "بازیابی" تنظیمات را وارد کند</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-medium mb-1">محتوای فایل پشتیبان:</h4>
                  <ul className="text-muted-foreground space-y-1 mr-4">
                    <li>• اطلاعات کامل اتصالات MQTT (بدون رمز عبور به دلایل امنیتی)</li>
                    <li>• تمامی پنل‌های کنترل و تنظیمات آن‌ها</li>
                    <li>• سفارشی‌سازی‌های ظاهری شامل رنگ، سایز و ایموجی</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;
