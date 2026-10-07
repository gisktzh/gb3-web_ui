import {FeatureInfoScaleRange} from '../interfaces/feature-highlight.interface';

export function intersectFeatureInfoScaleRanges(ranges: FeatureInfoScaleRange[]): FeatureInfoScaleRange {
  return {
    minScale: Math.max(0, ...ranges.map((range) => range.minScale || 0)),
    maxScale: Math.min(...ranges.map((range) => range.maxScale || Infinity)),
  };
}

export function isInFeatureInfoScaleRange(scale: number, range: FeatureInfoScaleRange): boolean {
  return scale >= range.minScale && scale <= range.maxScale;
}

export function clampFeatureInfoScale(scale: number, range: FeatureInfoScaleRange): number {
  return Math.max(range.minScale, Math.min(range.maxScale, scale));
}
