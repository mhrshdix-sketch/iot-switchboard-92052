import { useState } from 'react';
import { Connection } from '@/types/mqtt';
import { useMqtt } from '@/contexts/MqttContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Power, PowerOff, Edit, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { NetworkProtocol } from '@/types/mqtt';

interface ConnectionCardProps {
  connection: Connection;
}

export const ConnectionCard = ({ connection }: ConnectionCardProps) => {
  const { deleteConnection, connectTobroker, disconnectFromBroker, updateConnection } = useMqtt();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: connection.name,
    clientId: connection.clientId,
    brokerAddress: connection.brokerAddress,
    port: connection.port,
    protocol: connection.protocol,
    path: connection.path,
    username: connection.username,
    password: connection.password,
    cleanSession: connection.cleanSession,
    autoConnect: connection.autoConnect,
  });

  const handleDelete = () => {
    if (confirm('آیا از حذف این اتصال مطمئن هستید؟')) {
      deleteConnection(connection.id);
    }
  };

  const handleToggleConnection = () => {
    if (connection.status === 'connected') {
      disconnectFromBroker(connection.id);
    } else {
      connectTobroker(connection.id);
    }
  };

  const handleSaveEdit = () => {
    updateConnection(connection.id, editData);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditData({
      name: connection.name,
      clientId: connection.clientId,
      brokerAddress: connection.brokerAddress,
      port: connection.port,
      protocol: connection.protocol,
      path: connection.path,
      username: connection.username,
      password: connection.password,
      cleanSession: connection.cleanSession,
      autoConnect: connection.autoConnect,
    });
    setIsEditing(false);
  };

  const statusColors = {
    connected: 'status-online',
    disconnected: 'status-offline',
    connecting: 'status-connecting',
    error: 'bg-destructive',
  };

  const statusLabels = {
    connected: 'متصل',
    disconnected: 'قطع شده',
    connecting: 'در حال اتصال...',
    error: 'خطا',
  };

  if (isEditing) {
    return (
      <Card className="gradient-card border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">ویرایش اتصال</CardTitle>
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
            <Label htmlFor="edit-name" className="text-xs">نام اتصال</Label>
            <Input
              id="edit-name"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="h-9"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-clientId" className="text-xs">Client ID</Label>
            <Input
              id="edit-clientId"
              value={editData.clientId}
              onChange={(e) => setEditData({ ...editData, clientId: e.target.value })}
              className="h-9"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-broker" className="text-xs">آدرس بروکر</Label>
            <Input
              id="edit-broker"
              value={editData.brokerAddress}
              onChange={(e) => setEditData({ ...editData, brokerAddress: e.target.value })}
              className="h-9"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-port" className="text-xs">پورت</Label>
            <Input
              id="edit-port"
              type="number"
              value={editData.port}
              onChange={(e) => setEditData({ ...editData, port: parseInt(e.target.value) })}
              className="h-9"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-protocol" className="text-xs">پروتکل</Label>
            <Select
              value={editData.protocol}
              onValueChange={(value: NetworkProtocol) =>
                setEditData({ ...editData, protocol: value })
              }
            >
              <SelectTrigger id="edit-protocol" className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tcp-ssl">TCP-SSL</SelectItem>
                <SelectItem value="websocket-secure">Websocket Secure</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {editData.protocol === 'websocket-secure' && (
            <div className="space-y-1">
              <Label htmlFor="edit-path" className="text-xs">مسیر</Label>
              <Input
                id="edit-path"
                value={editData.path}
                onChange={(e) => setEditData({ ...editData, path: e.target.value })}
                className="h-9"
              />
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="edit-username" className="text-xs">نام کاربری</Label>
            <Input
              id="edit-username"
              value={editData.username}
              onChange={(e) => setEditData({ ...editData, username: e.target.value })}
              className="h-9"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-password" className="text-xs">رمز عبور</Label>
            <Input
              id="edit-password"
              type="password"
              value={editData.password}
              onChange={(e) => setEditData({ ...editData, password: e.target.value })}
              className="h-9"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="edit-clean"
                checked={editData.cleanSession}
                onCheckedChange={(checked) =>
                  setEditData({ ...editData, cleanSession: checked as boolean })
                }
              />
              <Label htmlFor="edit-clean" className="text-xs cursor-pointer">
                Clean Session
              </Label>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="edit-auto"
                checked={editData.autoConnect}
                onCheckedChange={(checked) =>
                  setEditData({ ...editData, autoConnect: checked as boolean })
                }
              />
              <Label htmlFor="edit-auto" className="text-xs cursor-pointer">
                اتصال خودکار
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gradient-card border-border/50 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <Badge
            variant="outline"
            className={cn(
              'gap-1 px-2 py-0.5',
              statusColors[connection.status]
            )}
          >
            <span className="w-2 h-2 rounded-full bg-current" />
            {statusLabels[connection.status]}
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
        <CardTitle className="text-lg">{connection.name}</CardTitle>
        <CardDescription className="text-sm">
          {connection.brokerAddress}:{connection.port}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>پروتکل:</span>
            <span className="font-medium text-foreground">{connection.protocol}</span>
          </div>
          {connection.username && (
            <div className="flex justify-between text-muted-foreground">
              <span>کاربر:</span>
              <span className="font-medium text-foreground">{connection.username}</span>
            </div>
          )}
        </div>

        <Button
          onClick={handleToggleConnection}
          disabled={connection.status === 'connecting'}
          className={cn(
            'w-full gap-2 transition-smooth',
            connection.status === 'connected'
              ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
              : 'gradient-primary text-white hover:opacity-90'
          )}
        >
          {connection.status === 'connected' ? (
            <>
              <PowerOff className="w-4 h-4" />
              قطع اتصال
            </>
          ) : (
            <>
              <Power className="w-4 h-4" />
              {connection.status === 'connecting' ? 'در حال اتصال...' : 'اتصال'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
