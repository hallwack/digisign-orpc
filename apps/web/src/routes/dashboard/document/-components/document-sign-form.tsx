import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { type GetAllDocumentResponseSchema, documentSignFormSchema } from "@digisign/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { parsePemSections, signEddsa, signRsa } from "@/lib/signer";
import { base64ToBlob, downloadBlob } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

interface SignDocumentFormProps {
  documents: GetAllDocumentResponseSchema;
}

export default function DocumentSignForm({ documents }: SignDocumentFormProps) {
  const navigate = useNavigate();
  const mutation = useMutation(
    orpc.document.sign.mutationOptions({
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
        navigate({ to: "/dashboard/document" });
      },
      onError: (error) => {
        console.error("Document signing failed:", error);
        toast.error("Document signing failed. Please try again.");
      },
    }),
  );

  const form = useForm({
    defaultValues: {
      documentId: "",
      privateKeyFile: null as unknown as File,
    },
    validators: {
      onSubmit: documentSignFormSchema,
    },
    onSubmit: async ({ value }) => {
      const selectedDocument = documents.find((doc) => doc.id === value.documentId);
      if (!selectedDocument) throw new Error("Document not found!");
      const documentHash = selectedDocument.hash;

      const privateKeyFile = await value.privateKeyFile.text();
      const { id: keyId, eddsaKey, rsaKey } = parsePemSections(privateKeyFile);

      if (!keyId) throw new Error("Invalid key ID");
      if (!rsaKey || !eddsaKey) throw new Error("Invalid keys");

      const startSigningTime = performance.now();

      const startEddsaSigningTime = performance.now();
      const eddsaSignature = signEddsa(documentHash, eddsaKey);
      const endEddsaSigningTime = performance.now();

      const startRsaSigningTime = performance.now();
      const rsaSignature = signRsa(documentHash, rsaKey);
      const endRsaSigningTime = performance.now();

      const endSigningTime = performance.now();

      mutation.mutate({
        documentId: value.documentId,
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
                      <FieldLabel htmlFor={field.name}>Document</FieldLabel>
                      <Select
                        name={field.name}
                        value={field.state.value}
                        onValueChange={(value) => {
                          field.handleChange(value ?? "");
                        }}
                        aria-invalid={isInvalid}
                      >
                        <SelectTrigger id={field.name}>
                          <SelectValue placeholder="Select Document">
                            {documents.find((doc) => doc.id === field.state.value)?.title || "Select Document"}
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
                name="privateKeyFile"
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
        </CardContent>
      </Card>
    </div>
  );
}
