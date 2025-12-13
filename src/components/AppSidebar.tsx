import { Home, Wifi, ToggleLeft, Download, Settings, LogOut, Cpu, Link2, FilePlus2 } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const items = [
  { title: 'داشبورد', url: '/', icon: Home },
  { title: 'اتصالات', url: '/connections', icon: Wifi },
  { title: 'پنل‌ها', url: '/switches', icon: ToggleLeft },
  { title: 'IP دستگاه', url: '/uri-launcher', icon: Link2 },
  { title: 'افزودن دستگاه', url: '/add-device', icon: FilePlus2 },
  { title: 'اطلاعات داشبورد', url: '/data-management', icon: Download },
  { title: 'تنظیمات', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const { logout } = useAuth();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  const handleLogout = () => {
    logout();
    toast.success('خروج موفقیت‌آمیز');
  };

  return (
    <Sidebar className="border-l border-border" side="right">
      <SidebarHeader className="border-b border-border p-4 safe-top safe-right">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-hero flex items-center justify-center shadow-glow flex-shrink-0">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold truncate">پنل مدیریت IoT</h2>
            <p className="text-xs text-muted-foreground">MQTT Panel</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>منوی اصلی</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/'}
                      className="hover:bg-accent/50 transition-smooth"
                      activeClassName="bg-primary text-primary-foreground font-medium shadow-sm"
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="mr-3">{item.title}</span>
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
            <LogOut className="w-4 h-4 ml-2" />
            خروج
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
