export const dataDownloadFilterCategoryKeys = ['availability', 'format', 'theme'] as const; // TS3.4 syntax
export type DataDownloadFilterCategory = (typeof dataDownloadFilterCategoryKeys)[number];

/**
 * Represents a filter configuration containing the key and a label for this given filter.
 */
export interface DataDownloadFilterConfiguration {
  category: DataDownloadFilterCategory;
  label: string;
}

/**
 * The actual filter which consists of a configuration and the filtervalues, where each value represents the filterable value and its
 * state (active or not active).
 */
export interface DataDownloadFilter extends DataDownloadFilterConfiguration {
  filterValues: {
    value: string;
    isActive: boolean;
  }[];
}

/**
 * Represents a list of all values which are active for a given key.
 */
export interface ActiveDataDownloadFilterGroup {
  category: DataDownloadFilterCategory;
  values: string[];
}
