vi.mock('@arcgis/core/views/MapView', () => ({
  default: vi.fn(
    class {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      constructor(data: Record<string, any>) {
        Object.assign(this, data);
      }

      public removeHandles = vi.fn();
      public addHandles = vi.fn();
    },
  ),
}));
