// There is an array (`supportedSrsKeys`) and a new union type (`SupportedSrs`) to have an array used to check if a given value is in said union type.
// => more infos: https://stackoverflow.com/questions/50085494/how-to-check-if-a-given-value-is-in-a-union-type-array
export const supportedSrsKeys = [2056, 4326] as const; // TS3.4 syntax
/**
 * List of application-supported SRS with their EPSG codes.
 */
export type SupportedSrs = (typeof supportedSrsKeys)[number];
