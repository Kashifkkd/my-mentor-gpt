'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LiveCollaboration } from './live-collaboration';

interface DrawingElement {
  id: string;
  type: 'line' | 'rectangle' | 'circle' | 'text';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  strokeWidth: number;
}

export function CollaborationCanvas({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'pen' | 'rectangle' | 'circle'>('pen');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentElement, setCurrentElement] = useState<DrawingElement | null>(null);

  // Get assistant type from URL
  const assistantType = searchParams.get('assistant');

  const handleBack = () => {
    const baseUrl = conversationId ? `/chat/${conversationId}` : '/chat';
    const url = assistantType ? `${baseUrl}?assistant=${assistantType}` : baseUrl;
    router.push(url);
    // Remove tab param to return to chat
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    setIsDrawing(true);
    setStartPos(pos);

    if (currentTool === 'pen') {
      // Start a new line
      const newElement: DrawingElement = {
        id: Date.now().toString(),
        type: 'line',
        x1: pos.x,
        y1: pos.y,
        x2: pos.x,
        y2: pos.y,
        color: strokeColor,
        strokeWidth,
      };
      setCurrentElement(newElement);
      setElements((prev) => [...prev, newElement]);
    } else {
      // Start rectangle or circle
      const newElement: DrawingElement = {
        id: Date.now().toString(),
        type: currentTool === 'rectangle' ? 'rectangle' : 'circle',
        x1: pos.x,
        y1: pos.y,
        x2: pos.x,
        y2: pos.y,
        color: strokeColor,
        strokeWidth,
      };
      setCurrentElement(newElement);
      setElements((prev) => [...prev, newElement]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;

    const pos = getMousePos(e);

    if (currentTool === 'pen') {
      // Update the last line
      setElements((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last && last.type === 'line') {
          last.x2 = pos.x;
          last.y2 = pos.y;
        }
        return updated;
      });
    } else {
      // Update rectangle or circle
      setElements((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last) {
          last.x2 = pos.x;
          last.y2 = pos.y;
        }
        return updated;
      });
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setStartPos(null);
    setCurrentElement(null);
  };

  const clearCanvas = () => {
    setElements([]);
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all elements
    elements.forEach((element) => {
      ctx.strokeStyle = element.color;
      ctx.lineWidth = element.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (element.type === 'line') {
        ctx.beginPath();
        ctx.moveTo(element.x1, element.y1);
        ctx.lineTo(element.x2, element.y2);
        ctx.stroke();
      } else if (element.type === 'rectangle') {
        const x = Math.min(element.x1, element.x2);
        const y = Math.min(element.y1, element.y2);
        const width = Math.abs(element.x2 - element.x1);
        const height = Math.abs(element.y2 - element.y1);
        ctx.strokeRect(x, y, width, height);
      } else if (element.type === 'circle') {
        const centerX = (element.x1 + element.x2) / 2;
        const centerY = (element.y1 + element.y2) / 2;
        const radiusX = Math.abs(element.x2 - element.x1) / 2;
        const radiusY = Math.abs(element.y2 - element.y1) / 2;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });
  }, [elements]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      draw();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [draw]);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="h-8 px-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Chat
          </Button>
          <div className="h-4 w-px bg-border" />
          <h2 className="text-sm font-semibold">Collaboration Canvas</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearCanvas}
            className="h-8"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
          <Button variant="outline" size="sm" className="h-8">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b bg-card px-4 py-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant={currentTool === 'pen' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentTool('pen')}
              className="h-8"
            >
              Pen
            </Button>
            <Button
              variant={currentTool === 'rectangle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentTool('rectangle')}
              className="h-8"
            >
              Rectangle
            </Button>
            <Button
              variant={currentTool === 'circle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentTool('circle')}
              className="h-8"
            >
              Circle
            </Button>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Color:</label>
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="h-8 w-16 rounded border"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Width:</label>
            <input
              type="range"
              min="1"
              max="10"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-xs text-muted-foreground w-8">{strokeWidth}</span>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden bg-[radial-gradient(var(--color-secondary),transparent_1px)]" style={{ backgroundSize: '16px 16px' }}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        
        {/* Live Collaboration Overlay */}
        <LiveCollaboration
          conversationId={conversationId}
          currentUserId="current-user"
          currentUserName="You"
          currentUserAvatar="https://github.com/dovazencot.png"
          enabled={true}
        />
      </div>
    </div>
  );
}

