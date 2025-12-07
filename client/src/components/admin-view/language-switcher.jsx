import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { QatarFlag, USAFlag } from '@/components/ui/country-flags';

const languages = [
  { code: 'ar', label: 'العربية', nativeLabel: 'العربية', FlagComponent: QatarFlag },
  { code: 'en', label: 'English', nativeLabel: 'English', FlagComponent: USAFlag },
];

function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];
  const CurrentFlag = currentLanguage.FlagComponent;

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
    
    // Always keep LTR for Admin Panel
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = langCode;
    document.documentElement.setAttribute('data-admin-panel', 'true');
    
    // Ensure LTR class
    document.body.classList.add('ltr');
    document.body.classList.remove('rtl');
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 hover:bg-[#D4AF37]/10 dark:hover:bg-[#D4AF37]/20 transition-all duration-200 hover:scale-110"
          title={t('language.switchLanguage')}
        >
          <Globe className="w-5 h-5" />
          <span className="sr-only">{t('language.switchLanguage')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-white dark:bg-[#0f0f0f] border-gray-200 dark:border-gray-800 shadow-xl"
        sideOffset={5}
      >
        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
          {t('language.selectLanguage')}
        </div>
        {languages.map((language) => {
          const isActive = i18n.language === language.code;
          const FlagIcon = language.FlagComponent;
          return (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`
                flex items-center justify-between px-3 py-2.5 cursor-pointer
                transition-all duration-200
                ${isActive 
                  ? 'bg-[#D4AF37]/10 dark:bg-[#D4AF37]/20 text-[#D4AF37] dark:text-[#D4AF37] font-medium' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
            >
              <div className="flex items-center gap-2.5">
                {FlagIcon && <FlagIcon className="w-5 h-5 flex-shrink-0" />}
                <span className="text-sm">{language.nativeLabel}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">({language.label})</span>
              </div>
              {isActive && (
                <Check className="w-4 h-4 text-[#D4AF37]" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LanguageSwitcher;
