import { Link, useMatches } from "@tanstack/react-router";
import { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface BreadcrumbMeta {
  label: string | ((ctx: { params: Record<string, string>; loaderData?: unknown }) => string);
  disabled?: boolean;
}

const COLLAPSE_THRESHOLD = 4;

function resolveLabel(meta: BreadcrumbMeta, params: Record<string, string>, loaderData?: unknown): string {
  if (typeof meta.label === "function") {
    return meta.label({ params, loaderData });
  }
  return meta.label;
}

export default function BreadcrumbHeader() {
  const matches = useMatches();
  console.log("Dashboard matches:", matches);

  const crumbs = matches
    .filter((match) => {
      const context = (match as any).context as Record<string, unknown> | undefined;
      const staticData = (match.staticData as Record<string, unknown>) ?? {};
      return context?.breadcrumb || staticData?.breadcrumb;
    })
    .map((match) => {
      const context = (match as any).context as Record<string, unknown> | undefined;
      const staticData = (match.staticData as Record<string, unknown>) ?? {};
      const meta = (context?.breadcrumb || staticData?.breadcrumb) as BreadcrumbMeta;

      return {
        id: match.id,
        pathname: match.pathname,
        label: resolveLabel(meta, match.params, match.loaderData),
        disabled: meta.disabled ?? false,
      };
    });

  if (crumbs.length === 0) return null;

  const shouldCollapse = crumbs.length > COLLAPSE_THRESHOLD;
  const firstCrumbs = crumbs[0];
  const lastCrumbs = crumbs[crumbs.length - 1];
  const collapsedCrumbs = shouldCollapse ? crumbs.slice(1, crumbs.length - 1) : [];
  const visibleMiddleCrumbs = shouldCollapse ? [] : crumbs.slice(1, -1);

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            {crumbs.length === 1 ? (
              <BreadcrumbPage>{firstCrumbs.label}</BreadcrumbPage>
            ) : (
              <BreadcrumbLink render={<Link to={firstCrumbs.pathname}>{firstCrumbs.label}</Link>} />
            )}
          </BreadcrumbItem>

          {visibleMiddleCrumbs.map((crumb) => (
            <Fragment key={crumb.id}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link to={crumb.pathname}>{crumb.label}</Link>} />
              </BreadcrumbItem>
            </Fragment>
          ))}

          {shouldCollapse && collapsedCrumbs.length > 0 && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <BreadcrumbEllipsis className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {collapsedCrumbs.map((crumb) => (
                      <DropdownMenuItem
                        key={crumb.id}
                        disabled={crumb.disabled}
                        render={<Link to={crumb.pathname}>{crumb.label}</Link>}
                      />
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </BreadcrumbItem>
            </>
          )}

          {crumbs.length > 1 && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{lastCrumbs.label}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
