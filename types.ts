
export enum SectionId {
  HERO = 'hero',
  GALLERY = 'gallery',
  GENESIS = 'genesis',
  CONTACT = 'contact',
  LOCATION = 'location',
  SECRET = 'secret'
}

export interface GalleryItem {
  title: string;
  description: string;
  image: string;
}
