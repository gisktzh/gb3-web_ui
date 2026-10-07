import {expect, type Page} from '@playwright/test';
import {MapConstants} from '../../src/app/shared/constants/map.constants';

export type MapCoordinates = [number, number];
export interface MapPoint {
  position: {x: number; y: number};
  coordinates: MapCoordinates;
}

async function mapViewport(page: Page) {
  const surface = page.getByTestId('map-container').locator('.esri-view-surface');
  await expect(surface).toBeVisible();
  const bounds = await surface.boundingBox();
  if (!bounds) throw new Error('The map must have a visible viewport.');
  const mobile = (page.viewportSize()?.width ?? 1920) < 768;
  const padding = mobile ? {left: 0, right: 0, top: 0, bottom: 0} : {...MapConstants.INITIAL_MAP_PADDING};
  if (!mobile) {
    // CSS custom properties can retain calc(...) expressions; measure the rendered sidebar instead.
    const sidebarBounds = await page.getByTestId('map-sidebar').boundingBox();
    if (sidebarBounds && sidebarBounds.width > 0) {
      padding.right = Math.max(padding.right, sidebarBounds.width + MapConstants.MAP_OVERLAY_VIEW_PADDING);
    }
  }
  const viewport = {
    x: bounds.x + padding.left,
    y: bounds.y + padding.top,
    width: bounds.width - padding.left - padding.right,
    height: bounds.height - padding.top - padding.bottom,
  };
  if (!Object.values(viewport).every(Number.isFinite) || viewport.width <= 0 || viewport.height <= 0) {
    throw new Error('The map must have a visible area outside the overlays.');
  }
  return viewport;
}

/** Read the visible map's URL/scale and layout without Angular debug hooks or map-service calls. */
export async function getMapPoint(page: Page, offset = {x: 0, y: 0}): Promise<MapPoint> {
  const viewport = await mapViewport(page);
  const center = {x: viewport.x + viewport.width / 2, y: viewport.y + viewport.height / 2};
  const position = {x: Math.round(center.x + offset.x), y: Math.round(center.y + offset.y)};
  expect(position.x).toBeGreaterThan(viewport.x);
  expect(position.x).toBeLessThan(viewport.x + viewport.width);
  expect(position.y).toBeGreaterThan(viewport.y);
  expect(position.y).toBeLessThan(viewport.y + viewport.height);
  const url = new URL(page.url());
  expect(Number(url.searchParams.get('rotation') ?? 0)).toBe(0);
  const x = Number(url.searchParams.get('x'));
  const y = Number(url.searchParams.get('y'));
  const scale = Number(url.searchParams.get('scale'));
  expect([x, y, scale].every(Number.isFinite) && scale > 0).toBe(true);
  // ArcGIS defines scale at 96 CSS pixels per inch. LV95 coordinates are in metres.
  const metresPerPixel = (scale * 0.0254) / 96;
  return {
    position,
    coordinates: [x + (position.x - center.x) * metresPerPixel, y - (position.y - center.y) * metresPerPixel],
  };
}

export async function clickMapPoint(page: Page, point: MapPoint) {
  await page.mouse.click(point.position.x, point.position.y);
}

/** Exclude overlays so changed table controls cannot masquerade as rendered map markings. */
export async function mapScreenshot(page: Page) {
  const viewport = await mapViewport(page);
  return page.screenshot({clip: viewport, animations: 'disabled'});
}

export async function waitForMap(page: Page) {
  const map = page.getByTestId('map-container');
  await expect(map.locator('canvas').first()).toBeVisible({timeout: 30_000});
  const viewport = page.viewportSize();
  if (viewport && viewport.width < 768) {
    // Resizing the browser can finish before Angular replaces the desktop layout.
    // Its map is 72px shorter, so measuring it now would offset the first mobile tap.
    await expect(page.getByTestId('map-overlays')).toHaveCount(0, {timeout: 30_000});
    await expect
      .poll(() => map.locator('.esri-view-surface').boundingBox(), {
        message: 'The mobile map must fill the viewport before selecting a location.',
        timeout: 30_000,
      })
      .toEqual({x: 0, y: 0, width: viewport.width, height: viewport.height});
  }
  await expect(page.getByTestId('active-map-items').getByTestId('loading-progress')).toHaveCount(0, {timeout: 30_000});
  if ((page.viewportSize()?.width ?? 1920) >= 768) {
    await expect(page.getByTestId('map-select-feature')).toBeEnabled();
  }
  await page.waitForLoadState('networkidle');
}

export async function setMapScale(page: Page, scale: number) {
  const input = page.getByTestId('input-map-scale');
  await input.fill(scale.toString());
  await input.blur();
  await expect(page).toHaveURL((url) => Number(url.searchParams.get('scale')) === scale);
  await waitForMap(page);
}
