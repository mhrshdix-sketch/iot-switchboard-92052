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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/5 to-primary/5 p-4 safe-top safe-bottom safe-left safe-right relative overflow-hidden" dir={dir}>
      {/* Tech Effect Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated grid */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
                               linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
              animation: 'gridMove 20s linear infinite',
            }}
          />
        </div>
        
        {/* Floating orbs */}
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-secondary/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -top-20 left-1/2 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Circuit lines */}
        <svg className="absolute top-0 left-0 w-full h-1/2 opacity-20" viewBox="0 0 400 200" preserveAspectRatio="none">
          <path 
            d="M0,100 Q100,50 200,100 T400,100" 
            stroke="hsl(var(--primary))" 
            strokeWidth="0.5" 
            fill="none"
            className="animate-pulse"
          />
          <path 
            d="M0,150 Q150,100 300,150 T400,150" 
            stroke="hsl(var(--secondary))" 
            strokeWidth="0.5" 
            fill="none"
            className="animate-pulse"
            style={{ animationDelay: '0.5s' }}
          />
          <circle cx="100" cy="75" r="3" fill="hsl(var(--primary))" className="animate-ping" style={{ animationDuration: '2s' }} />
          <circle cx="250" cy="125" r="3" fill="hsl(var(--secondary))" className="animate-ping" style={{ animationDuration: '2.5s' }} />
          <circle cx="350" cy="100" r="3" fill="hsl(var(--primary))" className="animate-ping" style={{ animationDuration: '3s' }} />
        </svg>
        
        {/* Scanning line effect */}
        <div 
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"
          style={{
            animation: 'scanLine 4s ease-in-out infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        @keyframes scanLine {
          0%, 100% { top: 0; opacity: 0; }
          50% { top: 40%; opacity: 1; }
        }
      `}</style>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-glow mb-4 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse" />
            <img src={atsonLogo} alt="ATSON Logo" className="w-full h-full object-cover relative z-10" />
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
