import { createTableParamsHook } from "@/hooks/create-table-params-hook";

export const useKeyTableParams = createTableParamsHook<"id" | "keyName" | "createdAt" | "userId", { keyName: string }>({
  keyName: {
    defaultValue: "",
    parse: (val) => val,
    serialize: (val) => val,
  },
});
