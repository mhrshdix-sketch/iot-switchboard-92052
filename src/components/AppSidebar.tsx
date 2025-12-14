import { Home, Wifi, ToggleLeft, Download, Settings, LogOut, Link2, FilePlus2 } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import iotexLogo from '@/assets/iotex-logo.png';

export function AppSidebar() {
  const location = useLocation();
  const { logout } = useAuth();
  const { t, dir } = useLanguage();
  const currentPath = location.pathname;

  const items = [
    { title: t('dashboard'), url: '/', icon: Home },
    { title: t('connections'), url: '/connections', icon: Wifi },
    { title: t('panels'), url: '/switches', icon: ToggleLeft },
    { title: t('device_ip'), url: '/uri-launcher', icon: Link2 },
    { title: t('add_device'), url: '/add-device', icon: FilePlus2 },
    { title: t('dashboard_info'), url: '/data-management', icon: Download },
    { title: t('settings'), url: '/settings', icon: Settings },
  ];

  const isActive = (path: string) => currentPath === path;

  const handleLogout = () => {
    logout();
    toast.success(t('logout_success'));
  };

  return (
    <Sidebar className="border-l border-border" side="right" dir={dir}>
      <SidebarHeader className="border-b border-border p-4 safe-top safe-right">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden shadow-glow flex-shrink-0">
            <img src={iotexLogo} alt="IOTEX Logo" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold truncate">{t('iot_management_panel')}</h2>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('main_menu')}</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/'}
                      className="hover:bg-accent/50 transition-smooth"
                      activeClassName="bg-primary text-primary-foreground font-medium shadow-sm"
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className={dir === 'rtl' ? 'mr-3' : 'ml-3'}>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-3 safe-bottom safe-right">
        <div className="flex gap-2">
          <ThemeToggle />
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex-1 hover:bg-destructive hover:text-destructive-foreground transition-smooth"
          >
            <LogOut className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
            {t('logout')}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}