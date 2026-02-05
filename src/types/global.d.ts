/**
 * Starting in Angular 21, HostListeners had stricter typechecks enabled, which unearthed a plethora of previously non-
 * existent type errors. Mostly, as soon as a HostListener has a specific subtype (e.g. keydown.space), the type is no
 * longer inferred, but seen as Event, even though the generic "keydown" event still has the proper KeyboardEvent. This
 * error only occurred in the compiler, and it was not visible in the IDE.
 *
 * This is a long-existing issue in Angular and the solution prevented here stems from the corresponding Github issue:
 * https://github.com/angular/angular/issues/40778#issuecomment-776829440
 *
 * Note that the empty export is needed because declaring global overrides is only possible within a module context.
 */
declare global {
  interface GlobalEventHandlersEventMap {
    [k: `keydown.${string}`]: GlobalEventHandlersEventMap['keydown'];
  }
}

export {};
