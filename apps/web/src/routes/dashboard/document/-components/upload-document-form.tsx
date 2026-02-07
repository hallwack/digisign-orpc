import { zodResolver } from "@hookform/resolvers/zod";
import { defineStepper } from "@stepperize/react";
import { FileIcon } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

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
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFileUploadFn } from "@/hooks/query-mutation/document";
import {
  type DocumentDetailsSchema,
  type DocumentFileUploadSchema,
  documentDetailsSchema,
  documentFileUploadSchema,
} from "@/schemas/document";

const { Stepper, useStepper, utils } = defineStepper(
  {
    id: "upload-document",
    title: "Upload Document",
    description: "Upload a document to the system",
    schema: documentFileUploadSchema,
    Component: UploadForm,
  },
  {
    id: "detail-document",
    title: "Document Details",
    description: "Provide details about the document",
    schema: documentDetailsSchema,
    Component: DetailsForm,
  },
  {
    id: "review-document",
    title: "Review Document",
    description: "Review the document before submission",
    schema: z.object({}),
    Component: ReviewForm,
  },
);

function ExistedAlertDialog({
  open,
  setOpen,
  onSubmit,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your account and remove your data from our
            servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel, and rename the title</AlertDialogCancel>
          <AlertDialogAction onClick={onSubmit}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function UploadDocumentPage() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent>
          <Stepper.Provider>
            <UploadDocumentsForm />
          </Stepper.Provider>
        </CardContent>
      </Card>
    </div>
  );
}

function UploadDocumentsForm() {
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const { mutate, isPending } = useFileUploadFn();

  const methods = useStepper();

  const form = useForm({
    mode: "onTouched",
    resolver: zodResolver(methods.current.schema),
    defaultValues: {
      file: undefined,
      title: "",
      description: "",
      overwrite: "false",
    },
  });

  function onSubmit() {
    if (methods.isLast) {
      mutate(form.getValues(), {
        onError: (err) => {
          if (err.message === "Conflict") {
            setAlertDialogOpen(true);
          }
        },
      });
    } else {
      methods.next();
    }
  }

  const currentIndex = utils.getIndex(methods.current.id);

  function handleOverwriteSubmit() {
    form.setValue("overwrite" as never, "true" as never);
    mutate(form.getValues());
  }

  return (
    <>
      <ExistedAlertDialog open={alertDialogOpen} setOpen={setAlertDialogOpen} onSubmit={handleOverwriteSubmit} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Stepper.Navigation>
            {methods.all.map((step, _) => (
              <Stepper.Step
                key={step.id}
                of={step.id}
                type={step.id === methods.current.id ? "submit" : "button"}
                className="!cursor-default"
                /* onClick={async () => {
                const valid = await form.trigger();
                if (!valid) return;
                if (index - currentIndex > 1) return;
                methods.goTo(step.id);
              }} */
              >
                <Stepper.Title>{step.title}</Stepper.Title>
              </Stepper.Step>
            ))}
          </Stepper.Navigation>

          {methods.switch({
            "detail-document": ({ Component }) => <Component />,
            "review-document": ({ Component }) => (
              <Component fileInfo={form.getValues() as DocumentFileUploadSchema & DocumentDetailsSchema} />
            ),
            "upload-document": ({ Component }) => <Component />,
          })}

          <Stepper.Controls>
            {!methods.isFirst && (
              <Button type="button" variant="secondary" onClick={methods.prev} disabled={methods.isFirst}>
                Previous
              </Button>
            )}
            <Button type="submit" disabled={isPending}>
              {methods.isLast ? "Submit" : "Next"}
            </Button>
          </Stepper.Controls>
        </form>
      </Form>
    </>
  );
}

function UploadForm() {
  const uploadForm = useFormContext<DocumentFileUploadSchema>();

  return (
    <Stepper.Panel className="py-8">
      <FormField
        control={uploadForm.control}
        name="file"
        render={({ field }) => (
          <FormItem>
            <FormLabel>File</FormLabel>
            <FormControl>
              <Input
                accept=".pdf, .docx, .xlsx"
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  field.onChange(file);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </Stepper.Panel>
  );
}

function DetailsForm() {
  const detailsForm = useFormContext<DocumentDetailsSchema>();

  return (
    <Stepper.Panel className="flex flex-col gap-4 py-8">
      <FormField
        control={detailsForm.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input placeholder="Enter your document title" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={detailsForm.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea placeholder="Enter your document description" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </Stepper.Panel>
  );
}

function ReviewForm({ fileInfo }: { fileInfo: DocumentFileUploadSchema & DocumentDetailsSchema }) {
  return (
    <Stepper.Panel className="flex flex-col gap-4 py-8">
      <div className="space-y-4 rounded-md border p-4">
        <h3 className="text-lg font-medium">Document Summary</h3>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-1 text-sm">
            <p className="font-medium">File</p>
            <div className="flex items-center gap-4">
              <FileIcon className="text-muted-foreground h-8 w-8" />
              <span className="break-all">{fileInfo.file?.name}</span>
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <p className="font-medium">Size</p>
            <p>{fileInfo.file?.size ? (fileInfo.file?.size / 1024).toFixed(2) + " KB" : ""}</p>
          </div>
          <div className="space-y-1 text-sm">
            <p className="font-medium">Title</p>
            <p>{fileInfo.title || "Untitled"}</p>
          </div>
          <div className="space-y-1 text-sm">
            <p className="font-medium">Description</p>
            <p>{fileInfo.description}</p>
          </div>
        </div>
      </div>
    </Stepper.Panel>
  );
}
