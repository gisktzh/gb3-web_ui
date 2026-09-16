import {RenderMode, ServerRoute} from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Server,
    headers: {
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600',
    },
  },
  {
    path: '**',
    renderMode: RenderMode.Client,
    headers: {
      'Cache-Control': 'no-cache',
    },
  },
];
