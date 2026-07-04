export type FileSystemNode = TextFile | Directory;

type BaseNode = {
  id: number;
  name: string;
  parentId: number | undefined;
};

type TextFile = BaseNode & {
  type: "text";
  content: string;
};

type Directory = BaseNode & {
  type: "directory";
};

export const files: FileSystemNode[] = [
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
    content: "Welcome to TS-OS!\nHave a look around and you might find some secrets ;)",
  },
  {
    id: 6,
    name: "todo.txt",
    parentId: 2,
    type: "text",
    content: "- create 2048 game\n- create snake game\n- polish UX",
  },
];

export function getChildren(parentId: number) {
  return files.filter((node) => node.parentId === parentId);
}

export function getNode(id: number) {
  return files.find((node) => node.id === id);
}

export function getParent(node: FileSystemNode) {
  return node.parentId === undefined
    ? undefined
    : getNode(node.parentId);
}

export function getPath(node: FileSystemNode) {
  const names: string[] = [];
  let current: FileSystemNode | undefined = node;

  while (current) {
    if (current.name !== "") {
      names.unshift(current.name);
    }
    if (current.parentId === undefined) {
      break;
    }

    current = getNode(current.parentId);
  }

  return '/' + names.join("/");
}
