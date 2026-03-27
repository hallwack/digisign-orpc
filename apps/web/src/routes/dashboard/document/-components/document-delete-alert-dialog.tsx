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

interface DocumentDeleteAlertDialogProps extends React.ComponentPropsWithoutRef<typeof AlertDialog> {
  id: string | null;
  onSuccess?: () => void;
}

export default function DocumentDeleteAlertDialog({ id, onSuccess, ...props }: DocumentDeleteAlertDialogProps) {
  const deleteMutation = useMutation(
    orpc.document.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Dokumen berhasil dihapus");
      },
      onError: (error) => {
        console.error("Dokumen gagal dihapus", error);
        toast.error("Dokumen gagal dihapus. Silahkan coba lagi.");
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
          <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus dokumen secara permanen dari server kami.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            render={
              <Button aria-label="Hapus Dokumen" onClick={onDelete} variant="destructive" className="text-white">
                Hapus
              </Button>
            }
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
