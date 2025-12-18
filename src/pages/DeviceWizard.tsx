import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';
import { Upload, ArrowRight, ArrowLeft, Smartphone, Wifi, Globe, FileJson, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

const DeviceWizard = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Checked, setStep1Checked] = useState(false);
  const [step2Checked, setStep2Checked] = useState(false);
  const [step3Checked, setStep3Checked] = useState(false);
  const [step4Checked, setStep4Checked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const totalSteps = 5;
  const progressValue = ((currentStep - 1) / (totalSteps - 1)) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleMergeImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        if (!data.version) {
          throw new Error(t('invalid_file'));
        }

        const connectionIdMap: Record<string, string> = {};

        if (data.connections && Array.isArray(data.connections)) {
          const existingConnections = JSON.parse(localStorage.getItem('iot_mqtt_connections') || '[]');
          const newConnections = data.connections.map((conn: any) => {
            const newId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            connectionIdMap[conn.id] = newId;
            return {
              ...conn,
              id: newId,
            };
          });
          localStorage.setItem('iot_mqtt_connections', JSON.stringify([...existingConnections, ...newConnections]));
        }

        if (data.switches && Array.isArray(data.switches)) {
          const existingSwitches = JSON.parse(localStorage.getItem('iot_mqtt_switches') || '[]');
          const newSwitches = data.switches.map((sw: any) => ({
            ...sw,
            id: `switch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            connectionId: connectionIdMap[sw.connectionId] || sw.connectionId,
          }));
          localStorage.setItem('iot_mqtt_switches', JSON.stringify([...existingSwitches, ...newSwitches]));
        }

        if (data.buttonPanels && Array.isArray(data.buttonPanels)) {
          const existingButtons = JSON.parse(localStorage.getItem('mqtt_button_panels') || '[]');
          const newButtons = data.buttonPanels.map((btn: any) => ({
            ...btn,
            id: `button_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            connectionId: connectionIdMap[btn.connectionId] || btn.connectionId,
          }));
          localStorage.setItem('mqtt_button_panels', JSON.stringify([...existingButtons, ...newButtons]));
        }

        if (data.uriLaunchers && Array.isArray(data.uriLaunchers)) {
          const existingUris = JSON.parse(localStorage.getItem('mqtt_uri_launchers') || '[]');
          const newUris = data.uriLaunchers.map((uri: any) => ({
            ...uri,
            id: `uri_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            connectionId: connectionIdMap[uri.connectionId] || uri.connectionId,
          }));
          localStorage.setItem('mqtt_uri_launchers', JSON.stringify([...existingUris, ...newUris]));
        }

        toast.success(t('devices_added_success'));
        
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        toast.error(t('file_read_error'));
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      toast.error(t('file_read_error'));
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;
  const NextIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;

  const renderStep1 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-center">
        <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center shadow-glow">
          <FileJson className="w-10 h-10 text-white" />
        </div>
      </div>
      <p className="text-center text-lg leading-relaxed">
        {t('wizard_step1_text')}
      </p>
      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border">
        <Checkbox
          id="step1-check"
          checked={step1Checked}
          onCheckedChange={(checked) => setStep1Checked(checked === true)}
        />
        <label
          htmlFor="step1-check"
          className="text-sm font-medium cursor-pointer flex-1"
        >
          {t('wizard_step1_checkbox')}
        </label>
      </div>
      <Button
        onClick={handleNext}
        disabled={!step1Checked}
        className="w-full gradient-primary text-white"
      >
        {t('continue')}
        <NextIcon className={`w-4 h-4 ${dir === 'rtl' ? 'mr-2' : 'ml-2'}`} />
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-center">
        <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center shadow-glow">
          <Smartphone className="w-10 h-10 text-white" />
        </div>
      </div>
      <p className="text-center text-lg leading-relaxed">
        {t('wizard_step2_text')}
      </p>
      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border">
        <Checkbox
          id="step2-check"
          checked={step2Checked}
          onCheckedChange={(checked) => setStep2Checked(checked === true)}
        />
        <label
          htmlFor="step2-check"
          className="text-sm font-medium cursor-pointer flex-1"
        >
          {t('wizard_step2_checkbox')}
        </label>
      </div>
      <Button
        onClick={handleNext}
        disabled={!step2Checked}
        className="w-full gradient-primary text-white"
      >
        {t('continue')}
        <NextIcon className={`w-4 h-4 ${dir === 'rtl' ? 'mr-2' : 'ml-2'}`} />
      </Button>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-center">
        <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center shadow-glow">
          <Wifi className="w-10 h-10 text-white" />
        </div>
      </div>
      <p className="text-center text-lg leading-relaxed">
        {t('wizard_step3_text')}
      </p>
      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border">
        <Checkbox
          id="step3-check"
          checked={step3Checked}
          onCheckedChange={(checked) => setStep3Checked(checked === true)}
        />
        <label
          htmlFor="step3-check"
          className="text-sm font-medium cursor-pointer flex-1"
        >
          {t('wizard_step3_checkbox')}
        </label>
      </div>
      <Button
        onClick={handleNext}
        disabled={!step3Checked}
        className="w-full gradient-primary text-white"
      >
        {t('continue')}
        <NextIcon className={`w-4 h-4 ${dir === 'rtl' ? 'mr-2' : 'ml-2'}`} />
      </Button>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-center mb-2">
        <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center shadow-glow">
          <Globe className="w-8 h-8 text-white" />
        </div>
      </div>
      <div className="w-full h-[400px] rounded-lg border border-border overflow-hidden bg-white">
        <iframe
          src="http://192.168.4.1"
          className="w-full h-full"
          title="Device Configuration"
          sandbox="allow-same-origin allow-scripts allow-forms"
        />
      </div>
      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border">
        <Checkbox
          id="step4-check"
          checked={step4Checked}
          onCheckedChange={(checked) => setStep4Checked(checked === true)}
        />
        <label
          htmlFor="step4-check"
          className="text-sm font-medium cursor-pointer flex-1"
        >
          {t('wizard_step4_checkbox')}
        </label>
      </div>
      <Button
        onClick={handleNext}
        disabled={!step4Checked}
        className="w-full gradient-primary text-white"
      >
        {t('continue')}
        <NextIcon className={`w-4 h-4 ${dir === 'rtl' ? 'mr-2' : 'ml-2'}`} />
      </Button>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-center">
        <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center shadow-glow">
          <Upload className="w-10 h-10 text-white" />
        </div>
      </div>
      <p className="text-center text-lg leading-relaxed">
        {t('wizard_step5_text')}
      </p>
      <label htmlFor="wizard-config-file">
        <Button
          asChild
          className="w-full gradient-primary text-white cursor-pointer"
          disabled={isLoading}
        >
          <span>
            <Upload className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
            {isLoading ? t('loading') : t('wizard_step5_button')}
          </span>
        </Button>
      </label>
      <input
        id="wizard-config-file"
        type="file"
        accept=".json"
        onChange={handleMergeImport}
        className="hidden"
        disabled={isLoading}
      />
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return renderStep1();
    }
  };

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
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold">{t('add_new_device')}</h1>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {t('step')} {currentStep} {t('of')} {totalSteps}
              </span>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  step === currentStep
                    ? 'gradient-primary text-white shadow-glow'
                    : step < currentStep
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step}
              </div>
            ))}
          </div>

          <Card className="gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="text-center">
                {t(`wizard_step${currentStep}_title`)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderCurrentStep()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DeviceWizard;
