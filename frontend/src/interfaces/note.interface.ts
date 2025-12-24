// Note interface for note board component
export interface Note {
  id: string;
  content: string;
  createdAt: Date;
  color?: "yellow" | "blue" | "green" | "pink";
  rotation?: number;
}



