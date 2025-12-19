import { useParams, useNavigate } from 'react-router-dom';
import { useMqtt } from '@/contexts/MqttContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { RefreshCw, ArrowRight } from 'lucide-react';
import { useRef } from 'react';

const UriWebView = () => {
  const { id } = useParams<{ id: string }>();
  const { uriLaunchers } = useMqtt();
  const { t, dir } = useLanguage();
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const launcher = uriLaunchers.find(u => u.id === id);

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  if (!launcher) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{t('panel_not_found')}</p>
          <Button onClick={() => navigate('/uri-launcher')}>
            <ArrowRight className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
            {t('back')}
          </Button>
        </div>
      </div>
    );
  }

  const uri = launcher.uri || '';

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] safe-bottom safe-left safe-right">
      <div className="flex items-center justify-between p-2 border-b border-border bg-muted/30">
        <h1 className="text-sm font-medium truncate px-2">{launcher.name}</h1>
        <Button
          onClick={handleReload}
          variant="ghost"
          size="sm"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
      {uri ? (
        <iframe
          ref={iframeRef}
          src={uri.startsWith('http') ? uri : `http://${uri}`}
          className="flex-1 w-full border-0"
          title={launcher.name}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">{t('uri_not_received')}</p>
        </div>
      )}
    </div>
  );
};

export default UriWebView;
