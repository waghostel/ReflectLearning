
export type Page = 'upload' | 'main';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  image?: string;
}

export interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  analysis?: string;
}

export enum FileIconType {
    Pdf = 'pdf',
    Ppt = 'ppt',
    Doc = 'doc',
    Image = 'image',
    Other = 'other'
}

export interface OutlineItem {
    title: string;
    slug: string;
}
