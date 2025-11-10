import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ArrowRight, Settings as SettingsIcon, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTheme } from '@/components/theme-provider';

const REQUIRE_LOGIN_KEY = 'iot_panel_require_login';

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [requireLogin, setRequireLogin] = useState(true);

  useEffect(() => {
    const savedRequireLogin = localStorage.getItem(REQUIRE_LOGIN_KEY);
    if (savedRequireLogin === 'false') {
      setRequireLogin(false);
    }
  }, []);

  const handleRequireLoginChange = (checked: boolean) => {
    setRequireLogin(checked);
    localStorage.setItem(REQUIRE_LOGIN_KEY, checked.toString());
    toast.success(checked ? 'ورود اجباری فعال شد' : 'ورود اجباری غیرفعال شد');
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    toast.success(newTheme === 'dark' ? 'تم تیره فعال شد' : 'تم روشن فعال شد');
  };

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      <div className="container mx-auto px-4 py-8 safe-right safe-left" dir="rtl">
        {/* Header */}
        <div className="mb-6">
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
          {/* Security Settings */}
          <Card className="gradient-card border-border/50">
            <CardHeader>
              <CardTitle>امنیت</CardTitle>
              <CardDescription>
                تنظیمات مربوط به احراز هویت و امنیت
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <Label htmlFor="require-login" className="text-base font-medium">
                    نیاز به ورود
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    هربار که برنامه را باز می‌کنید نیاز به وارد کردن نام کاربری و رمز عبور دارید
                  </p>
                </div>
                <Switch
                  id="require-login"
                  checked={requireLogin}
                  onCheckedChange={handleRequireLoginChange}
                  className="mr-4"
                />
              </div>
            </CardContent>
          </Card>

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
