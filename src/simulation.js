// ─── simulation.js ────────────────────────────────────────────────────────────
// Vai trò: Viewport kính hiển vi ảo – hiển thị ảnh tiêu bản thật từ Cloudinary
//          với mô phỏng quang học (zoom, blur, pan, vignette, reticle, scale bar).
//          Chứa: toolbar controls, vòng tròn thị kính, thanh trạng thái.
// KHÔNG chứa: data tiêu bản (xem slides.js), URL ảnh (xem images.js),
//             info panel (xem info.js).
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useEffect, useRef } from "react";
import { buildOpticalUrl, getClientScale } from "./images.js";
import { ObjectiveSelector, EyepieceSelector, RotaryKnob } from "./controls.js";

// ─── Theme tokens ──────────────────────────────────────────────────────────
const T = {
  bg: "#f5f4f1",
  surface: "#ffffff",
  surfaceAlt: "#f0efec",
  border: "#dedad4",
  text: "#1a1917",
  textMuted: "#6b6760",
  textFaint: "#a8a49e",
  green: "#1a7a42",
  orange: "#c45c10",
};

// ─── SlideImage ────────────────────────────────────────────────────────────
// Renders ảnh Cloudinary thật với CSS transform cho pan.
// Key = `${slide.id}-${objective}` để force reload khi đổi tiêu bản/vật kính.

function SlideImage({ slide, objective, focusLevel, pan, imgSizeRef }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const prevSlideId = useRef(null);

  useEffect(() => {
    if (prevSlideId.current !== slide?.id) {
      setLoaded(false);
      setError(false);
      if (imgSizeRef) imgSizeRef.current = { w: 0, h: 0 };
      prevSlideId.current = slide?.id;
    }
  }, [slide?.id]);

  const blur = Math.abs(focusLevel);
  const scale = getClientScale(objective, slide?.defaultObjective);
  const url = slide?.imageUrl ?? null;

  const handleLoad = (e) => {
    setLoaded(true);
    if (imgSizeRef)
      imgSizeRef.current = {
        w: e.target.naturalWidth,
        h: e.target.naturalHeight,
      };
  };

  return (
    <div style={{ position: "absolute", inset: 0, background: "#1a1a1a" }}>
      {/* Loading shimmer */}
      {!loaded && !error && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f2f1ee",
          }}
        >
          <span
            style={{
              color: T.textFaint,
              fontSize: "10px",
              fontFamily: "monospace",
            }}
          >
            Loading…
          </span>
        </div>
      )}

      {/* Real image */}
      {url && !error && (
        <img
          src={url}
          alt={slide.nameVi}
          onLoad={handleLoad}
          onError={() => setError(true)}
          draggable={false}
          style={{
            position: "absolute",
            height: `${scale * 100}%`,
            width: "auto",
            minWidth: "100%",
            top: "50%",
            left: "50%",
            transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px))`,
            filter:
              blur > 0
                ? `blur(${blur * 2.2}px) brightness(${(100 - blur * 6) / 100})`
                : "none",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.3s ease, filter 0.1s",
            willChange: "filter, transform",
            userSelect: "none",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Fallback */}
      {error && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "28px" }}>🔬</span>
          <span
            style={{
              color: T.textFaint,
              fontSize: "10px",
              fontFamily: "monospace",
            }}
          >
            {slide?.nameVi}
          </span>
          <span
            style={{
              color: T.textFaint,
              fontSize: "9px",
              fontFamily: "monospace",
            }}
          >
            Image unavailable
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Simulation (main export) ──────────────────────────────────────────────
export default function Simulation({
  objective,
  eyepiece,
  focusLevel,
  slide,
  pan,
  onPan,
  onObjectiveChange,
  onEyepieceChange,
  onFocusChange,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imgSizeRef = useRef({ w: 0, h: 0 });

  const totalMag =
    parseInt(objective.replace("x", ""), 10) *
    parseInt(eyepiece.replace("x", ""), 10);
  const inFocus = focusLevel === 0;
  const blur = Math.abs(focusLevel);
  const aperture = { x4: 0.1, x10: 0.25, x40: 0.65 }[objective] ?? 0.25;
  const dof = (1 / (aperture * aperture * totalMag * 0.01)).toFixed(1);
  const scaleLbl =
    slide?.scaleBars?.[objective] ??
    (totalMag <= 40 ? "500 μm" : totalMag <= 100 ? "200 μm" : "50 μm");

  // ── Pan handlers ──────────────────────────────────────────────────────
  const handleMouseDown = useCallback(
    (e) => {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      e.preventDefault();
    },
    [pan]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const scale = getClientScale(objective, slide?.defaultObjective);
      const { w, h } = imgSizeRef.current;

      // Tính giới hạn pan:
      // - Chiều cao ảnh render = scale * circleDiameter (px)
      // - Chiều rộng ảnh render = scale * circleDiameter * (w/h)
      // - Pan limit X = (renderWidth - circleDiameter) / 2
      // - Pan limit Y = (renderHeight - circleDiameter) / 2
      // Dùng tỷ lệ ảnh để tính; nếu chưa có size thì dùng fallback
      const aspectRatio = w && h ? w / h : 16 / 9;
      const renderW = scale * aspectRatio; // relative to circle diameter = 1.0
      const renderH = scale;

      // Convert to px assuming circle ~600px (sẽ scale theo tỷ lệ)
      const circlePx = 600;
      const limX = Math.max(0, ((renderW - 1) * circlePx) / 2);
      const limY = Math.max(0, ((renderH - 1) * circlePx) / 2);

      onPan({
        x: Math.max(-limX, Math.min(limX, e.clientX - dragStart.x)),
        y: Math.max(-limY, Math.min(limY, e.clientY - dragStart.y)),
      });
    },
    [isDragging, dragStart, objective, slide, onPan]
  );

  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      onFocusChange((prev) =>
        Math.max(-5, Math.min(5, prev + (e.deltaY > 0 ? 1 : -1)))
      );
    },
    [onFocusChange]
  );

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: T.bg,
        minWidth: 0,
      }}
    >
      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "20px",
          padding: "12px 20px",
          borderBottom: `1px solid ${T.border}`,
          background: T.surface,
          flexWrap: "wrap",
        }}
      >
        <ObjectiveSelector
          value={objective}
          onChange={onObjectiveChange}
          minObjective={slide?.defaultObjective ?? "x4"}
        />

        <div
          style={{
            width: "1px",
            height: "64px",
            background: T.border,
            flexShrink: 0,
          }}
        />

        <EyepieceSelector value={eyepiece} onChange={onEyepieceChange} />

        <div style={{ flex: 1 }} />

        {/* Magnification badge */}
        <div
          style={{
            background: T.surfaceAlt,
            border: `1.5px solid ${T.border}`,
            borderRadius: "8px",
            padding: "8px 18px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span
            style={{
              color: T.textFaint,
              fontSize: "10px",
              fontFamily: "monospace",
            }}
          >
            ĐỘ PHÓNG ĐẠI
          </span>
          <span
            style={{
              color: T.text,
              fontWeight: 800,
              fontSize: "22px",
              fontFamily: "monospace",
            }}
          >
            ×{totalMag}
          </span>
        </div>
      </div>

      {/* ── Viewport + Knob ──────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* Left: viewport area */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
            background: T.bg,
          }}
        >
          {/* ── Microscope circle ── */}
          <div
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onWheel={handleWheel}
            style={{
              position: "relative",
              width: "min(680px, calc(100vh - 180px), 88vw)",
              aspectRatio: "1",
              borderRadius: "50%",
              overflow: "hidden",
              cursor: isDragging ? "grabbing" : "grab",
              userSelect: "none",
              background: "#f8f8f6",
              // Multi-ring kính hiển vi frame
              boxShadow: [
                "0 0 0 5px #ece9e4",
                "0 0 0 7px #c4bfb7",
                "0 0 0 12px #ece9e4",
                "0 0 0 15px #a09890",
                "0 0 0 19px #d8d3cc",
                "0 6px 32px rgba(0,0,0,0.18)",
                `inset 0 0 50px rgba(0,0,0,${
                  blur > 0 ? 0.06 + blur * 0.03 : 0.03
                })`,
              ].join(", "),
            }}
          >
            {/* Real slide image */}
            <SlideImage
              slide={slide}
              objective={objective}
              focusLevel={focusLevel}
              pan={pan}
              imgSizeRef={imgSizeRef}
            />

            {/* Vignette – viền tối nhẹ như vật kính thật */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, transparent 52%, rgba(0,0,0,0.07) 72%, rgba(0,0,0,0.30) 100%)",
                pointerEvents: "none",
              }}
            />

            {/* Reticle crosshair + vòng đo */}
            <svg
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                opacity: 0.14,
              }}
              viewBox="0 0 500 500"
            >
              <line
                x1="250"
                y1="110"
                x2="250"
                y2="390"
                stroke="#223"
                strokeWidth="0.6"
              />
              <line
                x1="110"
                y1="250"
                x2="390"
                y2="250"
                stroke="#223"
                strokeWidth="0.6"
              />
              <circle
                cx="250"
                cy="250"
                r="75"
                fill="none"
                stroke="#223"
                strokeWidth="0.5"
              />
              <circle
                cx="250"
                cy="250"
                r="148"
                fill="none"
                stroke="#223"
                strokeWidth="0.35"
              />
            </svg>

            {/* Out-of-focus label */}
            {!inFocus && (
              <div
                style={{
                  position: "absolute",
                  bottom: "13%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  color: T.orange,
                  fontSize: "10px",
                  fontFamily: "monospace",
                  background: "rgba(255,255,255,0.88)",
                  padding: "3px 12px",
                  borderRadius: "4px",
                  border: `1px solid ${T.orange}55`,
                  letterSpacing: "0.14em",
                  pointerEvents: "none",
                  opacity: Math.max(0.35, 1 - blur * 0.1),
                }}
              >
                OUT OF FOCUS
              </div>
            )}
          </div>

          {/* Scale bar */}
          <div
            style={{
              position: "absolute",
              bottom: "26px",
              right: "calc(50% - min(226px, 32vw))",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              pointerEvents: "none",
            }}
          >
            <div style={{ width: "48px", height: "2px", background: T.text }} />
            <span
              style={{
                color: T.text,
                fontSize: "9px",
                fontFamily: "monospace",
              }}
            >
              {scaleLbl}
            </span>
          </div>
        </div>

        {/* Right: focus knob */}
        <div
          style={{
            width: "104px",
            background: T.surface,
            borderLeft: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <RotaryKnob value={focusLevel} onChange={onFocusChange} />
        </div>
      </div>

      {/* ── Status bar ───────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "6px 18px",
          borderTop: `1px solid ${T.border}`,
          background: T.surface,
          fontSize: "10px",
          flexWrap: "wrap",
        }}
      >
        <StatusItem label="Tiêu bản" val={slide?.nameVi} color={slide?.color} />
        <StatusItem label="Loài" val={slide?.species} />
        <StatusItem label="Vật kính" val={objective} />
        <StatusItem label="Thị kính" val={eyepiece} />
        <StatusItem label="DoF" val={`${dof} μm`} />
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: inFocus ? T.green : T.orange,
            }}
          />
          <span
            style={{
              color: inFocus ? T.green : T.orange,
              fontFamily: "monospace",
            }}
          >
            {inFocus
              ? "IN FOCUS"
              : `Z = ${focusLevel > 0 ? "+" : ""}${focusLevel}`}
          </span>
        </div>
        <span
          style={{
            color: T.textFaint,
            fontFamily: "monospace",
            fontSize: "9px",
          }}
        >
          KÉO=DI CHUYỂN · SCROLL=LẤY NÉT
        </span>
      </div>
    </div>
  );
}

function StatusItem({ label, val, color }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "5px",
        fontFamily: "monospace",
        fontSize: "10px",
      }}
    >
      <span style={{ color: T.textFaint }}>{label}:</span>
      <span style={{ color: color ?? T.text, fontWeight: 600 }}>{val}</span>
    </div>
  );
}
