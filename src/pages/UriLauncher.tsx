import { useState } from 'react';
import { useMqtt } from '@/contexts/MqttContext';
import { useLanguage } from '@/contexts/LanguageContext';
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
import { Link2, Plus, Edit2, Trash2, ExternalLink, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const UriLauncher = () => {
  const navigate = useNavigate();
  const { connections, uriLaunchers, addUriLauncher, updateUriLauncher, deleteUriLauncher } = useMqtt();
  const { t, dir } = useLanguage();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPanel, setEditingPanel] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    connectionId: '',
    topic: '',
    qos: 0 as 0 | 1 | 2,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      connectionId: '',
      topic: '',
      qos: 0,
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
      qos: panel.qos,
    });
    setEditingPanel(panel.id);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.connectionId || !formData.topic) {
      toast.error(t('fill_all_fields'));
      return;
    }

    if (editingPanel) {
      updateUriLauncher(editingPanel, formData);
      toast.success(t('panel_edited_success'));
    } else {
      addUriLauncher(formData);
      toast.success(t('panel_added_success'));
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm(t('are_you_sure'))) {
      deleteUriLauncher(id);
      toast.success(t('panel_deleted'));
    }
  };

  const handleLaunch = (uri: string | undefined) => {
    if (uri) {
      // Make sure the URI has a protocol
      let launchUrl = uri;
      if (!uri.startsWith('http://') && !uri.startsWith('https://')) {
        launchUrl = `http://${uri}`;
      }
      window.open(launchUrl, '_blank');
      toast.success(t('uri_opened'));
    } else {
      toast.error(t('uri_not_received'));
    }
  };

  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom" dir={dir}>
      <div className="container mx-auto px-4 py-4 safe-right safe-left">
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <BackIcon className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
                <Link2 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold">{t('device_ip')}</h1>
            </div>
          </div>
          <p className={`text-muted-foreground ${dir === 'rtl' ? 'mr-14' : 'ml-14'}`}>
            {t('uri_launcher_management')}
          </p>
        </div>

        <Button onClick={handleAdd} className="mb-4 gradient-primary text-white">
          <Plus className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
          {t('add_panel')}
        </Button>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {uriLaunchers.map((panel) => (
            <Card key={panel.id} className="p-4 gradient-card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold">{panel.name}</h3>
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
              <div className="text-sm text-muted-foreground space-y-1 mb-3">
                <p>Topic: {panel.topic}</p>
                <p>QoS: {panel.qos}</p>
                {panel.uri && (
                  <p className="text-primary font-bold text-lg truncate">
                    URI: {panel.uri}
                  </p>
                )}
              </div>
              <Button
                onClick={() => handleLaunch(panel.uri)}
                className="w-full gradient-primary text-white"
                size="sm"
                disabled={!panel.uri}
              >
                <ExternalLink className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                {panel.uri || t('awaiting_receipt')}
              </Button>
            </Card>
          ))}
        </div>

        {uriLaunchers.length > 0 && (
          <div className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <p className="text-sm text-muted-foreground">{t('device_web_access_note')}</p>
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md" dir={dir}>
            <DialogHeader>
              <DialogTitle>{editingPanel ? t('edit_panel') : t('add_new_panel')}</DialogTitle>
              <DialogDescription>
                {t('enter_uri_launcher_info')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t('connection')}</Label>
                <Select
                  value={formData.connectionId}
                  onValueChange={(value) => setFormData({ ...formData, connectionId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('select_connection_placeholder')} />
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
                <Label>{t('panel_name')}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('panel_name')}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('topic')}</Label>
                <Input
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="home/device/uri"
                />
              </div>

              <div className="space-y-2">
                <Label>{t('qos_level')}</Label>
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
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t('cancel')}
              </Button>
              <Button onClick={handleSave} className="gradient-primary text-white">
                {t('save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default UriLauncher;