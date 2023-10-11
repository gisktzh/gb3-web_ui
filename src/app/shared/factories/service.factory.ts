export function serviceFactory<T>(service: T, mockService: T, useMockService: boolean = false): T {
  return useMockService ? mockService : service;
}
