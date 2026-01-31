import React, { useState } from "react";
import "./index.css";

const Toolbar = ({
  tool,
  color,
  strokeWidth,
  onToolChange,
  onColorChange,
  onStrokeWidthChange,
  onUndo,
  onRedo,
  onClear,
  onSave,
  onDownload,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const presetColors = [
    "#000000",
    "#FFFFFF",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
    "#800080",
    "#FFC0CB",
    "#A52A2A",
    "#808080",
    "#00FF7F",
    "#FF1493",
  ];

  const tools = [
    { id: "brush", icon: "✏️", label: "Brush" },
    { id: "eraser", icon: "🧹", label: "Eraser" },
  ];

  const strokeSizes = [
    { value: 1, label: "Thin" },
    { value: 3, label: "Normal" },
    { value: 5, label: "Medium" },
    { value: 8, label: "Thick" },
    { value: 12, label: "Very Thick" },
  ];

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <h3>Tools</h3>
        <div className="tool-buttons">
          {tools.map((t) => (
            <button
              key={t.id}
              className={`tool-btn ${tool === t.id ? "active" : ""}`}
              onClick={() => onToolChange(t.id)}
              title={t.label}
            >
              <span className="tool-icon">{t.icon}</span>
              <span className="tool-label">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar-section">
        <h3>Color</h3>
        <div className="color-selector">
          <div
            className="current-color"
            style={{ backgroundColor: color }}
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Click to change color"
          />
          {showColorPicker && (
            <div className="color-picker">
              <div className="color-grid">
                {presetColors.map((c) => (
                  <button
                    key={c}
                    className={`color-btn ${color === c ? "selected" : ""}`}
                    style={{ backgroundColor: c }}
                    onClick={() => {
                      onColorChange(c);
                      setShowColorPicker(false);
                    }}
                    title={c}
                  />
                ))}
              </div>
              <div className="custom-color">
                <label>Custom:</label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => onColorChange(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="toolbar-section">
        <h3>Stroke Width</h3>
        <div className="stroke-selector">
          {strokeSizes.map((size) => (
            <button
              key={size.value}
              className={`stroke-btn ${strokeWidth === size.value ? "active" : ""}`}
              onClick={() => onStrokeWidthChange(size.value)}
              title={size.label}
            >
              <div
                className="stroke-preview"
                style={{
                  width: `${size.value * 2}px`,
                  height: `${size.value * 2}px`,
                  backgroundColor: color,
                }}
              />
            </button>
          ))}
        </div>
        <input
          type="range"
          min="1"
          max="20"
          value={strokeWidth}
          onChange={(e) => onStrokeWidthChange(parseInt(e.target.value))}
          className="stroke-slider"
        />
        <div className="stroke-value">{strokeWidth}px</div>
      </div>

      <div className="toolbar-section">
        <h3>Actions</h3>
        <div className="action-buttons">
          <button className="action-btn" onClick={onUndo} title="Undo (Ctrl+Z)">
            ↶ Undo
          </button>
          <button className="action-btn" onClick={onRedo} title="Redo (Ctrl+Y)">
            ↷ Redo
          </button>
          <button
            className="action-btn danger"
            onClick={onClear}
            title="Clear canvas"
          >
            🗑️ Clear
          </button>
          <button
            className="action-btn"
            onClick={onDownload}
            title="Download canvas"
          >
            💾 Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
