export interface SocialLinkData {
  id: string;
  name: string;
  url: string;
  visible: boolean;
  position: number;
}

export interface LinkData {
  id: string;
  title: string;
  url: string;
  image?: string;
  visible: boolean;
  position: number;
  section_id?: string | null;
  url_link_id?: number | null;
}

export interface SectionData {
  id: string;
  title: string;
  position: number;
} 