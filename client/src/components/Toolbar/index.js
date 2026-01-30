import React, { useState } from 'react';
import './index.css';

const Toolbar = ({ 
  tool, 
  color, 
  strokeWidth, 
  onToolChange, 
  onColorChange, 
  onStrokeWidthChange
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  const presetColors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'
  ];

  const tools = [
    { id: 'brush', icon: '✏️', label: 'Brush' },
    { id: 'eraser', icon: '🧹', label: 'Eraser' }
  ];

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <h3>Tools</h3>
        <div className="tool-buttons">
          {tools.map(t => (
            <button
              key={t.id}
              className={`tool-btn ${tool === t.id ? 'active' : ''}`}
              onClick={() => onToolChange(t.id)}
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
          />
          {showColorPicker && (
            <div className="color-picker">
              <div className="color-grid">
                {presetColors.map(c => (
                  <button
                    key={c}
                    className={`color-btn ${color === c ? 'selected' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => {
                      onColorChange(c);
                      setShowColorPicker(false);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="toolbar-section">
        <h3>Stroke Width</h3>
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
    </div>
  );
};

export default Toolbar;