/**
 * Defines available flags on OverviewSearchResultDisplayItems; these are used as keys inside the flag property.
 */
type OverviewSearchResultDisplayItemFlagKey = 'ogd';
/**
 * A set of flags for a given item if applicable. Optional, since not all flags apply to all items.
 */
export type OverviewSearchResultDisplayItemFlag = Partial<Record<OverviewSearchResultDisplayItemFlagKey, boolean>>;

/**
 * Results from the GB3 API have one of these types.
 */
export type OverviewApiSearchResultModel = 'Geodatensatz' | 'Karte' | 'Geoservice' | 'Produkt';

/**
 * All available types for OverviewSearchResults, which extend the API-only types.
 */
export type OverviewSearchResultType = OverviewApiSearchResultModel | 'Frage' | 'Info';
