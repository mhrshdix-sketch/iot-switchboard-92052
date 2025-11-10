import { Home, Wifi, ToggleLeft } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

export const Navigation = () => {
  const navItems = [
    { to: '/', icon: Home, label: 'داشبورد' },
    { to: '/connections', icon: Wifi, label: 'اتصالات' },
    { to: '/switches', icon: ToggleLeft, label: 'پنل‌ها' },
  ];

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg gradient-hero flex items-center justify-center shadow-glow">
              <Wifi className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">پنل مدیریت IoT</h1>
              <p className="text-xs text-muted-foreground">MQTT Panel</p>
            </div>
          </div>

          <div className="flex gap-1 items-center" dir="rtl">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-smooth',
                    'hover:bg-accent hover:text-accent-foreground'
                  )}
                  activeClassName="bg-primary text-primary-foreground shadow-glow"
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              );
            })}
            <div className="mr-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
