import { useForm } from "@tanstack/react-form";

import { documentSignSchema } from "@digisign/db/schemas/document";

import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SignDocumentForm() {
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
                      <FieldLabel>Document</FieldLabel>
                      <Select name={field.name} value={field.state.value} onValueChange={field.handleChange}>
                        <SelectTrigger id="form-tanstack-select-language" aria-invalid={isInvalid} className="min-w-30">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto</SelectItem>
                          <SelectSeparator />
                        </SelectContent>
                      </Select>
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
                      <FieldLabel>Private Key File</FieldLabel>
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
                    </Field>
                  );
                }}
              />
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
