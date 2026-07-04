import { ExplorerApp, NotepadApp, Position, Size } from "@/components/window";
import { FolderSearch, NotepadText } from "lucide-react";

type AppDefinition = {
  id: string;
  title: string;
  icon?: React.ReactNode;
  component: React.ComponentType;
  pinnedToTaskbar?: boolean;
};

export const apps: AppDefinition[] = [
  {
    id: "notepad",
    title: "Notepad",
    icon: <NotepadText />,
    pinnedToTaskbar: true,
    component: NotepadApp,
  },
  {
    id: "explorer",
    title: "Explorer",
    icon: <FolderSearch />,
    pinnedToTaskbar: true,
    component: ExplorerApp,
  },
];

export type WindowInstance = {
  id: string;
  appId: string;
  title: string;
  status: "open" | "minimized";
  zIndex: number;
  position: Position;
  size: Size;
};
