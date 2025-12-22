import { Home, Wifi, ToggleLeft, Settings, LogOut, Link2, FilePlus2, Globe, ChevronDown, Cpu } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMqtt } from '@/contexts/MqttContext';
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import atsonLogo from '@/assets/atson-logo.png';
import { useState } from 'react';

export function AppSidebar() {
  const location = useLocation();
  const { logout } = useAuth();
  const { t, dir } = useLanguage();
  const { uriLaunchers } = useMqtt();
  const currentPath = location.pathname;
  const [deviceSettingsOpen, setDeviceSettingsOpen] = useState(false);

  const mainItems = [
    { title: t('dashboard'), url: '/', icon: Home },
  ];

  // Device settings submenu items
  const deviceSettingsItems = [
    { title: t('connections'), url: '/connections', icon: Wifi },
    { title: t('panels'), url: '/switches', icon: ToggleLeft },
    { title: t('device_ip'), url: '/uri-launcher', icon: Link2 },
  ];

  const otherItems = [
    { title: t('add_device'), url: '/add-device', icon: FilePlus2 },
  ];

  const isActive = (path: string) => currentPath === path;
  const isDeviceSettingsActive = deviceSettingsItems.some(item => isActive(item.url));

  const handleLogout = () => {
    logout();
    toast.success(t('logout_success'));
  };

  return (
    <Sidebar className="border-l border-border" side="right" dir={dir}>
      <SidebarHeader className="border-b border-border p-4 safe-top safe-right">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden shadow-glow flex-shrink-0">
            <img src={atsonLogo} alt="ATSON Logo" className="w-full h-full object-cover" />
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
              {/* Dashboard first */}
              {mainItems.map((item) => (
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
              
              {/* Dynamic URI launchers - open in new tab */}
              {uriLaunchers.map((launcher) => {
                const uri = launcher.uri || '';
                const fullUri = uri.startsWith('http') ? uri : `http://${uri}`;
                return (
                  <SidebarMenuItem key={launcher.id}>
                    <SidebarMenuButton asChild>
                      <a
                        href={fullUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center w-full px-3 py-2 rounded-md hover:bg-accent/50 transition-smooth"
                      >
                        <Globe className="h-5 w-5 flex-shrink-0" />
                        <span className={dir === 'rtl' ? 'mr-3' : 'ml-3'}>{launcher.name}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* Settings with Device Settings nested inside */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/settings"
                    className="hover:bg-accent/50 transition-smooth"
                    activeClassName="bg-primary text-primary-foreground font-medium shadow-sm"
                  >
                    <Settings className="h-5 w-5 flex-shrink-0" />
                    <span className={dir === 'rtl' ? 'mr-3' : 'ml-3'}>{t('settings')}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Device Settings Collapsible - under Settings */}
              <SidebarMenuItem>
                <Collapsible open={deviceSettingsOpen} onOpenChange={setDeviceSettingsOpen}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className={`w-full hover:bg-accent/50 transition-smooth ${dir === 'rtl' ? 'pr-6' : 'pl-6'} ${isDeviceSettingsActive ? 'bg-accent/30' : ''}`}>
                      <Cpu className="h-4 w-4 flex-shrink-0" />
                      <span className={dir === 'rtl' ? 'mr-2' : 'ml-2'}>{t('device_settings')}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${dir === 'rtl' ? 'mr-auto' : 'ml-auto'} ${deviceSettingsOpen ? 'rotate-180' : ''}`} />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className={`${dir === 'rtl' ? 'pr-8' : 'pl-8'} space-y-1 mt-1`}>
                    {deviceSettingsItems.map((item) => (
                      <SidebarMenuButton key={item.url} asChild>
                        <NavLink
                          to={item.url}
                          className="hover:bg-accent/50 transition-smooth"
                          activeClassName="bg-primary text-primary-foreground font-medium shadow-sm"
                        >
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          <span className={dir === 'rtl' ? 'mr-2' : 'ml-2'}>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
              
              {/* Other items */}
              {otherItems.map((item) => (
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
