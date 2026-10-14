/// <reference types="vite/client" />
declare module 'virtual:content' {
  export interface ClientVideo {
    id: string; type: string; brand: string; caption: string;
    mp4: string; webm: string; poster: string; hasAudio: boolean; duration: number;
  }
  export const firstName: string;
  export const demo: boolean;
  export const videos: ClientVideo[];
}
