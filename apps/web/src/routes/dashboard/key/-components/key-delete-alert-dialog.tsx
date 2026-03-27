import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { orpc } from "@/utils/orpc";

interface KeyDeleteAlertDialogProps extends React.ComponentPropsWithoutRef<typeof AlertDialog> {
  id: string | null;
  onSuccess?: () => void;
}

export default function KeyDeleteAlertDialog({ id, onSuccess, ...props }: KeyDeleteAlertDialogProps) {
  const deleteMutation = useMutation(
    orpc.key.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Key berhasil dihapus.");
      },
      onError: (error) => {
        console.error("Key gagal dihapus:", error);
        toast.error("Key gagal dihapus. Silahkan coba lagi.");
      },
    }),
  );

  function onDelete() {
    if (id) {
      deleteMutation.mutate({ id });
      props.onOpenChangeComplete?.(false);
      onSuccess?.();
    }
  }

  return (
    <AlertDialog {...props}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus akun Anda secara permanen dan menghapus data Anda
            dari server kami.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            render={
              <Button aria-label="Delete Data" onClick={onDelete} variant="destructive" className="text-white">
                Hapus
              </Button>
            }
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
