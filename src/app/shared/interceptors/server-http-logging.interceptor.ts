import {HttpEventType, HttpInterceptorFn} from '@angular/common/http';
import {tap} from 'rxjs';

export const serverHttpLoggingInterceptor: HttpInterceptorFn = (req, next) => {
  const start = Date.now();
  // eslint-disable-next-line no-console
  console.log(`[SSR HTTP ->] ${req.method} ${req.url}`);

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event.type === HttpEventType.Response) {
          const elapsed = Date.now() - start;
          // eslint-disable-next-line no-console
          console.log(`[SSR HTTP <-] ${req.method} ${req.url} [${event.status}] (${elapsed}ms)`);
        }
      },
      error: (error: unknown) => {
        const elapsed = Date.now() - start;
        console.error(`[SSR HTTP XX] ${req.method} ${req.url} FAILED (${elapsed}ms)`, error);
      },
    }),
  );
};
