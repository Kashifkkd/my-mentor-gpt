'use client';

import { Button } from '@/components/ui/button';
import { MessageSquare, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface TextSelectionPopupProps {
  text: string;
  rects: DOMRect[];
  isOpen?: boolean;
  onSend: (text: string) => void;
  onClose: () => void;
}

export function TextSelectionPopup({
  text,
  rects,
  isOpen = false,
  onSend,
  onClose,
}: TextSelectionPopupProps) {
  // Initialize position from first rect if available
  const initialPosition = rects.length > 0
    ? {
        x: rects[0].left + rects[0].width / 2,
        y: rects[0].top - 10,
      }
    : { x: 0, y: 0 };

  const [adjustedPosition, setAdjustedPosition] = useState(initialPosition);
  const [isAbove, setIsAbove] = useState(true);
  const popupRef = useRef<HTMLDivElement>(null);



  useEffect(() => {
    if (!isOpen || rects.length === 0) return;

    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      if (!popupRef.current) return;

      const popup = popupRef.current;
      const popupRect = popup.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Use the first rect for positioning
      const selectionRect = rects[0];
      let x = selectionRect.left + selectionRect.width / 2;
      let y = selectionRect.top;

      // Adjust horizontal position if popup would overflow
      const popupWidth = popupRect.width || 200; // Fallback width
      if (x + popupWidth / 2 > viewportWidth) {
        x = viewportWidth - popupWidth / 2 - 10;
      } else if (x - popupWidth / 2 < 0) {
        x = popupWidth / 2 + 10;
      }

      // Adjust vertical position - prefer above, but show below if not enough space
      const spaceAbove = selectionRect.top;
      const spaceBelow = viewportHeight - selectionRect.bottom;
      const popupHeight = popupRect.height || 50; // Fallback height

      let positionAbove = true;
      if (spaceAbove < popupHeight + 20 && spaceBelow > popupHeight + 20) {
        // Show below the selection
        y = selectionRect.bottom + 10;
        positionAbove = false;
      } else {
        // Show above the selection (default)
        y = selectionRect.top - 10;
        positionAbove = true;
      }

      setIsAbove(positionAbove);
      setAdjustedPosition({ x, y });
    });
  }, [rects, isOpen]);

  const handleSend = () => {
    onSend(text.trim());
    onClose();
  };

  const popupContent = (
    <div
      ref={popupRef}
      data-text-selection-popup
      className="fixed z-[99999] flex items-center gap-1 bg-background border border-border rounded-lg shadow-lg px-1 py-1 animate-in fade-in-0 zoom-in-95 duration-200"
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
        transform: isAbove ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
        pointerEvents: 'auto',
      }}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSend}
        className="h-8 px-3 text-xs font-medium hover:bg-accent"
      >
        <MessageSquare className="size-3.5 mr-1.5" />
        Ask about this
      </Button>
      <div className="h-6 w-px bg-border" />
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="h-8 w-8 p-0 hover:bg-accent"
      >
        <X className="size-3.5" />
      </Button>
      {/* Arrow pointing to selection */}
      {isAbove ? (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-border" />
      ) : (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-transparent border-b-border" />
      )}
    </div>
  );

  // Use portal to render outside the chat container
  if (typeof window === 'undefined') {
    return null;
  }

  if (!isOpen || !text.trim() || rects.length === 0) {
    return null;
  }

  return createPortal(popupContent, document.body);
}

