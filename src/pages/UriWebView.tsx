import { useParams, useNavigate } from 'react-router-dom';
import { useMqtt } from '@/contexts/MqttContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const UriWebView = () => {
  const { id } = useParams<{ id: string }>();
  const { uriLaunchers } = useMqtt();
  const { t, dir } = useLanguage();
  const navigate = useNavigate();

  const launcher = uriLaunchers.find(u => u.id === id);

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
  const fullUri = uri.startsWith('http') ? uri : `http://${uri}`;

  return (
    <div className="h-[calc(100vh-3.5rem)] w-full safe-bottom safe-left safe-right">
      {uri ? (
        <iframe
          src={fullUri}
          className="w-full h-full border-0"
          title={launcher.name}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="flex-1 flex items-center justify-center h-full">
          <p className="text-muted-foreground">{t('uri_not_received')}</p>
        </div>
      )}
    </div>
  );
};

export default UriWebView;
