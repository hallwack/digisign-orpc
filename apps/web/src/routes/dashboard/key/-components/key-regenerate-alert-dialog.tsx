import type { Dialog as BaseUIDialog } from "@base-ui/react";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { keyRegenerateSchema } from "@digisign/types";

import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { orpc } from "@/utils/orpc";

interface KeyRegenerateAlertDialogProps extends React.ComponentPropsWithoutRef<typeof Dialog> {
  id: string | null;
  onSuccess?: () => void;
}

export default function KeyRegenerateAlertDialog({ id, onSuccess, ...props }: KeyRegenerateAlertDialogProps) {
  const regenerateMutation = useMutation(orpc.key.regenerate.mutationOptions({}));

  const form = useForm({
    defaultValues: {
      id: id ?? "",
      passphrase: "",
    },
    validators: {
      onSubmit: keyRegenerateSchema,
    },
    onSubmit: async ({ value }) => {
      console.log("value", value);
      if (!id) {
        toast.error("ID key tidak valid.");
        return;
      }

      try {
        await regenerateMutation.mutateAsync({
          id,
          passphrase: value.passphrase,
        });
        form.reset();
        // props.onOpenChange?.(false, { reason: "none" } as BaseUIDialog.Root.ChangeEventDetails);
        // props.onOpenChangeComplete?.(true);
        onSuccess?.();
      } catch (err) {
        const errorMessage = (err as Error)?.message || "Terjadi kesalahan saat melakukan regenerasi key.";
        toast.error(errorMessage);
      }
    },
  });

  return (
    <Dialog {...props}>
      <DialogContent>
        <form
          id="key-regenerate-form"
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>Apakah Anda yakin?</DialogTitle>
            <DialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus key Anda saat ini dan membuat key baru dari server
              kami.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <FieldSet>
              <form.Field
                name="passphrase"
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Passphrase</FieldLabel>
                      <PasswordInput
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              />
            </FieldSet>
          </FieldGroup>

          <DialogFooter>
            <DialogClose render={<Button variant="outline">Batal</Button>} />
            <Button
              type="submit"
              onClick={(e) => console.log("submit form", e)}
              disabled={regenerateMutation.isPending}
            >
              Generate Ulang
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
