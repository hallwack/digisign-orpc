import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import type React from "react";
import { toast } from "sonner";

import { documentKeyUploadSchema } from "@digisign/types";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { parsePemSections, signEddsa, signRsa } from "@/lib/signer";
import { base64ToBlob, downloadBlob } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

interface DocumentResignModalFormProps extends React.ComponentPropsWithoutRef<typeof Dialog> {
  id: string | null;
  onSuccess?: () => void;
}

export default function DocumentResignModalForm({ id, onSuccess, ...props }: DocumentResignModalFormProps) {
  const documentQuery = useQuery(
    orpc.document.detail.queryOptions({
      input: {
        id: id ?? "",
      },
      enabled: !!id,
    }),
  );

  const mutation = useMutation(
    orpc.document.resign.mutationOptions({
      onSuccess: (data) => {
        const fileData = data.fileData;
        const mimeType = data.mimeType;
        const fileName = data.fileName;

        if (!fileData || !mimeType || !fileName) {
          throw new Error("Missing file data for download");
        } else {
          const blob = base64ToBlob(fileData, mimeType);
          downloadBlob(blob, fileName);
        }

        toast.success("Document signed successfully.");
        onSuccess?.();
      },
      onError: (error) => {
        console.error("Document signing failed:", error);
        toast.error(
          `Document signing failed. Please try again. Error: ${error instanceof Error ? error.message : String(error)}`,
        );
      },
    }),
  );

  const form = useForm({
    defaultValues: {
      file: null as unknown as File,
    },
    validators: {
      onSubmit: documentKeyUploadSchema,
    },
    onSubmit: async ({ value }) => {
      if (!documentQuery.data) throw new Error("Document not found");

      const { id: documentId, hash } = documentQuery.data;
      const privateKeyFile = await value.file.text();
      const { id: keyId, eddsaKey, rsaKey } = parsePemSections(privateKeyFile);

      if (!keyId) throw new Error("Invalid key ID");
      if (!rsaKey || !eddsaKey) throw new Error("Invalid keys");

      const startSigningTime = performance.now();

      const startEddsaSigningTime = performance.now();
      const eddsaSignature = signEddsa(hash, eddsaKey);
      const endEddsaSigningTime = performance.now();

      const startRsaSigningTime = performance.now();
      const rsaSignature = signRsa(hash, rsaKey);
      const endRsaSigningTime = performance.now();

      const endSigningTime = performance.now();

      mutation.mutate({
        documentId,
        keyId,
        rsaPrivateKey: rsaSignature,
        eddsaPrivateKey: eddsaSignature,
        signingTime: endSigningTime - startSigningTime,
        eddsaSigningTime: endEddsaSigningTime - startEddsaSigningTime,
        rsaSigningTime: endRsaSigningTime - startRsaSigningTime,
      });
    },
  });
  return (
    <Dialog {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resign Document</DialogTitle>
          <DialogDescription>
            Are you sure you want to resign this document? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid w-full gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <div className="rounded-md border p-4">
              <p className="mb-3 font-medium">Document Information</p>
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
                <p className="text-muted-foreground text-sm">Title</p>
                <p className="text-sm">{documentQuery.data?.title}</p>
                <p className="text-muted-foreground text-sm">Description</p>
                <p className="text-sm">{documentQuery.data?.description}</p>
                <p className="text-muted-foreground text-sm">File Name</p>
                <p className="text-sm">{documentQuery.data?.fileName}</p>
                <p className="text-muted-foreground text-sm">Hash</p>
                <p className="font-mono text-xs break-all">{documentQuery.data?.hash}</p>
              </div>
            </div>
          </FieldGroup>
          <FieldGroup>
            <form.Field
              name="file"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Private Key File</FieldLabel>
                    <Input
                      accept=".pem,.key"
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) field.handleChange(file);
                      }}
                      id={field.name}
                      name={field.name}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
          </FieldGroup>

          <Button type="submit">Submit</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
