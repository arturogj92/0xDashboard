import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from 'next-intl';

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  mediaType?: 'reel' | 'story';
}

export function DeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  mediaType
}: DeleteDialogProps) {
  const t = useTranslations('components.deleteDialog');
  const message = (t as any)('message', { mediaType: mediaType || 'elemento' });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#120724] border border-indigo-900/50 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl text-gray-100">{t('title')}</DialogTitle>
          <DialogDescription className="text-gray-400 mt-2">
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="text-gray-300 border-gray-600 hover:bg-gray-700/50">
            {t('buttonCancel')}
          </Button>
          <Button
            variant="destructive"
            className="bg-red-700 hover:bg-red-800 text-white"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {t('buttonConfirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 