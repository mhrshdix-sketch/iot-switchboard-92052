import { useState } from 'react';
import { useMqtt } from '@/contexts/MqttContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MousePointerClick, Plus, Edit2, Trash2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const ButtonPanels = () => {
  const navigate = useNavigate();
  const { connections, buttonPanels, addButtonPanel, updateButtonPanel, deleteButtonPanel } = useMqtt();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPanel, setEditingPanel] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    connectionId: '',
    topic: '',
    payload: '',
    qos: 0 as 0 | 1 | 2,
    retain: false,
    icon: '🔘',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      connectionId: '',
      topic: '',
      payload: '',
      qos: 0,
      retain: false,
      icon: '🔘',
    });
    setEditingPanel(null);
  };

  const handleAdd = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleEdit = (panel: any) => {
    setFormData({
      name: panel.name,
      connectionId: panel.connectionId,
      topic: panel.topic,
      payload: panel.payload,
      qos: panel.qos,
      retain: panel.retain || false,
      icon: panel.icon || '🔘',
    });
    setEditingPanel(panel.id);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.connectionId || !formData.topic || !formData.payload) {
      toast.error('لطفاً همه فیلدها را پر کنید');
      return;
    }

    if (editingPanel) {
      updateButtonPanel(editingPanel, formData);
      toast.success('دکمه با موفقیت ویرایش شد');
    } else {
      addButtonPanel(formData);
      toast.success('دکمه با موفقیت اضافه شد');
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('آیا مطمئن هستید؟')) {
      deleteButtonPanel(id);
      toast.success('دکمه حذف شد');
    }
  };

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      <div className="container mx-auto px-4 py-4 safe-right safe-left" dir="rtl">
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowRight className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
                <MousePointerClick className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold">Button Panel</h1>
            </div>
          </div>
          <p className="text-muted-foreground mr-14">
            مدیریت دکمه‌های MQTT
          </p>
        </div>

        <Button onClick={handleAdd} className="mb-4 gradient-primary text-white">
          <Plus className="w-4 h-4 ml-2" />
          افزودن دکمه
        </Button>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {buttonPanels.map((panel) => (
            <Card key={panel.id} className="p-4 gradient-card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{panel.icon || '🔘'}</span>
                  <h3 className="font-bold">{panel.name}</h3>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(panel)}
                    className="h-8 w-8"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(panel.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Topic: {panel.topic}</p>
                <p>Payload: {panel.payload}</p>
                <p>QoS: {panel.qos}</p>
                {panel.retain && <p className="text-primary">Retain فعال</p>}
              </div>
            </Card>
          ))}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>{editingPanel ? 'ویرایش دکمه' : 'افزودن دکمه جدید'}</DialogTitle>
              <DialogDescription>
                اطلاعات دکمه MQTT را وارد کنید
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>اتصال</Label>
                <Select
                  value={formData.connectionId}
                  onValueChange={(value) => setFormData({ ...formData, connectionId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب اتصال" />
                  </SelectTrigger>
                  <SelectContent>
                    {connections.map((conn) => (
                      <SelectItem key={conn.id} value={conn.id}>
                        {conn.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Panel name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="نام دکمه"
                />
              </div>

              <div className="space-y-2">
                <Label>آیکون Emoji</Label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="🔘"
                  className="text-2xl text-center h-12"
                />
              </div>

              <div className="space-y-2">
                <Label>Topic</Label>
                <Input
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="home/device/command"
                />
              </div>

              <div className="space-y-2">
                <Label>Payload</Label>
                <Input
                  value={formData.payload}
                  onChange={(e) => setFormData({ ...formData, payload: e.target.value })}
                  placeholder="1"
                />
              </div>

              <div className="space-y-2">
                <Label>QoS Level</Label>
                <Select
                  value={formData.qos.toString()}
                  onValueChange={(value) => setFormData({ ...formData, qos: parseInt(value) as 0 | 1 | 2 })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">QoS 0</SelectItem>
                    <SelectItem value="1">QoS 1</SelectItem>
                    <SelectItem value="2">QoS 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="retain"
                  type="checkbox"
                  checked={formData.retain}
                  onChange={(e) => setFormData({ ...formData, retain: e.target.checked })}
                  className="w-4 h-4 rounded border-border cursor-pointer"
                />
                <Label htmlFor="retain" className="cursor-pointer">
                  Retain
                </Label>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                انصراف
              </Button>
              <Button onClick={handleSave} className="gradient-primary text-white">
                ذخیره
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ButtonPanels;
