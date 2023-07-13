import {AppendMapConfigurationToUrlPipe} from './append-map-configuration-to-url.pipe';
import {MapConfigState} from '../../state/map/states/map-config.state';

describe('AppendMapConfigurationToUrlPipe', () => {
  let pipe: AppendMapConfigurationToUrlPipe;
  beforeEach(() => {
    pipe = new AppendMapConfigurationToUrlPipe();
  });
  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('returns the value if the mapconfigstate is undefined', () => {
    const testUrl = 'https://www.example.com';

    const result = pipe.transform(testUrl);

    expect(result).toEqual(testUrl);
  });

  it('adds mapcenter and scale to the url', () => {
    const testUrl = 'https://www.example.com/';
    const mockState: MapConfigState = {center: {x: 42, y: 1337}, scale: 9000} as MapConfigState;

    const result = pipe.transform(testUrl, mockState);

    const expected = `${testUrl}?x=${mockState.center.x}&y=${mockState.center.y}&scale=${mockState.scale}`;
    expect(result).toEqual(expected);
  });

  it("appends mapcenter and scale to the url's existing search params", () => {
    const testUrl = 'https://www.example.com/?existing=yes';
    const mockState: MapConfigState = {center: {x: 42, y: 1337}, scale: 9000} as MapConfigState;

    const result = pipe.transform(testUrl, mockState);

    const expected = `${testUrl}&x=${mockState.center.x}&y=${mockState.center.y}&scale=${mockState.scale}`;
    expect(result).toEqual(expected);
  });

  it('returns the input if a non-URL string is provided', () => {
    const testUrl = 'simple-string';
    const mockState: MapConfigState = {center: {x: 42, y: 1337}, scale: 9000} as MapConfigState;

    const result = pipe.transform(testUrl, mockState);

    expect(result).toEqual(testUrl);
  });
});
