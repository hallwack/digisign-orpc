import { useForm } from "@tanstack/react-form";

import { type GetAllDocumentResponse, documentSignSchema } from "@digisign/db/schemas/document";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SignDocumentFormProps {
  documents: GetAllDocumentResponse;
}

export default function SignDocumentForm({ documents }: SignDocumentFormProps) {
  const form = useForm({
    defaultValues: {
      documentId: "",
      privateKey: null as unknown as File,
    },
    validators: {
      onSubmit: documentSignSchema,
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent>
          <form className="flex flex-col gap-6">
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
                        onValueChange={(value) => field.handleChange(value ?? "")}
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
                name="privateKey"
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
