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
      console.log("Regenerating key with id:", id);
      regenerateMutation.mutate({ id });
      props.onOpenChangeComplete?.(false);
      onSuccess?.();
    }
  }

  return (
    <AlertDialog {...props}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your current key and generate a new one from our
            server.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            render={
              <Button aria-label="Regenerate Data" onClick={onRegenerate} variant="default">
                Regenerate
              </Button>
            }
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
