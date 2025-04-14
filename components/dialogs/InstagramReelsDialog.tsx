import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { InstagramReelsList } from '@/components/reels/InstagramReelsList';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Spinner } from '@/components/ui/Spinner';

interface InstagramReelsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectReel: (url: string, thumbnailUrl: string, caption: string) => void;
}

export function InstagramReelsDialog({ 
  open, 
  onOpenChange, 
  onSelectReel 
}: InstagramReelsDialogProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  // Reset loading state when dialog opens
  useEffect(() => {
    if (open) {
      setIsLoading(true);
      // Simular un tiempo mínimo de carga para mostrar el spinner
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [open]);
  
  // Cuando se selecciona un reel, notificamos al componente padre
  const handleSelectReel = (url: string, thumbnailUrl: string, caption: string) => {
    onSelectReel(url, thumbnailUrl, caption);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-md md:max-w-xl bg-[#120724] border border-indigo-900/30 rounded-xl shadow-xl"
      >
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-3">
            <Image
              src="/images/icons/reel-icon.png"
              alt="Instagram Icon"
              width={36}
              height={36}
              className="mr-2"
            />
            <DialogTitle className="text-xl font-semibold text-white">
              Tus reels de Instagram
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-400 mt-1">
            Haz clic en un reel para seleccionarlo
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] pr-1 pb-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
              <div className="h-10 w-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-400">Cargando tus reels...</p>
            </div>
          ) : (
            <InstagramReelsList onSelectReel={handleSelectReel} />
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-4 pt-3 border-t border-gray-800">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="rounded-md border-gray-700 bg-[#1c1033] text-white hover:bg-[#2c1b4d] px-6 py-2"
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 