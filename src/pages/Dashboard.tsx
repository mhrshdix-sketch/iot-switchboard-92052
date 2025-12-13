import { useState } from 'react';
import { useMqtt } from '@/contexts/MqttContext';
import { SwitchButton } from '@/components/SwitchButton';
import { ButtonCard } from '@/components/ButtonCard';
import { Button } from '@/components/ui/button';
import { Plus, ToggleLeft, GripVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableSwitchProps {
  switchPanel: any;
  isDragMode: boolean;
}

const SortableSwitch = ({ switchPanel, isDragMode }: SortableSwitchProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: switchPanel.id, disabled: !isDragMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {isDragMode && (
        <div
          {...attributes}
          {...listeners}
          className="absolute -top-2 -right-2 z-10 p-1.5 rounded-full bg-primary text-primary-foreground cursor-grab active:cursor-grabbing shadow-lg"
        >
          <GripVertical className="w-4 h-4" />
        </div>
      )}
      <SwitchButton switchPanel={switchPanel} />
    </div>
  );
};

interface SortableButtonProps {
  buttonPanel: any;
  isDragMode: boolean;
}

const SortableButton = ({ buttonPanel, isDragMode }: SortableButtonProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: buttonPanel.id, disabled: !isDragMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {isDragMode && (
        <div
          {...attributes}
          {...listeners}
          className="absolute -top-2 -right-2 z-10 p-1.5 rounded-full bg-primary text-primary-foreground cursor-grab active:cursor-grabbing shadow-lg"
        >
          <GripVertical className="w-4 h-4" />
        </div>
      )}
      <ButtonCard buttonPanel={buttonPanel} />
    </div>
  );
};

const Dashboard = () => {
  const { switches, buttonPanels, updateSwitch, updateButtonPanel } = useMqtt();
  const [isDragMode, setIsDragMode] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 0,
        tolerance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 0,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedSwitches = [...switches].sort((a, b) => {
    const orderA = a.order ?? 999;
    const orderB = b.order ?? 999;
    return orderA - orderB;
  });

  const sortedButtons = [...buttonPanels].sort((a, b) => {
    const orderA = a.order ?? 999;
    const orderB = b.order ?? 999;
    return orderA - orderB;
  });

  const allPanelIds = [
    ...sortedSwitches.map(s => s.id),
    ...sortedButtons.map(b => b.id),
  ];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Check if it's a switch
      const switchOldIndex = sortedSwitches.findIndex(s => s.id === active.id);
      const switchNewIndex = sortedSwitches.findIndex(s => s.id === over.id);

      if (switchOldIndex !== -1 && switchNewIndex !== -1) {
        const newOrder = arrayMove(sortedSwitches, switchOldIndex, switchNewIndex);
        newOrder.forEach((sw, index) => {
          updateSwitch(sw.id, { order: index });
        });
        return;
      }

      // Check if it's a button
      const buttonOldIndex = sortedButtons.findIndex(b => b.id === active.id);
      const buttonNewIndex = sortedButtons.findIndex(b => b.id === over.id);

      if (buttonOldIndex !== -1 && buttonNewIndex !== -1) {
        const newOrder = arrayMove(sortedButtons, buttonOldIndex, buttonNewIndex);
        newOrder.forEach((btn, index) => {
          updateButtonPanel(btn.id, { order: index });
        });
      }
    }
  };

  const handleLongPressStart = () => {
    const timer = setTimeout(() => {
      setIsDragMode(true);
    }, 3000);
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const exitDragMode = () => {
    setIsDragMode(false);
  };

  return (
    <div 
      className="min-h-screen bg-background safe-top safe-bottom"
      onPointerDown={handleLongPressStart}
      onPointerUp={handleLongPressEnd}
      onPointerLeave={handleLongPressEnd}
    >
      <div className="container mx-auto px-4 py-2 safe-right safe-left" dir="rtl">
        {isDragMode && (
          <div className="mb-4 p-3 bg-primary/10 border border-primary/30 rounded-lg flex items-center justify-between">
            <span className="text-sm font-medium text-primary">
              حالت چیدمان فعال - پنل‌ها را جابجا کنید
            </span>
            <Button size="sm" variant="outline" onClick={exitDragMode}>
              تأیید
            </Button>
          </div>
        )}

        {sortedSwitches.length === 0 && sortedButtons.length === 0 ? (
          <Card className="gradient-card border-border/50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-2xl gradient-secondary flex items-center justify-center mb-4 shadow-glow">
                <ToggleLeft className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">هیچ پنلی وجود ندارد</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                پنل‌های سوییچ برای کنترل دستگاه‌های خود ایجاد کنید و از هر جا به آن‌ها دسترسی داشته باشید
              </p>
              <Link to="/switches">
                <Button className="gradient-primary text-white hover:opacity-90 shadow-glow">
                  <Plus className="w-4 h-4 ml-2" />
                  ایجاد اولین پنل
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={allPanelIds}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {sortedSwitches.map(switchPanel => (
                  <SortableSwitch key={switchPanel.id} switchPanel={switchPanel} isDragMode={isDragMode} />
                ))}
                {sortedButtons.map(buttonPanel => (
                  <SortableButton key={buttonPanel.id} buttonPanel={buttonPanel} isDragMode={isDragMode} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {!isDragMode && (sortedSwitches.length > 0 || sortedButtons.length > 0) && (
          <p className="text-center text-xs text-muted-foreground mt-6">
            برای تغییر چیدمان، ۳ ثانیه انگشت خود را روی صفحه نگه دارید
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
