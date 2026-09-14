/// <reference types="vite/client" />

declare module '*.html?raw' {
  const content: string;
  export default content;
}

interface Window {
  __RYANAI_INDEX_HTML__?: string;
}