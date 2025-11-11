import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowRight, Settings as SettingsIcon, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTheme } from '@/components/theme-provider';

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    toast.success(newTheme === 'dark' ? 'تم تیره فعال شد' : 'تم روشن فعال شد');
  };

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      <div className="container mx-auto px-4 py-2 safe-right safe-left" dir="rtl">
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowRight className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
                <SettingsIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold">تنظیمات</h1>
            </div>
          </div>
          <p className="text-muted-foreground mr-14">
            تنظیمات برنامه را شخصی‌سازی کنید
          </p>
        </div>

        <div className="space-y-6 max-w-2xl">
          {/* Appearance Settings */}
          <Card className="gradient-card border-border/50">
            <CardHeader>
              <CardTitle>ظاهر</CardTitle>
              <CardDescription>
                تنظیمات مربوط به ظاهر و تم برنامه
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">تم رنگی</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    onClick={() => handleThemeChange('light')}
                    className="h-20 flex-col gap-2"
                  >
                    <Sun className="w-6 h-6" />
                    <span>روشن</span>
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    onClick={() => handleThemeChange('dark')}
                    className="h-20 flex-col gap-2"
                  >
                    <Moon className="w-6 h-6" />
                    <span>تاریک</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
