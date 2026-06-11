import { ExplorerApp, NotepadApp } from "@/components/window";

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
    pinnedToTaskbar: true,
    component: NotepadApp,
  },
  {
    id: "explorer",
    title: "Explorer",
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
};
