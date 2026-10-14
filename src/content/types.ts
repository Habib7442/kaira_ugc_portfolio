export type VideoType = 'Unboxing' | 'Tutorial' | 'Review' | 'Hook' | 'Lifestyle' | 'Product' | 'Voiceover';
export type BrandStyle = 'sans-black' | 'sans-light' | 'sans-wide' | 'serif' | 'display';

export interface Creator {
  demo: boolean;
  name: string;
  firstName: string;
  handle: string;
  year?: number;
  role?: string;
  tagline: string;
  bio: string[];
  location: string;
  languages: string[];
  niches: string[];
  turnaround: string;
  stats: { demo: boolean; followers?: number; avgViews?: number; brands?: number };
  photos: { master?: string; coverCutout: string; coverCutoutMobile?: string; polaroid: string; orbitCutout: string };
  videos: { id: string; src: string; poster?: string; type: VideoType; brand: string; caption: string; audio?: boolean }[];
  brands: { name: string; style?: BrandStyle }[];
  caseStudies: {
    brand: string;
    image: string;
    videoIds: string[];
    deliverables?: string[];
    brief: string;
    whatIMade: string;
    results: { value: string; label: string }[];
  }[];
  showPrices: boolean;
  currency?: string;
  services: { name: string; includes: string[]; fromPrice?: number }[];
  addOns?: { name: string; fromPrice?: number }[];
  badgeText?: string;
  process: { title: string; line: string; icon?: string }[];
  tools: string[];
  contact: { email: string; instagram?: string; whatsapp?: string; mediaKitUrl?: string; tiktok?: string; youtube?: string };
  theme?: Partial<Record<'ink' | 'paper' | 'lime' | 'lavender' | 'tomato', string>>;
  seo?: { title?: string; description?: string; siteUrl?: string };
}

export interface ImageEntry { kind: 'image'; width: number; height: number; avif: { w: number; src: string }[]; webp: { w: number; src: string }[] }
export interface CutoutEntry { kind: 'cutout'; width: number; height: number; webp: { w: number; h: number; src: string }[] }
export interface VideoEntry {
  kind: 'video'; duration: number; hasAudio: boolean;
  mp4: string; webm: string; preview: string; poster: string; posterSm: string; thumbs: string[];
}
export type MediaEntry = ImageEntry | CutoutEntry | VideoEntry;
export type Manifest = Record<string, MediaEntry>;
