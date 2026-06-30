const mockResourceHandle = {
  remove: vi.fn(),
  on: vi.fn(),
};

vi.mock(import('@arcgis/core/core/reactiveUtils'), async (importOriginal) => {
  const original = await importOriginal();

  return {
    ...original,
    on: vi.fn().mockReturnValue(mockResourceHandle),
    watch: vi.fn().mockReturnValue(mockResourceHandle),
  };
});
