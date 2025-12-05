import React, { useEffect, useState, useCallback } from "react";
import CodeMirror, { ViewUpdate } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { createTheme } from "@uiw/codemirror-themes"; // [추가] 커스텀 테마 생성
import { tags as t } from "@lezer/highlight";
import { sessionsApi } from "@/lib/sessionsApi";
import { Loader2, FileX, Code2 } from "lucide-react";
import { EditorView } from "@codemirror/view";

interface CodeViewerProps {
  sessionId: string;
  filePath: string | null;
  onLineSelect: (line: number) => void;
}

// [핵심] Revify 전용 커스텀 테마 정의
// Tailwind의 Zinc Palette와 일치시킵니다.
const revifyTheme = createTheme({
  theme: "dark",
  settings: {
    background: "#09090b", // app background (zinc-950)
    foreground: "#e4e4e7", // zinc-200
    caret: "#a1a1aa", // zinc-400
    selection: "#27272a", // zinc-800 (선택 영역)
    selectionMatch: "#27272a",
    lineHighlight: "#27272a", // 현재 라인 강조
    gutterBackground: "#09090b", // 줄번호 배경 (에디터와 동일하게)
    gutterForeground: "#52525b", // zinc-600 (줄번호 색상)
  },
  styles: [
    { tag: t.comment, color: "#71717a" }, // zinc-500
    { tag: t.variableName, color: "#a5b4fc" }, // indigo-300
    { tag: [t.string, t.special(t.brace)], color: "#86efac" }, // green-300
    { tag: t.number, color: "#fca5a5" }, // red-300
    { tag: t.bool, color: "#fca5a5" },
    { tag: t.null, color: "#fca5a5" },
    { tag: t.keyword, color: "#c4b5fd" }, // violet-300
    { tag: t.operator, color: "#e4e4e7" },
    { tag: t.className, color: "#93c5fd" }, // blue-300
    { tag: t.definition(t.typeName), color: "#93c5fd" },
    { tag: t.typeName, color: "#93c5fd" },
    { tag: t.angleBracket, color: "#71717a" },
    { tag: t.tagName, color: "#f87171" }, // red-400
    { tag: t.attributeName, color: "#fca5a5" },
  ],
});

const CodeViewer: React.FC<CodeViewerProps> = ({
  sessionId,
  filePath,
  onLineSelect,
}) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!filePath) {
      setCode("");
      return;
    }

    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);
        const content = await sessionsApi.getFileContent(sessionId, filePath);
        setCode(content);
      } catch (err: any) {
        console.error(err);
        if (err.response?.status === 413) {
          setError("File is too large to display.");
        } else {
          setError("Failed to load file content.");
        }
        setCode("");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [sessionId, filePath]);

  const handleUpdate = useCallback(
    (viewUpdate: ViewUpdate) => {
      if (viewUpdate.selectionSet) {
        const state = viewUpdate.state;
        const selection = state.selection.main;
        const line = state.doc.lineAt(selection.head).number;
        onLineSelect(line);
      }
    },
    [onLineSelect]
  );

  if (!filePath) {
    return (
      // 배경색을 앱 테마와 일치시킴 (#09090b)
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-[#09090b]">
        <div className="p-4 rounded-full bg-muted/20 mb-4">
          <Code2 className="h-12 w-12 opacity-50" />
        </div>
        <p className="text-lg font-medium">Select a file to view code</p>
        <p className="text-sm opacity-60">Navigate files from the sidebar</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#09090b]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-destructive gap-2 bg-[#09090b]">
        <FileX className="h-8 w-8" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    // 전체 컨테이너 배경색을 테마 배경색과 통일
    <div className="h-full overflow-hidden flex flex-col bg-[#09090b]">
      {/* 헤더 스타일: 어두운 배경에 은은한 보더 */}
      <div className="bg-[#09090b] px-4 py-2 border-b border-border/40 text-xs font-mono text-muted-foreground shrink-0 flex items-center">
        <span className="opacity-50 mr-2 text-primary">FILE:</span>
        <span className="text-foreground/80">{filePath}</span>
      </div>
      <div className="flex-1 overflow-auto">
        <CodeMirror
          value={code}
          height="100%"
          extensions={[
            javascript({ jsx: true, typescript: true }),
            EditorView.lineWrapping,
          ]}
          readOnly={true}
          editable={false}
          theme={revifyTheme} // [수정] 커스텀 테마 적용
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
          }}
          onUpdate={handleUpdate}
        />
      </div>
    </div>
  );
};

export default CodeViewer;
