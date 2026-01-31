import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import "./index.css";

const Canvas = forwardRef(
  ({ socket, tool, color, strokeWidth, currentUser }, ref) => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
    const [drawingHistory, setDrawingHistory] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const [currentPath, setCurrentPath] = useState([]);
    const [remoteCursors, setRemoteCursors] = useState(new Map());
    const cursorTimeouts = useRef(new Map());
    const animationFrameId = useRef(null);
    const lastEmitTime = useRef(0);
    const EMIT_THROTTLE = 16;

    const redrawCanvas = useCallback(() => {
      const context = contextRef.current;
      if (!context) return;

      const canvas = canvasRef.current;
      const dpr = window.devicePixelRatio || 1;

      context.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      context.save();
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      context.restore();

      drawingHistory.forEach((operation) => {
        drawOperation(operation);
      });
    }, [drawingHistory]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const resizeCanvas = () => {
        const container = canvas.parentElement;
        const dpr = window.devicePixelRatio || 1;

        canvas.width = container.clientWidth * dpr;
        canvas.height = container.clientHeight * dpr;
        canvas.style.width = container.clientWidth + "px";
        canvas.style.height = container.clientHeight + "px";

        const context = canvas.getContext("2d", {
          alpha: true,
        });

        context.scale(dpr, dpr);
        context.lineCap = "round";
        context.lineJoin = "round";
        contextRef.current = context;

        redrawCanvas();
      };

      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);

      const frameId = animationFrameId.current;

      return () => {
        window.removeEventListener("resize", resizeCanvas);
        if (frameId) {
          cancelAnimationFrame(frameId);
        }
      };
    }, [redrawCanvas]);

    const drawOperation = (operation) => {
      const context = contextRef.current;
      if (!context || !operation.path || operation.path.length < 1) return;

      context.save();
      context.beginPath();

      context.strokeStyle =
        operation.tool === "eraser" ? "#ffffff" : operation.color;
      context.lineWidth = operation.strokeWidth;
      context.globalCompositeOperation = "source-over";

      const path = operation.path;
      context.moveTo(path[0].x, path[0].y);

      if (path.length === 1) {
        context.lineTo(path[0].x, path[0].y);
      } else {
        for (let i = 1; i < path.length; i++) {
          const midX = (path[i - 1].x + path[i].x) / 2;
          const midY = (path[i - 1].y + path[i].y) / 2;
          context.quadraticCurveTo(path[i - 1].x, path[i - 1].y, midX, midY);
        }
        context.lineTo(path[path.length - 1].x, path[path.length - 1].y);
      }

      context.stroke();
      context.restore(); // Restore state
    };

    const getMousePos = (e) => {
      const rect = canvasRef.current.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const getTouchPos = (e) => {
      const rect = canvasRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    };

    const startDrawing = (pos) => {
      setIsDrawing(true);
      setLastPosition(pos);
      setCurrentPath([pos]);

      const context = contextRef.current;
      context.beginPath();
      context.moveTo(pos.x, pos.y);
    };

    const draw = (pos) => {
      if (!isDrawing) return;
      const context = contextRef.current;

      context.strokeStyle = tool === "eraser" ? "#ffffff" : color;
      context.lineWidth = strokeWidth;

      context.lineTo(pos.x, pos.y);
      context.stroke();

      setCurrentPath((prev) => [...prev, pos]);

      const now = Date.now();
      if (socket && now - lastEmitTime.current > EMIT_THROTTLE) {
        socket.emit("draw", {
          type: "drawing",
          tool,
          color: tool === "eraser" ? "#ffffff" : color,
          strokeWidth,
          path: [lastPosition, pos],
        });
        lastEmitTime.current = now;
      }
      setLastPosition(pos);
    };

    const stopDrawing = () => {
      if (!isDrawing) return;
      setIsDrawing(false);

      if (currentPath.length > 0) {
        const operation = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: "path",
          tool,
          color: tool === "eraser" ? "#ffffff" : color,
          strokeWidth,
          path: currentPath,
          userId: currentUser?.id,
          timestamp: Date.now(),
        };

        setDrawingHistory((prev) => [...prev, operation]);
        setRedoStack([]); // Clear redo stack
        if (socket) socket.emit("draw", operation);
      }
      setCurrentPath([]);
    };

    const undo = () => {
      if (drawingHistory.length === 0) return;
      const lastOp = drawingHistory[drawingHistory.length - 1];
      setRedoStack((prev) => [lastOp, ...prev]);
      setDrawingHistory((prev) => prev.slice(0, -1));
    };

    const redo = () => {
      if (redoStack.length === 0) return;
      const nextOp = redoStack[0];
      setRedoStack((prev) => prev.slice(1));
      setDrawingHistory((prev) => [...prev, nextOp]);
    };

    const handleMouseDown = (e) => startDrawing(getMousePos(e));
    const handleMouseMove = (e) => {
      const pos = getMousePos(e);
      if (isDrawing) draw(pos);
      if (socket && Date.now() - lastEmitTime.current > EMIT_THROTTLE) {
        socket.emit("cursor-move", pos);
      }
    };
    const handleMouseUp = () => stopDrawing();
    const handleMouseLeave = () => isDrawing && stopDrawing();
    const handleTouchStart = (e) => {
      e.preventDefault();
      startDrawing(getTouchPos(e));
    };
    const handleTouchMove = (e) => {
      e.preventDefault();
      draw(getTouchPos(e));
    };
    const handleTouchEnd = (e) => {
      e.preventDefault();
      stopDrawing();
    };

    const handleRemoteDraw = (drawData) => {
      if (drawData.type === "path" && drawData.path) {
        setDrawingHistory((prev) => {
          if (prev.find((op) => op.id === drawData.id)) {
            return prev;
          }
          return [...prev, drawData];
        });

        drawOperation(drawData);
      } else if (drawData.path) {
        drawOperation(drawData);
      }
    };

    const updateRemoteCursor = (cursorData) => {
      setRemoteCursors((prev) => {
        const newCursors = new Map(prev);
        newCursors.set(cursorData.userId, cursorData);
        return newCursors;
      });

      if (cursorTimeouts.current.has(cursorData.userId)) {
        clearTimeout(cursorTimeouts.current.get(cursorData.userId));
      }

      const timeout = setTimeout(() => {
        setRemoteCursors((prev) => {
          const newCursors = new Map(prev);
          newCursors.delete(cursorData.userId);
          return newCursors;
        });
        cursorTimeouts.current.delete(cursorData.userId);
      }, 1000);

      cursorTimeouts.current.set(cursorData.userId, timeout);
    };

    const handleRemoteUndo = (data) => {
      setDrawingHistory((prev) =>
        prev.filter((op) => op.id !== data.operationId),
      );
      setTimeout(() => redrawCanvas(), 0);
    };

    const handleRemoteRedo = (data) => {
      if (data.operation) {
        setDrawingHistory((prev) => [...prev, data.operation]);
        setTimeout(() => redrawCanvas(), 0);
      }
    };

    const clearCanvas = () => {
      setDrawingHistory([]);
      const context = contextRef.current;
      if (context) {
        const canvas = canvasRef.current;
        const dpr = window.devicePixelRatio || 1;
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      }
    };

    const downloadCanvas = () => {
      const canvas = canvasRef.current;
      const dataURL = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `canvas-${Date.now()}.png`;
      link.href = dataURL;
      link.click();
    };

    useImperativeHandle(ref, () => ({
      undo,
      redo,
      clearCanvas,
      downloadCanvas,
      handleRemoteDraw,
      updateRemoteCursor,
      handleRemoteUndo,
      handleRemoteRedo,
    }));

    return (
      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          className="drawing-canvas"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
        {Array.from(remoteCursors.values()).map((cursor) => (
          <div
            key={cursor.userId}
            className="remote-cursor"
            style={{ left: cursor.x, top: cursor.y, borderColor: cursor.color }}
          >
            <div
              className="cursor-label"
              style={{ backgroundColor: cursor.color }}
            >
              {cursor.username}
            </div>
          </div>
        ))}
      </div>
    );
  },
);

export default Canvas;
