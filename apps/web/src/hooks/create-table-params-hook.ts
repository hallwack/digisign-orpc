import { type Options, parseAsArrayOf, parseAsInteger, useQueryState } from "nuqs";

// 1. Tipe untuk UI/Internal (State asli)
export interface SortItem<K extends string = string> {
  id: K;
  desc: boolean;
}

export interface TableState<K extends string = string> {
  page: number;
  perPage: number;
  sort: SortItem<K>[];
  createdAt: number[];
  filters: any[];
}

// 2. Tipe untuk API (Sesuai ekspektasi oRPC)
export interface ORPCInputFormat {
  page?: number;
  perPage?: number;
  sort?: string;
  createdAt?: string;
  filters?: string;
}

type ExtraSetters<T> = {
  [K in keyof T as `set${Capitalize<string & K>}`]: (
    value: T[K] | ((old: T[K]) => T[K] | null) | null,
    options?: Options,
  ) => Promise<URLSearchParams>;
};

type ParserEntry<T> = {
  defaultValue: T;
  parse: (val: string) => T;
  serialize: (val: T) => string;
};

type ExtraParamsConfig<T extends Record<string, any>> = {
  [K in keyof T]: ParserEntry<T[K]>;
};

export function createTableParamsHook<K extends string, Extra extends Record<string, any> = {}>(
  extraParamsConfig?: ExtraParamsConfig<Extra>,
) {
  return function useTableParams() {
    // Hanya READ dari URL, tidak menulis sendiri
    // useDataTable yang bertanggung jawab menulis page/perPage/sort/filters
    const [page] = useQueryState("page", parseAsInteger.withDefault(1));
    const [perPage] = useQueryState("perPage", parseAsInteger.withDefault(5));
    const [createdAt] = useQueryState("createdAt", parseAsArrayOf(parseAsInteger).withDefault([]));
    const [sort] = useQueryState("sort", {
      parse: (v) => {
        try {
          return JSON.parse(v);
        } catch {
          return [];
        }
      },
      serialize: JSON.stringify,
      defaultValue: [] as SortItem<K>[],
    });
    const [filters] = useQueryState("filters", {
      parse: (v) => {
        try {
          return JSON.parse(v);
        } catch {
          return [];
        }
      },
      serialize: JSON.stringify,
      defaultValue: [] as any[],
    });

    const extraParams = {} as Extra;
    const dynamicSetters = {} as any;

    if (extraParamsConfig) {
      for (const key in extraParamsConfig) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [value, setter] = useQueryState(key, extraParamsConfig[key] as any);
        extraParams[key] = value as any;
        dynamicSetters[`set${capitalize(key)}`] = setter;
      }
    }

    const input = {
      page,
      perPage,
      sort: sort.length > 0 ? JSON.stringify(sort) : undefined,
      createdAt: createdAt.length > 0 ? JSON.stringify(createdAt) : undefined,
      filters: filters.length > 0 ? JSON.stringify(filters) : undefined,
      ...extraParams,
    } as ORPCInputFormat & Extra;

    const state: TableState<K> & Extra = {
      page,
      perPage,
      sort,
      createdAt,
      filters,
      ...extraParams,
    };

    return {
      input,
      state,
      ...(dynamicSetters as ExtraSetters<Extra>),
    };
  };
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
