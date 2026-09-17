/**
 * The query mode determines what a map query returns: information about the features at a location ('feature') or aggregated
 * statistics for an area ('statistics'). Unlike a tool, there is always exactly one active query mode; 'feature' is the default and
 * behaves like the application did before the statistics tool existed.
 */
export type QueryMode = 'feature' | 'statistics';
