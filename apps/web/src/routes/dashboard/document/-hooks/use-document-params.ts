import { createTableParamsHook } from "@/hooks/create-table-params-hook";

export const useDocumentTableParams = createTableParamsHook<
  "id" | "title" | "createdAt" | "signedAt" | "userId",
  { title: string }
>({
  title: {
    defaultValue: "",
    parse: (val) => val,
    serialize: (val) => val,
  },
});
