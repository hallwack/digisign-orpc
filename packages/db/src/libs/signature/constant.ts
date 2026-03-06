export const SUPPORTED_EXTENSIONS = [".pdf", ".docx", ".xlsx"] as const;
export const CUSTOM_PROPERTY_FMTID = "{D5CDD505-2E9C-101B-9397-08002B2CF9AE}";
export const CUSTOM_XML_PATH = "docProps/custom.xml";
export const OFFICE_NAMESPACES = {
  CUSTOM_PROPS: "http://schemas.openxmlformats.org/officeDocument/2006/custom-properties",
  DOC_PROPS_TYPES: "http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes",
} as const;
