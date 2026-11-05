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

export function getVisibleFeatureInfoScale(desiredScale: number, range?: FeatureInfoScaleRange): number {
  if (!range) {
    return desiredScale;
  }

  let scale = clampFeatureInfoScale(desiredScale, range);
  // The min scale of a layer is usually considered as `>` rather than `>=` when rendering.
  // This results in the min scale being 1 scale unit too little to actually still render a feature.
  if (scale === range.minScale) {
    scale++;
  }

  return scale;
}
