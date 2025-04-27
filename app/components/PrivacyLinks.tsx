import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function PrivacyLinks() {
  const t = useTranslations('app');
  return (
    <div className="flex space-x-4 text-sm text-muted-foreground">
      <Link 
        href="/privacy-policy" 
        className="hover:text-foreground transition-colors duration-200"
      >
        {t('privacyPolicy')}
      </Link>
      <span className="text-muted-foreground/50">|</span>
      <Link 
        href="/data-deletion" 
        className="hover:text-foreground transition-colors duration-200"
      >
        {t('dataDeletion')}
      </Link>
    </div>
  );
} 