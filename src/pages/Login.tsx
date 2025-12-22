import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, User } from 'lucide-react';
import { toast } from 'sonner';
import atsonLogo from '@/assets/atson-logo.png';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { language, t, dir } = useLanguage();

  useEffect(() => {
    const savedUsername = localStorage.getItem('saved_username');
    const savedPassword = localStorage.getItem('saved_password');
    if (savedUsername && savedPassword) {
      setUsername(savedUsername);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const success = login(username, password);
      setIsLoading(false);

      if (success) {
        if (rememberMe) {
          localStorage.setItem('saved_username', username);
          localStorage.setItem('saved_password', password);
        } else {
          localStorage.removeItem('saved_username');
          localStorage.removeItem('saved_password');
        }
        toast.success(language === 'fa' ? 'ورود موفقیت‌آمیز' : 'Login successful');
        navigate('/');
      } else {
        toast.error(language === 'fa' ? 'نام کاربری یا رمز عبور اشتباه است' : 'Invalid username or password');
        setPassword('');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/5 to-primary/5 p-4 safe-top safe-bottom safe-left safe-right" dir={dir}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-glow mb-4 animate-pulse overflow-hidden">
            <img src={atsonLogo} alt="ATSON Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {language === 'fa' ? 'پنل مدیریت آتسون' : 'ATSON Management Panel'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'fa' ? 'سامانه مدیریت و کنترل دستگاه‌های هوشمند' : 'Smart Device Management System'}
          </p>
        </div>

        <Card className="gradient-card shadow-2xl border-border/50">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">
              {language === 'fa' ? 'ورود به سیستم' : 'Sign In'}
            </CardTitle>
            <CardDescription>
              {language === 'fa' ? 'برای دسترسی به پنل مدیریت، وارد شوید' : 'Sign in to access the management panel'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" dir={dir}>
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {language === 'fa' ? 'نام کاربری' : 'Username'}
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="transition-smooth"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  {language === 'fa' ? 'رمز عبور' : 'Password'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="transition-smooth"
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-border cursor-pointer"
                  disabled={isLoading}
                />
                <Label htmlFor="remember" className="cursor-pointer text-sm">
                  {language === 'fa' ? 'من را به خاطر بسپار' : 'Remember me'}
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full gradient-primary text-white hover:opacity-90 transition-smooth shadow-glow"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {language === 'fa' ? 'در حال ورود...' : 'Signing in...'}
                  </div>
                ) : (
                  language === 'fa' ? 'ورود' : 'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-muted-foreground text-sm mt-6">
          {language === 'fa' ? 'طراحی شده توسط | آتسون' : 'Designed by | ATSON'}
        </p>
      </div>
    </div>
  );
};

export default Login;
