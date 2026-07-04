import { ExplorerApp, NotepadApp, Position, Size } from "@/components/window";
import { FileSystemNode, TextFile } from "@/lib/files";
import { FolderSearch, NotepadText } from "lucide-react";

export type AppId = "notepad" | "explorer";

export type WindowData =
  | {
      type: "notepad";
      fileId?: number;
      draftContent?: string;
    }
  | {
      type: "explorer";
    };

export type AppComponentProps = {
  notepad: {
    file?: TextFile;
    value: string;
    onChange: (content: string) => void;
  };
  explorer: {
    files: FileSystemNode[];
    onOpenFile: (fileId: number) => void;
  };
};

export type AppDefinition<TAppId extends AppId = AppId> = {
  id: TAppId;
  title: string;
  icon?: React.ReactNode;
  component: React.ComponentType<AppComponentProps[TAppId]>;
};

export const apps = [
  {
    id: "notepad",
    title: "Notepad",
    icon: <NotepadText />,
    component: NotepadApp,
  },
  {
    id: "explorer",
    title: "Explorer",
    icon: <FolderSearch />,
    component: ExplorerApp,
  },
] satisfies [AppDefinition<"notepad">, AppDefinition<"explorer">];

export type WindowInstance = {
  id: string;
  appId: AppId;
  title: string;
  status: "open" | "minimized";
  zIndex: number;
  position: Position;
  size: Size;
  data: WindowData;
};
