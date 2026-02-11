export function convertToSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
}

export function parseSlug(slug: string) {
  const parts = slug.split("-");

  // The last two parts are userId and documentId
  const id = parts.pop();

  // The rest are the title parts
  const title = parts
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return { title, id };
}
