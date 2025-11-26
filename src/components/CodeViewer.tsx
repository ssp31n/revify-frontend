import React, { useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { sessionsApi } from "@/lib/sessionsApi";
import { Loader2, FileX } from "lucide-react";

interface CodeViewerProps {
  sessionId: string;
  filePath: string | null;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ sessionId, filePath }) => {
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
    <div className="h-full overflow-hidden border rounded-md bg-white text-sm relative">
      {/* 파일 경로 헤더 */}
      <div className="bg-muted/30 px-4 py-2 border-b text-xs font-mono text-muted-foreground">
        {filePath}
      </div>
      <div className="h-[calc(100%-33px)] overflow-auto">
        <CodeMirror
          value={code}
          height="100%"
          extensions={[javascript({ jsx: true, typescript: true })]}
          readOnly={true}
          editable={false}
          theme="light"
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            highlightActiveLine: true,
          }}
        />
      </div>
    </div>
  );
};

export default CodeViewer;
