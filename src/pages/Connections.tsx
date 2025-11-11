import { useState } from 'react';
import { useMqtt } from '@/contexts/MqttContext';
import { ConnectionCard } from '@/components/ConnectionCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { NetworkProtocol } from '@/types/mqtt';
import { Plus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Connections = () => {
  const { connections, addConnection } = useMqtt();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    clientId: '',
    brokerAddress: '',
    port: 8883,
    protocol: 'tcp-ssl' as NetworkProtocol,
    path: '/mqtt',
    username: '',
    password: '',
    cleanSession: true,
    autoConnect: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addConnection(formData);
    setFormData({
      name: '',
      clientId: '',
      brokerAddress: '',
      port: 8883,
      protocol: 'tcp-ssl',
      path: '/mqtt',
      username: '',
      password: '',
      cleanSession: true,
      autoConnect: true,
    });
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      <div className="container mx-auto px-4 py-2 safe-right safe-left" dir="rtl">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowRight className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold">مدیریت اتصالات</h1>
          </div>
          <p className="text-muted-foreground">
            اتصالات MQTT خود را ایجاد و مدیریت کنید
          </p>
        </div>

        {/* New Connection Form */}
        {showForm ? (
          <Card className="mb-6 gradient-card border-border/50">
            <CardHeader>
              <CardTitle>اتصال جدید</CardTitle>
              <CardDescription>
                اطلاعات بروکر MQTT خود را وارد کنید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">نام اتصال *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="اتصال من"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientId">Client ID</Label>
                    <Input
                      id="clientId"
                      value={formData.clientId}
                      onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                      placeholder="اختیاری"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brokerAddress">آدرس بروکر *</Label>
                    <Input
                      id="brokerAddress"
                      value={formData.brokerAddress}
                      onChange={(e) => setFormData({ ...formData, brokerAddress: e.target.value })}
                      placeholder="broker.example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="port">پورت *</Label>
                    <Input
                      id="port"
                      type="number"
                      value={formData.port}
                      onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                      placeholder="8883"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="protocol">پروتکل شبکه *</Label>
                    <Select
                      value={formData.protocol}
                      onValueChange={(value: NetworkProtocol) => 
                        setFormData({ ...formData, protocol: value })
                      }
                    >
                      <SelectTrigger id="protocol">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tcp-ssl">TCP-SSL</SelectItem>
                        <SelectItem value="websocket-secure">Websocket Secure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.protocol === 'websocket-secure' && (
                    <div className="space-y-2">
                      <Label htmlFor="path">مسیر (Path)</Label>
                      <Input
                        id="path"
                        value={formData.path}
                        onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                        placeholder="/mqtt"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="username">نام کاربری</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="اختیاری"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">رمز عبور</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="اختیاری"
                    />
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id="cleanSession"
                      checked={formData.cleanSession}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, cleanSession: checked as boolean })
                      }
                    />
                    <Label htmlFor="cleanSession" className="cursor-pointer">
                      Clean Session
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id="autoConnect"
                      checked={formData.autoConnect}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, autoConnect: checked as boolean })
                      }
                    />
                    <Label htmlFor="autoConnect" className="cursor-pointer">
                      اتصال خودکار
                    </Label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="gap-2">
                    <Plus className="w-4 h-4" />
                    ایجاد اتصال
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowForm(false)}
                  >
                    انصراف
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Button onClick={() => setShowForm(true)} className="mb-6 gap-2">
            <Plus className="w-4 h-4" />
            اتصال جدید
          </Button>
        )}

        {/* Connections List */}
        {connections.length === 0 ? (
          <Card className="gradient-card border-border/50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">هیچ اتصالی وجود ندارد</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                برای شروع کار با پنل IoT، اولین اتصال MQTT خود را ایجاد کنید
              </p>
              {!showForm && (
                <Button onClick={() => setShowForm(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  ایجاد اولین اتصال
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connections.map(connection => (
              <ConnectionCard key={connection.id} connection={connection} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Connections;
