// Global mocks for browser compatibility.

vi.stubGlobal(
  'ResizeObserver',
  class {
    public observe = vi.fn();
    public unobserve = vi.fn();
    public disconnect = vi.fn();
  },
);

const MockStorage = {
  getItem: vi.fn(),
  removeItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};
vi.stubGlobal('sessionStorage', MockStorage);
vi.stubGlobal('localStorage', MockStorage);

class GeolocationPositionErrorMock {
  public readonly PERMISSION_DENIED = 1 as const;
  public readonly POSITION_UNAVAILABLE = 2 as const;
  public readonly TIMEOUT = 3 as const;
}
vi.stubGlobal('GeolocationPositionError', GeolocationPositionErrorMock);

vi.stubGlobal('console', {
  ...console,
  timeStamp: vi.fn(),
});
