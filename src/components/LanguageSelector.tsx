import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supportedLanguages } from '@/lib/i18n';
import { toast } from '@/hooks/use-toast';

interface LanguageSelectorProps {
  variant?: 'icon' | 'button';
  showLabel?: boolean;
}

export function LanguageSelector({ variant = 'icon', showLabel = false }: LanguageSelectorProps) {
  const { i18n, t } = useTranslation();
  const [showAllLanguages, setShowAllLanguages] = useState(false);
  
  const currentLanguage = supportedLanguages.find(l => l.code === i18n.language) || supportedLanguages[0];
  
  // Show first 4 languages in dropdown, rest in dialog
  const quickLanguages = supportedLanguages.slice(0, 4);
  
  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    const language = supportedLanguages.find(l => l.code === code);
    toast({
      title: `🌐 ${language?.nativeName}`,
      description: `Language changed to ${language?.name}`,
    });
    setShowAllLanguages(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {variant === 'icon' ? (
            <Button variant="ghost" size="icon" className="relative">
              <Globe className="h-5 w-5" />
              {showLabel && (
                <span className="sr-only">{currentLanguage.nativeName}</span>
              )}
            </Button>
          ) : (
            <Button variant="outline" className="gap-2">
              <span>{currentLanguage.flag}</span>
              <span>{currentLanguage.nativeName}</span>
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {quickLanguages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className="flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.nativeName}</span>
              </span>
              {i18n.language === lang.code && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowAllLanguages(true)}
            className="cursor-pointer"
          >
            {t('settings.moreLanguages')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showAllLanguages} onOpenChange={setShowAllLanguages}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t('settings.selectLanguage')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {supportedLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  i18n.language === lang.code
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50 hover:bg-muted'
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <div className="text-left">
                  <div className="font-medium">{lang.nativeName}</div>
                  <div className="text-xs text-muted-foreground">{lang.name}</div>
                </div>
                {i18n.language === lang.code && (
                  <Check className="h-4 w-4 text-primary ml-auto" />
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
