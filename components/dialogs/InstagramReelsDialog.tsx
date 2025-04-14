import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { InstagramReelsList } from '@/components/reels/InstagramReelsList';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface InstagramReelsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectReel: (url: string) => void;
}

export function InstagramReelsDialog({ 
  open, 
  onOpenChange, 
  onSelectReel 
}: InstagramReelsDialogProps) {
  const [selectedReelUrl, setSelectedReelUrl] = useState<string | null>(null);

  const handleSelectReel = (url: string) => {
    setSelectedReelUrl(url);
  };

  const handleConfirmSelection = () => {
    if (selectedReelUrl) {
      onSelectReel(selectedReelUrl);
      onOpenChange(false);
      setSelectedReelUrl(null);
    }
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
            Selecciona un reel de tu cuenta de Instagram para añadirlo
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] pr-1 pb-4">
          <InstagramReelsList onSelectReel={handleSelectReel} />
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
          <Button 
            type="button" 
            disabled={!selectedReelUrl}
            onClick={handleConfirmSelection}
            className="rounded-md bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            Seleccionar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 