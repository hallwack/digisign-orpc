export interface SortItem<K extends string = string> {
  id: K;
  desc: boolean;
}

export interface BaseTableParams<K extends string = string> {
  page: number;
  perPage: number;
  sort: SortItem<K>[];
  createdAt: number[];
  filters: any[];
}
