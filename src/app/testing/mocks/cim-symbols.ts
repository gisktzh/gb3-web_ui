vi.mock('@arcgis/core/symbols/support/cimSymbolUtils', () => ({
  applyCIMSymbolRotation: vi.fn(),
  scaleCIMSymbolTo: vi.fn(),
}));

vi.mock('@gisktzh/cim-symbol-to-svg', () => ({
  default: vi.fn(),
}));
