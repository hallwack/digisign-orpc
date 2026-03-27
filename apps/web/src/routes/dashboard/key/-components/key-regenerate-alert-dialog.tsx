import { useMutation } from "@tanstack/react-query";

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

interface KeyRegenerateAlertDialogProps extends React.ComponentPropsWithoutRef<typeof AlertDialog> {
  id: string | null;
  onSuccess?: () => void;
}

export default function KeyRegenerateAlertDialog({ id, onSuccess, ...props }: KeyRegenerateAlertDialogProps) {
  const regenerateMutation = useMutation(orpc.key.regenerate.mutationOptions({}));

  function onRegenerate() {
    if (id) {
      regenerateMutation.mutate({ id });
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
            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus key Anda saat ini dan membuat key baru dari server
            kami.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            render={
              <Button aria-label="Generate Ulang Key" onClick={onRegenerate} variant="default">
                Generate Ulang
              </Button>
            }
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
