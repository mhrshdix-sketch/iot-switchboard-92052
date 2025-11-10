import { useState } from 'react';
import { SwitchPanel } from '@/types/mqtt';
import { useMqtt } from '@/contexts/MqttContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QoSLevel } from '@/types/mqtt';

interface SwitchCardProps {
  switchPanel: SwitchPanel;
}

export const SwitchCard = ({ switchPanel }: SwitchCardProps) => {
  const { deleteSwitch, connections, updateSwitch } = useMqtt();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    connectionId: switchPanel.connectionId,
    name: switchPanel.name,
    topic: switchPanel.topic,
    payloadOn: switchPanel.payloadOn,
    payloadOff: switchPanel.payloadOff,
    qos: switchPanel.qos,
    icon: switchPanel.icon,
  });

  const connection = connections.find(c => c.id === switchPanel.connectionId);

  const handleDelete = () => {
    if (confirm('آیا از حذف این پنل مطمئن هستید؟')) {
      deleteSwitch(switchPanel.id);
    }
  };

  const handleSaveEdit = () => {
    updateSwitch(switchPanel.id, editData);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditData({
      connectionId: switchPanel.connectionId,
      name: switchPanel.name,
      topic: switchPanel.topic,
      payloadOn: switchPanel.payloadOn,
      payloadOff: switchPanel.payloadOff,
      qos: switchPanel.qos,
      icon: switchPanel.icon,
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card className="gradient-card border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">ویرایش پنل</CardTitle>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={handleSaveEdit}
                className="h-8 w-8"
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={handleCancelEdit}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="edit-connection" className="text-xs">اتصال</Label>
            <Select
              value={editData.connectionId}
              onValueChange={(value) =>
                setEditData({ ...editData, connectionId: value })
              }
            >
              <SelectTrigger id="edit-connection" className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {connections.map(conn => (
                  <SelectItem key={conn.id} value={conn.id}>
                    {conn.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-name" className="text-xs">نام پنل</Label>
            <Input
              id="edit-name"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="h-9"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-icon" className="text-xs">آیکون</Label>
            <Input
              id="edit-icon"
              value={editData.icon}
              onChange={(e) => setEditData({ ...editData, icon: e.target.value })}
              className="h-12 text-2xl text-center"
              placeholder="💡"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-topic" className="text-xs">توپیک</Label>
            <Input
              id="edit-topic"
              value={editData.topic}
              onChange={(e) => setEditData({ ...editData, topic: e.target.value })}
              className="h-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="edit-on" className="text-xs">Payload روشن</Label>
              <Input
                id="edit-on"
                value={editData.payloadOn}
                onChange={(e) => setEditData({ ...editData, payloadOn: e.target.value })}
                className="h-9"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-off" className="text-xs">Payload خاموش</Label>
              <Input
                id="edit-off"
                value={editData.payloadOff}
                onChange={(e) => setEditData({ ...editData, payloadOff: e.target.value })}
                className="h-9"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-qos" className="text-xs">QoS</Label>
            <Select
              value={editData.qos.toString()}
              onValueChange={(value) =>
                setEditData({ ...editData, qos: parseInt(value) as QoSLevel })
              }
            >
              <SelectTrigger id="edit-qos" className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gradient-card border-border/50 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="text-xs">
            {connection?.name || 'اتصال حذف شده'}
          </Badge>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="h-8 w-8 hover:bg-accent"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleDelete}
              className="h-8 w-8 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {switchPanel.icon && (
            <div className="text-3xl">{switchPanel.icon}</div>
          )}
          <div>
            <CardTitle className="text-lg">{switchPanel.name}</CardTitle>
            <CardDescription className="text-xs mt-1">
              {switchPanel.topic}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Payload روشن:</span>
            <span className="font-medium text-foreground">{switchPanel.payloadOn}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Payload خاموش:</span>
            <span className="font-medium text-foreground">{switchPanel.payloadOff}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>QoS:</span>
            <span className="font-medium text-foreground">{switchPanel.qos}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
