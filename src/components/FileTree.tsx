import React, { useEffect, useState, useMemo } from "react";
import { sessionsApi, FileNode } from "@/lib/sessionsApi";
import {
  Folder,
  FileCode,
  ChevronRight,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// [누락되었던 부분] 인터페이스 정의
export interface FileTreeProps {
  sessionId: string;
  onFileSelect: (path: string) => void;
  selectedPath: string | null;
}

interface TreeNode extends FileNode {
  children?: TreeNode[];
}

// [누락되었던 부분] 트리 변환 함수
const buildTree = (files: FileNode[]): TreeNode[] => {
  const root: TreeNode[] = [];
  const map: Record<string, TreeNode> = {};

  files.forEach((file) => {
    map[file.path] = { ...file, children: [] };
  });

  files.forEach((file) => {
    const parts = file.path.split("/");
    if (parts.length === 1) {
      root.push(map[file.path]);
    } else {
      const parentPath = parts.slice(0, -1).join("/");
      if (map[parentPath]) {
        map[parentPath].children?.push(map[file.path]);
      } else {
        root.push(map[file.path]);
      }
    }
  });

  return root;
};

// 트리 아이템 컴포넌트
const TreeItem = ({
  node,
  depth,
  onSelect,
  selectedPath,
}: {
  node: TreeNode;
  depth: number;
  onSelect: (path: string) => void;
  selectedPath: string | null;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const isSelected = selectedPath === node.path;
  const indent = depth * 12 + 12;

  const handleClick = () => {
    if (node.isDirectory) {
      setIsOpen(!isOpen);
    } else {
      onSelect(node.path);
    }
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center py-1 pr-2 cursor-pointer text-sm hover:bg-accent/50 transition-colors select-none",
          isSelected && "bg-accent text-accent-foreground font-medium"
        )}
        style={{ paddingLeft: `${indent}px` }}
        onClick={handleClick}
      >
        <span className="mr-1 text-muted-foreground">
          {node.isDirectory ? (
            isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : (
            <div className="w-4" />
          )}
        </span>
        <span className="mr-2 text-muted-foreground">
          {node.isDirectory ? (
            <Folder className="h-4 w-4 text-blue-400 fill-blue-400/20" />
          ) : (
            <FileCode className="h-4 w-4" />
          )}
        </span>
        <span className="truncate">{node.name}</span>
      </div>
      {node.isDirectory && isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
              selectedPath={selectedPath}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// 메인 컴포넌트
const FileTree: React.FC<FileTreeProps> = ({
  sessionId,
  onFileSelect,
  selectedPath,
}) => {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTree = async () => {
      try {
        setLoading(true);
        const data = await sessionsApi.getFileTree(sessionId);
        setFiles(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load file tree");
      } finally {
        setLoading(false);
      }
    };
    fetchTree();
  }, [sessionId]);

  const treeData = useMemo(() => buildTree(files), [files]);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <div className="flex-1 overflow-y-auto min-h-0 py-2">
        {loading && (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && <div className="p-4 text-sm text-destructive">{error}</div>}

        {!loading && !error && files.length === 0 && (
          <div className="p-4 text-sm text-muted-foreground">
            No files found.
          </div>
        )}

        {!loading &&
          !error &&
          treeData.map((node) => (
            <TreeItem
              key={node.path}
              node={node}
              depth={0}
              onSelect={onFileSelect}
              selectedPath={selectedPath}
            />
          ))}
      </div>
    </div>
  );
};

export default FileTree;
