/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly API_URL: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

type ENV = {
  // replace `MY_KV` with your KV namespace
  API_URL: string;
};

// use a default runtime configuration (advanced mode).
type Runtime = import('@astrojs/cloudflare').Runtime<ENV>;
declare namespace App {
  interface Locals extends Runtime {}
}
