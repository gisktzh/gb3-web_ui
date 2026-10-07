import {clampFeatureInfoScale, intersectFeatureInfoScaleRanges, isInFeatureInfoScaleRange} from './feature-info-scale.utils';

describe('feature info scale ranges', () => {
  it('intersects the layer, topic and parent ranges without giving one priority', () => {
    expect(
      intersectFeatureInfoScaleRanges([
        {minScale: 5000, maxScale: 50000},
        {minScale: 10000, maxScale: 100000},
        {minScale: 1000, maxScale: 25000},
      ]),
    ).toEqual({minScale: 10000, maxScale: 25000});
  });

  it('treats zero limits and empty ranges as unbounded', () => {
    expect(intersectFeatureInfoScaleRanges([])).toEqual({minScale: 0, maxScale: Infinity});
    expect(intersectFeatureInfoScaleRanges([{minScale: 0, maxScale: 0}])).toEqual({minScale: 0, maxScale: Infinity});
  });

  it('includes boundary scales and rejects scales beyond them', () => {
    const range = {minScale: 10000, maxScale: 50000};
    expect(isInFeatureInfoScaleRange(10000, range)).toBe(true);
    expect(isInFeatureInfoScaleRange(50000, range)).toBe(true);
    expect(isInFeatureInfoScaleRange(9999, range)).toBe(false);
    expect(isInFeatureInfoScaleRange(50001, range)).toBe(false);
  });

  it('does not consider a contradictory range visible', () => {
    const range = intersectFeatureInfoScaleRanges([{minScale: 50000, maxScale: 10000}]);
    expect(isInFeatureInfoScaleRange(25000, range)).toBe(false);
  });

  it('clamps both ends and preserves an already allowed scale', () => {
    const range = {minScale: 10000, maxScale: 50000};
    expect(clampFeatureInfoScale(750, range)).toBe(10000);
    expect(clampFeatureInfoScale(20000, range)).toBe(20000);
    expect(clampFeatureInfoScale(100000, range)).toBe(50000);
  });
});
