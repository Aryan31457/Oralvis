import React, { useRef, useState } from 'react';
import { FaSquare, FaCircle, FaArrowRight, FaPencilAlt, FaSlash, FaFont, FaEraser, FaFillDrip } from 'react-icons/fa';

const tools = [
  { key: 'rectangle', icon: <FaSquare />, label: 'Rectangle' },
  { key: 'circle', icon: <FaCircle />, label: 'Circle' },
  { key: 'arrow', icon: <FaArrowRight />, label: 'Arrow' },
  { key: 'freehand', icon: <FaPencilAlt />, label: 'Freehand' },
  { key: 'line', icon: <FaSlash />, label: 'Line' },
  { key: 'text', icon: <FaFont />, label: 'Text' },
  { key: 'eraser', icon: <FaEraser />, label: 'Eraser' },
  { key: 'fill', icon: <FaFillDrip />, label: 'Fill' }
];
const colors = ['#1976d2', '#d32f2f', '#388e3c', '#fbc02d', '#000', '#fff', '#e91e63', '#00bcd4', '#8bc34a', '#ff9800', '#795548', '#607d8b'];

function AnnotationCanvas({ imageUrl, onSave }) {
  const canvasRef = useRef(null);
  const [tool, setTool] = useState('rectangle');
  const [color, setColor] = useState('#1976d2');
  const [drawing, setDrawing] = useState(false);
  const [shapes, setShapes] = useState([]);
  const [start, setStart] = useState(null);
  const [thickness, setThickness] = useState(2);
  const [textInput, setTextInput] = useState('');

  // Draw image and shapes
  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new window.Image();
    img.src = imageUrl;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      shapes.forEach(shape => drawShape(ctx, shape));
    };
  }, [imageUrl, shapes]);

  function drawShape(ctx, shape) {
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = shape.thickness || thickness;
    ctx.fillStyle = shape.color;
    if (shape.tool === 'rectangle') {
      ctx.strokeRect(shape.x, shape.y, shape.w, shape.h);
    } else if (shape.tool === 'circle') {
      ctx.beginPath();
      ctx.arc(shape.x, shape.y, shape.r, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (shape.tool === 'arrow') {
      ctx.beginPath();
      ctx.moveTo(shape.x1, shape.y1);
      ctx.lineTo(shape.x2, shape.y2);
      ctx.stroke();
      // Arrow head
      const angle = Math.atan2(shape.y2-shape.y1, shape.x2-shape.x1);
      ctx.beginPath();
      ctx.moveTo(shape.x2, shape.y2);
      ctx.lineTo(shape.x2-10*Math.cos(angle-Math.PI/6), shape.y2-10*Math.sin(angle-Math.PI/6));
      ctx.lineTo(shape.x2-10*Math.cos(angle+Math.PI/6), shape.y2-10*Math.sin(angle+Math.PI/6));
      ctx.lineTo(shape.x2, shape.y2);
      ctx.fillStyle = shape.color;
      ctx.fill();
    } else if (shape.tool === 'freehand') {
      ctx.beginPath();
      ctx.moveTo(shape.points[0].x, shape.points[0].y);
      shape.points.forEach(pt => ctx.lineTo(pt.x, pt.y));
      ctx.stroke();
    } else if (shape.tool === 'line') {
      ctx.beginPath();
      ctx.moveTo(shape.x1, shape.y1);
      ctx.lineTo(shape.x2, shape.y2);
      ctx.stroke();
    } else if (shape.tool === 'text') {
      ctx.font = `${shape.thickness * 8 || 16}px Arial`;
      ctx.fillText(shape.text, shape.x, shape.y);
    } else if (shape.tool === 'eraser') {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(shape.x, shape.y, shape.thickness || thickness, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    } else if (shape.tool === 'fill') {
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = shape.color;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.restore();
    }
  }

  function handleMouseDown(e) {
    setDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStart({ x, y });
    if (tool === 'freehand') {
      setShapes([...shapes, { tool, color, thickness, points: [{ x, y }] }]);
    } else if (tool === 'eraser') {
      setShapes([...shapes, { tool, color: '#fff', thickness, x, y }]);
    } else if (tool === 'fill') {
      setShapes([...shapes, { tool, color }]);
      setDrawing(false);
    } else if (tool === 'text') {
      if (textInput) {
        setShapes([...shapes, { tool, color, thickness, text: textInput, x, y }]);
        setTextInput('');
        setDrawing(false);
      }
    }
  }

  function handleMouseMove(e) {
    if (!drawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (tool === 'freehand') {
      setShapes(shapes => {
        const last = shapes[shapes.length - 1];
        last.points.push({ x, y });
        return [...shapes.slice(0, -1), last];
      });
    }
  }

  function handleMouseUp(e) {
    setDrawing(false);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (tool === 'rectangle' && start) {
      setShapes([...shapes, { tool, color, thickness, x: start.x, y: start.y, w: x - start.x, h: y - start.y }]);
    } else if (tool === 'circle' && start) {
      const r = Math.sqrt((x - start.x) ** 2 + (y - start.y) ** 2);
      setShapes([...shapes, { tool, color, thickness, x: start.x, y: start.y, r }]);
    } else if (tool === 'arrow' && start) {
      setShapes([...shapes, { tool, color, thickness, x1: start.x, y1: start.y, x2: x, y2: y }]);
    } else if (tool === 'line' && start) {
      setShapes([...shapes, { tool, color, thickness, x1: start.x, y1: start.y, x2: x, y2: y }]);
    }
    setStart(null);
  }

  function handleSave() {
    const canvas = canvasRef.current;
    let annotatedImage = null;
    try {
      annotatedImage = canvas.toDataURL('image/png');
      onSave({ shapes, annotatedImage });
    } catch (err) {
      alert('Error: Unable to save annotation. Please ensure the image is loaded from the backend and CORS is enabled.');
    }
  }

  function handleClear() {
    setShapes([]);
  }

  // Floating draggable toolbar
  const [toolbarPos, setToolbarPos] = useState({ x: 40, y: 40 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);

  function handleToolbarMouseDown(e) {
    setDragging(true);
    setDragStart({ x: e.clientX - toolbarPos.x, y: e.clientY - toolbarPos.y });
  }
  function handleToolbarMouseMove(e) {
    if (!dragging) return;
    setToolbarPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }
  function handleToolbarMouseUp() {
    setDragging(false);
  }
  React.useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleToolbarMouseMove);
      window.addEventListener('mouseup', handleToolbarMouseUp);
    } else {
      window.removeEventListener('mousemove', handleToolbarMouseMove);
      window.removeEventListener('mouseup', handleToolbarMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleToolbarMouseMove);
      window.removeEventListener('mouseup', handleToolbarMouseUp);
    };
  }, [dragging]);

  return (
    <div style={{ marginTop: 16, position: 'relative' }}>
      <div
        className="annotation-toolbar"
        style={{
          position: 'absolute',
          left: toolbarPos.x,
          top: toolbarPos.y,
          zIndex: 10,
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(25,118,210,0.12)',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: dragging ? 'grabbing' : 'grab',
          border: '2px solid #1976d2',
        }}
        onMouseDown={handleToolbarMouseDown}
      >
        {tools.map(t => (
          <button
            key={t.key}
            title={t.label}
            style={{
              background: tool === t.key ? '#1976d2' : '#eee',
              color: tool === t.key ? '#fff' : '#1976d2',
              border: 'none',
              borderRadius: 8,
              padding: '8px',
              fontSize: '1.2em',
              cursor: 'pointer',
              boxShadow: tool === t.key ? '0 2px 8px #1976d2' : 'none',
              transition: 'background 0.2s',
            }}
            onClick={e => { e.stopPropagation(); setTool(t.key); }}
          >{t.icon}</button>
        ))}
        <span style={{ marginLeft: 8 }}>Color:</span>
        {colors.map(c => (
          <button key={c} style={{ background: c, width: 24, height: 24, border: color === c ? '2px solid #1976d2' : '1px solid #ccc', marginRight: 4, borderRadius: 6 }} onClick={e => { e.stopPropagation(); setColor(c); }} />
        ))}
        <span style={{ marginLeft: 8 }}>Thickness:</span>
        <input type="range" min={1} max={12} value={thickness} onChange={e => setThickness(Number(e.target.value))} style={{ width: 60, marginRight: 8 }} />
        {tool === 'text' && (
          <input type="text" placeholder="Text" value={textInput} onChange={e => setTextInput(e.target.value)} style={{ marginLeft: 8, borderRadius: 6, border: '1px solid #1976d2', padding: '4px 8px' }} />
        )}
        <button style={{ marginLeft: 8, background: '#d32f2f', color: '#fff', borderRadius: 8, padding: '8px' }} onClick={e => { e.stopPropagation(); handleClear(); }}>Clear</button>
      </div>
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        style={{ border: '2px solid #1976d2', background: '#fff', borderRadius: 12, marginTop: 40 }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <div style={{ marginTop: 12 }}>
        <button className="generate-btn" onClick={handleSave}>Save Annotation</button>
      </div>
    </div>
  );
}

export default AnnotationCanvas;
