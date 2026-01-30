import React, { useRef, useEffect, useState, forwardRef } from 'react';
import './index.css';

const Canvas = forwardRef(({ tool, color, strokeWidth, currentUser }, ref) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = container.clientWidth * dpr;
      canvas.height = container.clientHeight * dpr;
      canvas.style.width = container.clientWidth + 'px';
      canvas.style.height = container.clientHeight + 'px';

      const context = canvas.getContext('2d');
      context.scale(dpr, dpr);
      context.lineCap = 'round';
      context.lineJoin = 'round';
      
      contextRef.current = context;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.addEventListener('resize', resizeCanvas);
    };
  }, []);

  // Get mouse position
  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  // Start drawing
  const startDrawing = (pos) => {
    setIsDrawing(true);
    setLastPosition(pos);

    const context = contextRef.current;
    context.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    context.lineWidth = strokeWidth;
    context.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
    
    context.beginPath();
    context.moveTo(pos.x, pos.y);
  };

  // Draw
  const draw = (pos) => {
    if (!isDrawing) return;

    const context = contextRef.current;
    context.lineTo(pos.x, pos.y);
    context.stroke();

    setLastPosition(pos);
  };

  // Stop drawing
  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const context = contextRef.current;
    context.beginPath();
  };

  // Mouse event handlers
  const handleMouseDown = (e) => {
    const pos = getMousePos(e);
    startDrawing(pos);
  };

  const handleMouseMove = (e) => {
    const pos = getMousePos(e);
    draw(pos);
  };

  const handleMouseUp = () => {
    stopDrawing();
  };

  const handleMouseLeave = () => {
    if (isDrawing) {
      stopDrawing();
    }
  };

  return (
    <div className="canvas-wrapper">
      <canvas
        ref={canvasRef}
        className="drawing-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
});

export default Canvas;