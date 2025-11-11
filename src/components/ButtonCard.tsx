import { ButtonPanel } from '@/types/mqtt';
import { useMqtt } from '@/contexts/MqttContext';
import { cn } from '@/lib/utils';

interface ButtonCardProps {
  buttonPanel: ButtonPanel;
}

export const ButtonCard = ({ buttonPanel }: ButtonCardProps) => {
  const { triggerButton, connections } = useMqtt();
  
  const connection = connections.find(c => c.id === buttonPanel.connectionId);
  const isConnected = connection?.status === 'connected';

  const handleClick = () => {
    if (isConnected) {
      triggerButton(buttonPanel.id);
    }
  };

  const size = buttonPanel.size || 'md';
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

  const colorOn = buttonPanel.colorOn || '#3b82f6';

  return (
    <button
      onPointerDown={handleClick}
      disabled={!isConnected}
      className={cn(
        'relative group overflow-hidden rounded-2xl',
        'transition-all duration-300',
        'border-2 shadow-lg',
        'flex flex-col items-center justify-center gap-3',
        'w-full',
        sizeClasses[size],
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'hover:scale-105 active:scale-95',
        !isConnected && 'grayscale'
      )}
      style={{
        backgroundColor: 'hsl(var(--card))',
        borderColor: colorOn,
      }}
      dir="rtl"
    >
      <div className={cn('relative z-10', iconSizes[size])}>
        {buttonPanel.icon || '🔘'}
      </div>
      <h3 
        className={cn(
          'font-bold relative z-10',
          size === 'xxs' || size === 'xs' ? 'text-sm' : size === 'xl' ? 'text-2xl' : 'text-lg'
        )}
        style={{ color: colorOn }}
      >
        {buttonPanel.name}
      </h3>
      {!isConnected && (
        <p className="text-xs text-muted-foreground mt-1">
          اتصال قطع است
        </p>
      )}
    </button>
  );
};
