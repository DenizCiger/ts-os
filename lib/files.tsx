export type FileSystemNode = TextFile | Directory;

type BaseNode = {
  id: number;
  name: string;
  parentId: number | undefined;
};

export type TextFile = BaseNode & {
  type: "text";
  content: string;
};

export type Directory = BaseNode & {
  type: "directory";
};

export const initialFiles: FileSystemNode[] = [
  {
    id: 1,
    name: "",
    parentId: undefined,
    type: "directory",
  },
  {
    id: 2,
    name: "Documents",
    parentId: 1,
    type: "directory",
  },
  {
    id: 3,
    name: "Games",
    parentId: 1,
    type: "directory",
  },
  {
    id: 4,
    name: "Retro",
    parentId: 3,
    type: "directory",
  },
  {
    id: 5,
    name: "welcome.txt",
    parentId: 2,
    type: "text",
    content: "Welcome to TS-OS!\nHave a look around and try out the features :)",
  },
  {
    id: 6,
    name: "todo.txt",
    parentId: 2,
    type: "text",
    content: "- create 2048 game\n- create snake game\n- polish UI & UX",
  },
];

export function isTextFile(node: FileSystemNode): node is TextFile {
  return node.type === "text";
}

export function getChildren(nodes: FileSystemNode[], parentId: number) {
  return nodes.filter((node) => node.parentId === parentId);
}

export function getNode(nodes: FileSystemNode[], id: number) {
  return nodes.find((node) => node.id === id);
}

export function getParent(nodes: FileSystemNode[], node: FileSystemNode) {
  return node.parentId === undefined
    ? undefined
    : getNode(nodes, node.parentId);
}

export function getPath(nodes: FileSystemNode[], node: FileSystemNode) {
  const names: string[] = [];
  let current: FileSystemNode | undefined = node;

  while (current) {
    if (current.name !== "") {
      names.unshift(current.name);
    }
    if (current.parentId === undefined) {
      break;
    }

    current = getNode(nodes, current.parentId);
  }

  return "/" + names.join("/");
}
