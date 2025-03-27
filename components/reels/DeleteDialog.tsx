import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteDialog({
  open,
  onOpenChange,
  onConfirm
}: DeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-black/90 border border-gray-700 text-gray-200 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-xl text-gray-100">Confirmar eliminación</DialogTitle>
          <DialogDescription className="text-gray-400">
            ¿Estás seguro de que deseas eliminar este reel? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-3 mt-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white relative overflow-hidden group"
          >
            Cancelar
          </Button>
          <Button 
            onClick={onConfirm} 
            className="bg-red-900/80 hover:bg-red-800 text-red-100"
          >
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 