/**
 * Defines available flags on OverviewSearchResultDisplayItems; these are used as keys inside the flag property.
 */
type OverviewSearchResultDisplayItemFlagKey = 'ogd';
/**
 * A set of flags for a given item if applicable. Optional, since not all flags apply to all items.
 */
export type OverviewSearchResultDisplayItemFlag = Partial<Record<OverviewSearchResultDisplayItemFlagKey, boolean>>;
