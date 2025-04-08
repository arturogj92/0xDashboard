import React from 'react';
import PrivacyLinks from './PrivacyLinks';

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} 0xReplyer. Todos los derechos reservados.
          </p>
          <PrivacyLinks />
        </div>
      </div>
    </footer>
  );
} 