/**
 * The map tool that currently owns the map interaction. Exactly one of them is active at a time, which is why the plain object query
 * (`feature`) is part of this type even though it has no submenu of its own: it is the tool the map falls back to.
 */
export type ToolMenuVisibility = 'feature' | 'measurement' | 'drawing' | 'data-download' | 'statistics';
