import { useMqtt } from '@/contexts/MqttContext';
import { SwitchButton } from '@/components/SwitchButton';
import { ButtonCard } from '@/components/ButtonCard';
import { Button } from '@/components/ui/button';
import { Plus, ToggleLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
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
}

const SortableSwitch = ({ switchPanel }: SortableSwitchProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: switchPanel.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <SwitchButton switchPanel={switchPanel} />
    </div>
  );
};

const Dashboard = () => {
  const { switches, buttonPanels, updateSwitch } = useMqtt();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 150,
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

  const allPanels = [
    ...sortedSwitches.map(s => ({ ...s, type: 'switch' as const })),
    ...buttonPanels.map(b => ({ ...b, type: 'button' as const }))
  ];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedSwitches.findIndex(s => s.id === active.id);
      const newIndex = sortedSwitches.findIndex(s => s.id === over.id);

      const newOrder = arrayMove(sortedSwitches, oldIndex, newIndex);
      
      // Update order for all switches
      newOrder.forEach((sw, index) => {
        updateSwitch(sw.id, { order: index });
      });
    }
  };

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      <div className="container mx-auto px-4 py-2 safe-right safe-left" dir="rtl">

        {allPanels.length === 0 ? (
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
              items={sortedSwitches.map(s => s.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {sortedSwitches.map(switchPanel => (
                  <SortableSwitch key={switchPanel.id} switchPanel={switchPanel} />
                ))}
                {buttonPanels.map(buttonPanel => (
                  <ButtonCard key={buttonPanel.id} buttonPanel={buttonPanel} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
