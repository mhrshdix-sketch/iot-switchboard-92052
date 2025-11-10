import { useState, useEffect } from 'react';
import { SwitchPanel } from '@/types/mqtt';
import { useMqtt } from '@/contexts/MqttContext';
import { cn } from '@/lib/utils';
import { Power, MoreVertical } from 'lucide-react';
import { SwitchPanelSettings } from './SwitchPanelSettings';

interface SwitchButtonProps {
  switchPanel: SwitchPanel;
}

export const SwitchButton = ({ switchPanel }: SwitchButtonProps) => {
  const { toggleSwitch, updateSwitch, connections } = useMqtt();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [blinkCount, setBlinkCount] = useState(0);
  
  const connection = connections.find(c => c.id === switchPanel.connectionId);
  const isConnected = connection?.status === 'connected';
  const isActive = switchPanel.state && isConnected;

  // Blink animation - only 5 times when turned on
  useEffect(() => {
    if (isActive) {
      setBlinkCount(0);
      const interval = setInterval(() => {
        setBlinkCount((prev) => {
          if (prev >= 5) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 500);
      return () => clearInterval(interval);
    } else {
      setBlinkCount(0);
    }
  }, [isActive]);

  const handleClick = () => {
    if (isConnected) {
      toggleSwitch(switchPanel.id);
    }
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSettingsOpen(true);
  };

  const handleUpdateSettings = (updates: Partial<SwitchPanel>) => {
    updateSwitch(switchPanel.id, updates);
  };

  const size = switchPanel.size || 'md';
  const sizeClasses = {
    xxs: 'min-h-[80px] p-2',
    xs: 'min-h-[100px] p-3',
    sm: 'min-h-[120px] p-4',
    md: 'min-h-[160px] p-6',
    lg: 'min-h-[200px] p-8',
    xl: 'min-h-[240px] p-10',
  };

  const iconSizes = {
    xxs: 'text-2xl',
    xs: 'text-3xl',
    sm: 'text-4xl',
    md: 'text-5xl',
    lg: 'text-6xl',
    xl: 'text-7xl',
  };

  const colorOn = switchPanel.colorOn || '#22c55e';

  return (
    <>
      <button
        onClick={handleClick}
        disabled={!isConnected}
        className={cn(
          'relative group overflow-hidden rounded-2xl',
          'transition-all duration-500 ease-out',
          'border-2 shadow-lg',
          'flex flex-col items-center justify-center gap-3',
          'w-full',
          sizeClasses[size],
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'hover:scale-105',
          !isConnected && 'grayscale'
        )}
        style={{
          backgroundColor: isActive ? `${colorOn}15` : 'hsl(var(--card))',
          borderColor: isActive ? colorOn : 'hsl(var(--border))',
          boxShadow: isActive ? `0 0 24px ${colorOn}40` : undefined,
        }}
        dir="rtl"
      >
        {/* Settings Button */}
        <button
          onClick={handleSettingsClick}
          className="absolute top-2 right-2 p-1.5 rounded-lg hover:bg-background/50 transition-colors z-20 opacity-0 group-hover:opacity-100"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {/* Background Glow Effect */}
        <div 
          className={cn(
            'absolute inset-0 transition-opacity duration-500',
            'bg-gradient-to-br',
            isActive 
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-100'
          )}
          style={{
            background: isActive 
              ? `linear-gradient(135deg, ${colorOn}20 0%, ${colorOn}05 100%)`
              : 'linear-gradient(135deg, hsl(var(--primary) / 0.1) 0%, hsl(var(--accent) / 0.05) 100%)',
          }}
        />

        {/* Icon */}
        <div 
          className={cn(
            'relative z-10 transition-transform duration-500',
            iconSizes[size],
            'group-hover:scale-110',
            isActive && blinkCount < 5 && 'animate-pulse'
          )}
        >
          {switchPanel.icon || <Power className="w-16 h-16" />}
        </div>

        {/* Name */}
        <div className="relative z-10 text-center">
          <h3 
            className={cn(
              'font-bold transition-colors duration-300',
              size === 'sm' ? 'text-sm' : size === 'xl' ? 'text-2xl' : 'text-lg'
            )}
            style={{
              color: isActive ? colorOn : 'hsl(var(--foreground))',
            }}
          >
            {switchPanel.name}
          </h3>
          {!isConnected && (
            <p className="text-xs text-muted-foreground mt-1">
              اتصال قطع است
            </p>
          )}
        </div>

        {/* Status Indicator */}
        <div 
          className={cn(
            'absolute top-4 left-4 w-3 h-3 rounded-full transition-all duration-300',
            isActive ? '' : 'bg-muted-foreground/50'
          )}
          style={{
            backgroundColor: isActive ? colorOn : undefined,
            boxShadow: isActive ? `0 0 10px ${colorOn}` : undefined,
          }}
        />
      </button>

      <SwitchPanelSettings
        switchPanel={switchPanel}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onUpdate={handleUpdateSettings}
      />
    </>
  );
};
