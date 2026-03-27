import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { documentUploadSchema } from "@digisign/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { orpc } from "@/utils/orpc";

export default function DocumentUploadForm() {
  const navigate = useNavigate();
  const mutation = useMutation(
    orpc.document.upload.mutationOptions({
      onSuccess: () => {
        toast.success("Dokumen berhasil di-upload");
        navigate({ to: "/dashboard/document" });
      },
      onError: (error) => {
        console.error("Dokumen gagal di-upload", error);
        toast.error("Dokumen gagal di-upload. Silahkan coba lagi.");
      },
    }),
  );

  const form = useForm({
    defaultValues: {
      file: null as unknown as File,
      title: "",
      description: "",
    },
    validators: {
      onSubmit: documentUploadSchema,
    },
    onSubmit: async ({ value }) => {
      mutation.mutate(value);
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
              <FieldSet>
                <FieldLegend>Informasi Dokumen</FieldLegend>
                <FieldDescription>Masukkan informasi dokumen di bawah ini.</FieldDescription>
                <FieldGroup>
                  <div className="grid grid-cols-2 gap-4">
                    <form.Field
                      name="title"
                      children={(field) => {
                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              aria-invalid={isInvalid}
                              placeholder="Contoh: Perjanjian Kontrak"
                            />
                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                          </Field>
                        );
                      }}
                    />

                    <form.Field
                      name="description"
                      children={(field) => {
                        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>Deskripsi</FieldLabel>
                            <Textarea
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              aria-invalid={isInvalid}
                              placeholder="Contoh: Perjanjian untuk layanan yang diberikan"
                            />
                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                          </Field>
                        );
                      }}
                    />
                  </div>
                </FieldGroup>
              </FieldSet>

              <FieldSeparator />

              <FieldSet>
                <FieldLegend>Upload FIle</FieldLegend>
                <FieldDescription>Upload dokumen yang ingin Anda bagikan dan tandatangani.</FieldDescription>
                <FieldGroup>
                  <form.Field
                    name="file"
                    children={(field) => {
                      const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>File</FieldLabel>
                          <Input
                            accept=".pdf, .docx, .xlsx"
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
              </FieldSet>
            </FieldGroup>

            <Button type="submit">Submit</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
