/** @type {import("prettier").Config} */
export const config = {
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "all",
  printWidth: 120,

  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrder: [
    "<THIRD_PARTY_MODULES>",
    "@digisign/(.*)$",
    "^@/(.*)$",
    "^[./]",
  ],

  tailwindFunctions: ["clsx", "tw", "cva", "cn", "twMerge"],

  plugins: [
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
};
