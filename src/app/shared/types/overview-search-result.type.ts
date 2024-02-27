/**
 * Defines available flags on OverviewSearchResultDisplayItems; these are used as keys inside the flag property.
 */
type OverviewSearchResultDisplayItemFlagKey = 'ogd';

/**
 * A collection of all possible flags based on OverviewSearchResultDisplayItemFlagKey
 */
type OverviewSearchResultDisplayItemFlagCollection = Record<OverviewSearchResultDisplayItemFlagKey, boolean>;

/**
 * A set of flags for a given item if applicable. Optional, since not all flags apply to all items.
 */
export type OverviewSearchResultDisplayItemFlags = Partial<OverviewSearchResultDisplayItemFlagCollection>;

/**
 * Results from the GB3 API have one of these types.
 */
export type OverviewApiSearchResultType = 'Geodatensatz' | 'Karte' | 'Geoservice' | 'Produkt';

/**
 * All available types for OverviewSearchResults, which extend the API-only types.
 */
export type OverviewSearchResultType = OverviewApiSearchResultType | 'Frage' | 'Info';
