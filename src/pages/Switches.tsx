import { useState } from 'react';
import { useMqtt } from '@/contexts/MqttContext';
import { SwitchCard } from '@/components/SwitchCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QoSLevel } from '@/types/mqtt';
import { Plus, ArrowRight, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';

const Switches = () => {
  const { connections, switches, addSwitch } = useMqtt();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    connectionId: '',
    name: '',
    topic: '',
    payloadOn: 'ON',
    payloadOff: 'OFF',
    qos: 0 as QoSLevel,
    retain: false,
    icon: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSwitch(formData);
    setFormData({
      connectionId: '',
      name: '',
      topic: '',
      payloadOn: 'ON',
      payloadOff: 'OFF',
      qos: 0 as QoSLevel,
      retain: false,
      icon: '',
    });
    setShowForm(false);
  };

  const hasConnections = connections.length > 0;

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      <div className="container mx-auto px-4 py-2 safe-right safe-left" dir="rtl">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowRight className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold">مدیریت پنل‌های سوییچ</h1>
          </div>
          <p className="text-muted-foreground">
            پنل‌های کنترل دستگاه‌های IoT خود را ایجاد کنید
          </p>
        </div>

        {!hasConnections && (
          <Alert className="mb-6 border-warning/50 bg-warning/10">
            <AlertCircle className="h-4 w-4 text-warning" />
            <AlertDescription className="text-warning-foreground">
              برای ایجاد پنل سوییچ، ابتدا باید یک اتصال MQTT ایجاد کنید.
              <Button 
                variant="link" 
                className="p-0 h-auto mr-2 text-warning hover:text-warning/80"
                onClick={() => navigate('/connections')}
              >
                ایجاد اتصال
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* New Switch Form */}
        {showForm && hasConnections ? (
          <Card className="mb-6 gradient-card border-border/50">
            <CardHeader>
              <CardTitle>پنل سوییچ جدید</CardTitle>
              <CardDescription>
                اطلاعات سوییچ خود را وارد کنید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="connectionId">اتصال *</Label>
                    <Select
                      value={formData.connectionId}
                      onValueChange={(value) => 
                        setFormData({ ...formData, connectionId: value })
                      }
                      required
                    >
                      <SelectTrigger id="connectionId">
                        <SelectValue placeholder="یک اتصال انتخاب کنید" />
                      </SelectTrigger>
                      <SelectContent>
                        {connections.map(conn => (
                          <SelectItem key={conn.id} value={conn.id}>
                            {conn.name} ({conn.brokerAddress})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="name">نام پنل *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="سوییچ اصلی"
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="icon">آیکون (Emoji)</Label>
                    <Input
                      id="icon"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      placeholder="💡"
                      maxLength={4}
                      className="text-4xl text-center h-20"
                    />
                    <p className="text-xs text-muted-foreground">
                      یک emoji برای نمایش روی دکمه وارد کنید (اختیاری)
                    </p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="topic">توپیک (Topic) *</Label>
                    <Input
                      id="topic"
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      placeholder="home/living/light"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payloadOn">Payload روشن *</Label>
                    <Input
                      id="payloadOn"
                      value={formData.payloadOn}
                      onChange={(e) => setFormData({ ...formData, payloadOn: e.target.value })}
                      placeholder="ON"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payloadOff">Payload خاموش *</Label>
                    <Input
                      id="payloadOff"
                      value={formData.payloadOff}
                      onChange={(e) => setFormData({ ...formData, payloadOff: e.target.value })}
                      placeholder="OFF"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qos">QoS Level *</Label>
                    <Select
                      value={formData.qos.toString()}
                      onValueChange={(value) => 
                        setFormData({ ...formData, qos: parseInt(value) as QoSLevel })
                      }
                    >
                      <SelectTrigger id="qos">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0 - At most once</SelectItem>
                        <SelectItem value="1">1 - At least once</SelectItem>
                        <SelectItem value="2">2 - Exactly once</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center gap-2 p-4 border rounded-lg border-border">
                      <input
                        id="retain"
                        type="checkbox"
                        checked={formData.retain}
                        onChange={(e) => setFormData({ ...formData, retain: e.target.checked })}
                        className="w-4 h-4 rounded border-border cursor-pointer"
                      />
                      <div className="flex-1">
                        <Label htmlFor="retain" className="text-base font-medium cursor-pointer">
                          Retain Message
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          پیام را در بروکر ذخیره کند تا دستگاه‌های جدید آخرین وضعیت را دریافت کنند
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" variant="secondary" className="gap-2">
                    <Plus className="w-4 h-4" />
                    ایجاد پنل
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
        ) : hasConnections && (
          <Button 
            onClick={() => setShowForm(true)} 
            variant="secondary" 
            className="mb-6 gap-2"
          >
            <Plus className="w-4 h-4" />
            پنل جدید
          </Button>
        )}

        {/* Switches List */}
        {switches.length === 0 ? (
          <Card className="gradient-card border-border/50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full gradient-secondary flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">هیچ پنلی وجود ندارد</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                پنل‌های سوییچ برای کنترل دستگاه‌های IoT خود ایجاد کنید
              </p>
              {hasConnections && !showForm && (
                <Button 
                  onClick={() => setShowForm(true)} 
                  variant="secondary" 
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  ایجاد اولین پنل
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {switches.map(switchPanel => (
              <SwitchCard key={switchPanel.id} switchPanel={switchPanel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Switches;
