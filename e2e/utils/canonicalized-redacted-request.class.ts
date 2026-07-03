import {Response, Worker, type Request} from '@playwright/test';
import {redactAny} from 'e2e/utils/redact.utils';
import {canonicalizeHeaders, fromHeaders, toHeaders} from './canonicalize.utils';

/**
 * Wraps a standard Playwright request but returns redacted data for matching.
 *
 * We do redact the HAR for keeping things like credentials out of the code base.
 * During the tests, Playwright tries to match actual requests (at times with actual credentials)
 * against redacted data, it won't ever find a candidate to match. Therefore, we need to
 * redact the original request (i.e. the one the browser's doing), too.
 */
export class CanonicalizedRedactedRequest implements Request {
  private readonly originalRequest!: Request;

  constructor(originalRequest: Request) {
    this.originalRequest = originalRequest;
  }

  public async allHeaders() {
    const redactedHeaders = toHeaders(redactAny(await this.originalRequest.allHeaders()));

    return fromHeaders(canonicalizeHeaders(redactedHeaders));
  }

  public failure() {
    return this.originalRequest.failure();
  }

  public frame() {
    return this.originalRequest.frame();
  }

  public headers() {
    const redactedHeaders = toHeaders(redactAny(this.originalRequest.headers()));

    return fromHeaders(canonicalizeHeaders(redactedHeaders));
  }

  public async headersArray() {
    return canonicalizeHeaders(redactAny(await this.originalRequest.headersArray()));
  }

  public async headerValue(name: string): Promise<null | string> {
    const value = (await this.allHeaders())[name] as string | undefined;

    return value ?? null;
  }

  public isNavigationRequest(): boolean {
    return this.originalRequest.isNavigationRequest();
  }

  public method(): string {
    return this.originalRequest.method();
  }

  public postData(): null | string {
    const postData = this.originalRequest.postData();
    if (postData === null) {
      return null;
    }

    return redactAny(postData);
  }

  public postDataBuffer(): null | Buffer {
    throw new Error('Method not implemented.');
  }

  public postDataJSON() {
    return redactAny(this.originalRequest.postDataJSON());
  }

  public redirectedFrom() {
    return this.originalRequest.redirectedFrom();
  }

  public redirectedTo(): null | Request {
    return this.originalRequest.redirectedTo();
  }

  public resourceType() {
    return this.originalRequest.resourceType();
  }

  public response(): Promise<null | Response> {
    return this.originalRequest.response();
  }

  public serviceWorker(): null | Worker {
    return this.originalRequest.serviceWorker();
  }

  public sizes() {
    return this.originalRequest.sizes();
  }

  public timing() {
    return this.originalRequest.timing();
  }

  public url(): string {
    return redactAny(this.originalRequest.url());
  }
}
