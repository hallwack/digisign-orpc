import { useLocation } from "@tanstack/react-router";
import { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { sidebarMainMenu } from "@/lib/sidebar-menu";
import { parseSlug } from "@/lib/utils";

const flattenItems = () => {
  const paths: { title: string; url: string }[] = [];

  sidebarMainMenu.forEach((section) => {
    section.items.forEach((item) => {
      paths.push({ title: item.shortName, url: item.url });
    });
  });

  return paths;
};

export default function BreadcrumbHeader() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);
  const pathAccumulator: string[] = [];

  const allPaths = flattenItems();

  const breadcrumbs = segments.map((segment, _) => {
    pathAccumulator.push(segment);
    const currentPath = "/" + pathAccumulator.join("/");

    const matched = allPaths.find((item) => item.url === currentPath);

    return matched ? { title: matched.title, url: currentPath } : { title: segment, url: currentPath };
  });

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>

          {breadcrumbs.map((crumb, index) => (
            <Fragment key={crumb.url}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {index === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage>{parseSlug(crumb.title).title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={crumb.url} className="text-muted-foreground">
                    {crumb.title}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
