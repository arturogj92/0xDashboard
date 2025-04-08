import Link from 'next/link';

export default function PrivacyLinks() {
  return (
    <div className="flex space-x-4 text-sm text-muted-foreground">
      <Link 
        href="/privacy-policy" 
        className="hover:text-foreground transition-colors duration-200"
      >
        Política de Privacidad
      </Link>
      <span className="text-muted-foreground/50">|</span>
      <Link 
        href="/data-deletion" 
        className="hover:text-foreground transition-colors duration-200"
      >
        Solicitud de Eliminación de Datos
      </Link>
    </div>
  );
} 