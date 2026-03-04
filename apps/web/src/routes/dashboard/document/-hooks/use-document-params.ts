import { createTableParamsHook } from "@/hooks/create-table-params-hook";

const useDocumentTableParams = createTableParamsHook<"id" | "title" | "createdAt" | "userId", { title: string }>({
  title: {
    defaultValue: "",
    parse: (val) => val,
    serialize: (val) => val,
  },
});

export default useDocumentTableParams;
