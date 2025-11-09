import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * ImageViewer with zoom, pan, multi-image gallery, full screen, shimmer loader
 * @param {string[]} images
 * @param {number} currentIndex
 * @param {function} onChangeIndex
 */
export default function ImageViewer({ images, currentIndex, onChangeIndex }) {
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [lastPointerPos, setLastPointerPos] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const imageUrl = images[currentIndex];

  useEffect(() => {
    setLoading(true);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [imageUrl]);

  // Handle image loading success
  const onLoad = () => {
    setLoading(false);
  };

  // Wheel zoom
  const onWheel = useCallback(
    (e) => {
      e.preventDefault();
      const delta = e.deltaY || e.wheelDelta;
      const zoomStep = 0.1;
      setZoom((prevZoom) => {
        let newZoom = prevZoom - delta * zoomStep * 0.01;
        return clamp(newZoom, 1, 5);
      });
    },
    [setZoom]
  );

  // Pointer events for drag pan
  const onPointerDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setLastPointerPos({ x: e.clientX, y: e.clientY });
  };

  const onPointerMove = (e) => {
    if (!isDragging || !lastPointerPos) return;
    e.preventDefault();
    const dx = e.clientX - lastPointerPos.x;
    const dy = e.clientY - lastPointerPos.y;
    setOffset((prev) => ({
      x: clamp(prev.x + dx, -1000, 1000),
      y: clamp(prev.y + dy, -1000, 1000),
    }));
    setLastPointerPos({ x: e.clientX, y: e.clientY });
  };

  const onPointerUp = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setLastPointerPos(null);
  };

  // Touch pinch zoom and pan
  const pointerStateRef = useRef({
    pointers: [],
    initialDistance: null,
    initialZoom: 1,
    initialOffset: { x: 0, y: 0 },
    lastCenter: null,
  });

  const getDistance = (p1, p2) => {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
  };

  const getCenter = (p1, p2) => {
    return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
  };

  const onTouchStart = (e) => {
    const pointers = [];
    for (let i = 0; i < e.touches.length; i++) {
      pointers.push({ x: e.touches[i].clientX, y: e.touches[i].clientY });
    }
    pointerStateRef.current.pointers = pointers;

    if (pointers.length === 2) {
      pointerStateRef.current.initialDistance = getDistance(pointers[0], pointers[1]);
      pointerStateRef.current.initialZoom = zoom;
      pointerStateRef.current.initialOffset = offset;
      pointerStateRef.current.lastCenter = getCenter(pointers[0], pointers[1]);
    }
  };

  const onTouchMove = (e) => {
    e.preventDefault();
    const pointers = [];
    for (let i = 0; i < e.touches.length; i++) {
      pointers.push({ x: e.touches[i].clientX, y: e.touches[i].clientY });
    }
    const state = pointerStateRef.current;

    if (pointers.length === 2 && state.pointers.length === 2) {
      const newDistance = getDistance(pointers[0], pointers[1]);
      const scale = newDistance / state.initialDistance;
      const newZoom = clamp(state.initialZoom * scale, 1, 5);
      setZoom(newZoom);

      const newCenter = getCenter(pointers[0], pointers[1]);
      const dx = newCenter.x - state.lastCenter.x;
      const dy = newCenter.y - state.lastCenter.y;
      setOffset({
        x: clamp(state.initialOffset.x + dx, -1000, 1000),
        y: clamp(state.initialOffset.y + dy, -1000, 1000),
      });
    } else if (pointers.length === 1 && state.pointers.length === 1) {
      const dx = pointers[0].x - state.pointers[0].x;
      const dy = pointers[0].y - state.pointers[0].y;
      setOffset((prev) => ({
        x: clamp(prev.x + dx, -1000, 1000),
        y: clamp(prev.y + dy, -1000, 1000),
      }));
      pointerStateRef.current.pointers = pointers;
    }
  };

  const onTouchEnd = () => {
    pointerStateRef.current.pointers = [];
    pointerStateRef.current.initialDistance = null;
    pointerStateRef.current.lastCenter = null;
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Keyboard navigation for thumbnails
  const selectNext = () => {
    if (!images || images.length <= 1) return;
    onChangeIndex((currentIndex + 1) % images.length);
  };

  const selectPrev = () => {
    if (!images || images.length <= 1) return;
    onChangeIndex((currentIndex - 1 + images.length) % images.length);
  };

  // Preload next 2 images
  useEffect(() => {
    if (!images) return;
    [1, 2].forEach((offsetIdx) => {
      const idx = (currentIndex + offsetIdx) % images.length;
      const url = images[idx];
      const img = new Image();
      img.src = url;
    });
  }, [currentIndex, images]);

  return (
    <div
      ref={containerRef}
      className="relative bg-card rounded-lg overflow-hidden select-none touch-none max-h-[60vh] flex flex-col"
      tabIndex={0}
      aria-label="Image viewer"
    >
      <div
        className="flex-grow bg-black flex items-center justify-center overflow-hidden relative"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        style={{ touchAction: 'none' }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 shimmer" />
        )}
        <img
          ref={imgRef}
          src={imageUrl}
          alt={`Post image ${currentIndex + 1} of ${images.length}`}
          draggable={false}
          onLoad={onLoad}
          className={`transition-opacity duration-300 ${
            loading ? 'opacity-0' : 'opacity-100'
          } cursor-grab`}
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            userSelect: 'none',
            maxHeight: '60vh',
            maxWidth: '100%',
            touchAction: 'none',
          }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between bg-card p-2 text-textMuted text-sm select-none">
        <button
          type="button"
          onClick={selectPrev}
          className="p-1 rounded hover:bg-camoGreen hover:text-white focus:outline-none focus:ring-2 focus:ring-camoGreen"
          aria-label="Previous image"
          disabled={images.length <= 1}
        >
          ◀
        </button>
        <span aria-live="polite" aria-atomic="true" className="flex-1 text-center text-textPrimary">
          Image {currentIndex + 1} / {images.length}
        </span>
        <button
          type="button"
          onClick={selectNext}
          className="p-1 rounded hover:bg-camoGreen hover:text-white focus:outline-none focus:ring-2 focus:ring-camoGreen"
          aria-label="Next image"
          disabled={images.length <= 1}
        >
          ▶
        </button>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="ml-2 p-1 rounded hover:bg-camoGreen hover:text-white focus:outline-none focus:ring-2 focus:ring-camoGreen"
          aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex space-x-2 p-2 bg-card overflow-x-auto">
          {images.map((imgSrc, i) => (
            <button
              key={imgSrc}
              type="button"
              onClick={() => onChangeIndex(i)}
              aria-label={`Select image ${i + 1}`}
              className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 ${
                i === currentIndex ? 'border-camoGreen' : 'border-transparent'
              } focus:outline-none focus:ring-2 focus:ring-camoGreen`}
            >
              <img
                src={imgSrc}
                alt={`Thumbnail ${i + 1}`}
                className="object-cover w-full h-full"
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
