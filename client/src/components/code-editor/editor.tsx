import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CodeEditorProps {
  initialCode: string;
  solution?: string;
  language?: string;
  title?: string;
  onRunCode?: (code: string) => void;
  onSubmit?: (code: string) => void;
  isCorrect?: boolean;
  showFullEditor?: boolean;
}

export function CodeEditor({
  initialCode,
  solution,
  language = "javascript",
  title = "Code Editor",
  onRunCode,
  onSubmit,
  isCorrect,
  showFullEditor = false
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  
  // For a real implementation, we would use a proper code editor like CodeMirror
  // This is a simplified version for demonstration
  
  // Update line numbers when code changes
  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');
  
  const handleRunCode = () => {
    setIsRunning(true);
    setOutput(null);
    
    // This is a simplified simulation
    setTimeout(() => {
      try {
        // In a real implementation, we would use a sandboxed environment
        // For now, just capture console.log outputs
        const logs: string[] = [];
        const originalLog = console.log;
        console.log = (...args) => {
          logs.push(args.join(' '));
        };
        
        // This is unsafe in a real application, but serves for demonstration
        // eslint-disable-next-line no-new-func
        new Function(code)();
        
        // Restore console.log
        console.log = originalLog;
        
        setOutput(logs.join('\n') || 'Code executed successfully, but produced no output.');
        onRunCode?.(code);
      } catch (error) {
        setOutput(`Error: ${(error as Error).message}`);
      } finally {
        setIsRunning(false);
      }
    }, 500);
  };
  
  const handleReset = () => {
    setCode(initialCode);
    setOutput(null);
  };
  
  const handleSubmit = () => {
    onSubmit?.(code);
  };
  
  // Focus the editor when it mounts
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);
  
  return (
    <Card className={`bg-zinc-900 rounded-lg shadow-sm ${showFullEditor ? 'h-full flex flex-col' : ''}`}>
      <div className="flex items-center px-4 py-2 bg-zinc-800 border-b border-zinc-700 rounded-t-lg">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="ml-4 text-sm text-gray-400">{title}</div>
      </div>
      
      <div className={`flex flex-col ${showFullEditor ? 'flex-grow' : ''}`}>
        <div className={`p-4 flex ${showFullEditor ? 'flex-grow' : ''}`}>
          <div className="w-8 text-right pr-2 text-gray-500 text-sm font-mono select-none">
            {lineNumbers}
          </div>
          <textarea
            ref={editorRef}
            className="flex-1 bg-transparent border-0 text-sm font-mono text-gray-300 resize-none outline-none"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{ 
              fontFamily: 'JetBrains Mono, monospace',
              minHeight: showFullEditor ? '300px' : `${lineCount * 1.5}em`
            }}
            spellCheck={false}
            data-language={language}
          />
        </div>
        
        {output !== null && (
          <div className="px-4 py-3 bg-zinc-800 border-t border-zinc-700">
            <div className="text-sm font-mono text-gray-300 whitespace-pre-wrap">
              <div className="text-gray-500 mb-1">// Output</div>
              {output}
            </div>
          </div>
        )}
        
        {showHint && solution && (
          <div className="px-4 py-3 bg-zinc-800 border-t border-zinc-700">
            <div className="text-sm font-mono text-gray-300">
              <div className="text-gray-500 mb-1">// Hint</div>
              {solution}
            </div>
          </div>
        )}
      </div>
      
      <div className="px-4 py-3 bg-zinc-800 border-t border-zinc-700 rounded-b-lg flex justify-between">
        <div>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleReset}
            className="text-xs"
          >
            <i className="ri-refresh-line mr-1"></i> Reset
          </Button>
        </div>
        <div>
          {solution && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowHint(!showHint)}
              className="text-xs mr-2"
            >
              <i className="ri-question-line mr-1"></i> {showHint ? 'Hide Hint' : 'Hint'}
            </Button>
          )}
          
          <Button
            size="sm"
            variant="secondary"
            onClick={handleRunCode}
            disabled={isRunning}
            className="text-xs mr-2"
          >
            {isRunning ? (
              <>
                <i className="ri-loader-2-line animate-spin mr-1"></i> Running...
              </>
            ) : (
              <>
                <i className="ri-play-line mr-1"></i> Run Code
              </>
            )}
          </Button>
          
          {onSubmit && (
            <Button
              size="sm"
              variant={isCorrect ? "secondary" : "default"}
              onClick={handleSubmit}
              className="text-xs"
            >
              {isCorrect ? (
                <>
                  <i className="ri-check-line mr-1"></i> Correct!
                </>
              ) : (
                <>
                  <i className="ri-check-double-line mr-1"></i> Submit
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
