import React, { useEffect, useState, useCallback } from "react";
import CodeMirror, { ViewUpdate } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { sessionsApi, Comment } from "@/lib/sessionsApi";
import { Loader2, FileX } from "lucide-react";
import { EditorView } from "@codemirror/view";

interface CodeViewerProps {
  sessionId: string;
  filePath: string | null;
  onLineSelect: (line: number) => void;
  comments: Comment[];
}

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

  // 에디터 상태 업데이트 시 커서 위치 감지
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

  // 코멘트가 있는 라인을 표시하기 위한 익스텐션 (선택 사항)
  // 여기서는 간단히 구현 범위 내에서 "클릭 시 라인 전달"에 집중합니다.

  if (!filePath) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground bg-muted/10">
        Select a file to view code
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-destructive gap-2">
        <FileX className="h-8 w-8" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden border-r bg-white text-sm relative flex flex-col">
      <div className="bg-muted/30 px-4 py-2 border-b text-xs font-mono text-muted-foreground shrink-0">
        {filePath}
      </div>
      <div className="flex-1 overflow-auto">
        <CodeMirror
          value={code}
          height="100%"
          extensions={[
            javascript({ jsx: true, typescript: true }),
            EditorView.lineWrapping,
          ]}
          readOnly={true} // 읽기 전용이지만 선택(Selection)은 가능해야 함
          editable={false}
          theme="light"
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
