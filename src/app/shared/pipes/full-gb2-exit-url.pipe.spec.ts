import {FullGb2ExitUrlPipe} from './full-gb2-exit-url.pipe';
import {MapConfigState} from '../../state/map/states/map-config.state';

describe('FullGb2ExitUrlPipe', () => {
  let pipe: FullGb2ExitUrlPipe;
  beforeEach(() => {
    pipe = new FullGb2ExitUrlPipe();
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
    const testUrl = 'https://www.example.com';
    const mockState: MapConfigState = {center: {x: 42, y: 1337}, scale: 9000} as MapConfigState;

    const result = pipe.transform(testUrl, mockState);

    const expected = `https://www.example.com&x=${mockState.center.x}&y=${mockState.center.y}&scale=${mockState.scale}`;
    expect(result).toEqual(expected);
  });
});
