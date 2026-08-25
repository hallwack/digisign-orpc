import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import {
  type GetAllDocumentResponseSchema,
  type GetAllKeyResponseSchema,
  documentSignWithPassphraseFormSchema,
} from "@digisign/types";

import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { handleError } from "@/lib/error-handler";
import { parsePemSections, signEddsa, signRsa } from "@/lib/signer";
import { base64ToBlob, downloadBlob } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

interface SignDocumentFormProps {
  documents: GetAllDocumentResponseSchema;
  keys: GetAllKeyResponseSchema;
}

export default function DocumentSignForm({ documents, keys }: SignDocumentFormProps) {
  const navigate = useNavigate();
  const mutation = useMutation(
    orpc.document.sign.mutationOptions({
      onSuccess: async (data) => {
        try {
          const fileData = data.fileData;
          const mimeType = data.mimeType;
          const fileName = data.fileName;

          if (!fileData || !mimeType || !fileName) {
            const err = new Error("File tidak ditemukan untuk di-download");
            err.name = "InternalServerError";
            throw err;
          } else {
            const blob = base64ToBlob(fileData, mimeType);
            downloadBlob(blob, fileName);
          }

          toast.success("Dokumen berhasil ditandatangani");
          navigate({ to: "/dashboard/document" });
        } catch (error) {
          handleError(error, "Dokumen gagal diproses setelah penandatanganan");
        }
      },
      onError: (error) => handleError(error, "Dokumen gagal ditandatangani"),
    }),
  );

  const form = useForm({
    defaultValues: {
      documentId: "",
      keyId: "",
      passphrase: "",
    },
    validators: {
      onSubmit: documentSignWithPassphraseFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const selectedDocument = documents.find((doc) => doc.id === value.documentId);
        if (!selectedDocument) throw new Error("Dokumen tidak ditemukan");
        mutation.mutate({
          documentId: value.documentId,
          keyId: value.keyId,
          passphrase: value.passphrase,
        });
      } catch (error) {
        handleError(error, "Gagal memproses tanda tangan dokumen");
      }
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent>
          <form
            className="flex flex-col gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.Field
                name="documentId"
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Dokumen</FieldLabel>
                      <Select
                        name={field.name}
                        value={field.state.value}
                        onValueChange={(value) => {
                          field.handleChange(value ?? "");
                        }}
                        aria-invalid={isInvalid}
                      >
                        <SelectTrigger id={field.name}>
                          <SelectValue placeholder="Pilih Dokumen">
                            {documents.find((doc) => doc.id === field.state.value)?.title || "Pilih Dokumen"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {documents.map((doc) => (
                            <SelectItem key={doc.id} value={doc.id}>
                              {doc.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              />
              <form.Field
                name="keyId"
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Key</FieldLabel>
                      <Select
                        name={field.name}
                        value={field.state.value}
                        onValueChange={(value) => {
                          field.handleChange(value ?? "");
                        }}
                        aria-invalid={isInvalid}
                      >
                        <SelectTrigger id={field.name}>
                          <SelectValue placeholder="Pilih Key">
                            {keys.find((key) => key.id === field.state.value)?.keyName || "Pilih Key"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {keys.map((key) => (
                            <SelectItem key={key.id} value={key.id}>
                              {key.keyName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              />
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
                        placeholder="Masukkan passphrase untuk key yang dipilih"
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              />
            </FieldGroup>

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Menandatangani..." : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
