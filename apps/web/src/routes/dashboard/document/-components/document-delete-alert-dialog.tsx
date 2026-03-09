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
        toast.success("Document uploaded successfully.");
      },
      onError: (error) => {
        console.error("Document delete failed:", error);
        toast.error("Document delete failed. Please try again.");
      }
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
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your account and remove your data from our
            servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            render={
              <Button aria-label="Delete Data" onClick={onDelete} variant="destructive" className="text-white">
                Delete
              </Button>
            }
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
