import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { keyInsertSchema } from "@digisign/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { base64ToBlob, downloadBlob } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

export default function KeyCreateForm() {
  const navigate = useNavigate();
  const mutation = useMutation(
    orpc.key.create.mutationOptions({
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

        toast.success("Key created successfully.");
        navigate({ to: "/dashboard/key" });
      },
      onError: (error) => {
        console.error("Key creation failed:", error);
        toast.error("Key creation failed. Please try again.");
      },
    }),
  );

  const form = useForm({
    defaultValues: {
      keyName: "",
    },
    validators: {
      onSubmit: keyInsertSchema,
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
                <form.Field
                  name="keyName"
                  children={(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Key Name</FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="E.g. My Signing Key"
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                />
              </FieldSet>
            </FieldGroup>

            <Button type="submit">Submit</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
