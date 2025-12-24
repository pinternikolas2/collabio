import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-gray-500" />
            <span className="font-medium">{t('settings.language')}</span>
        </div>
        <div className="flex items-center gap-2">
            <Button 
                variant={i18n.language === 'cs' ? 'default' : 'outline'}
                size="sm"
                onClick={() => changeLanguage('cs')}
            >
                CZ
            </Button>
            <Button 
                variant={i18n.language === 'sk' ? 'default' : 'outline'}
                size="sm"
                onClick={() => changeLanguage('sk')}
            >
                SK
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
