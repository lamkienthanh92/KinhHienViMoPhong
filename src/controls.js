// ─── controls.js ──────────────────────────────────────────────────────────────
// Vai trò: Các UI control vật lý của kính hiển vi:
//   • ObjectiveSelector – chọn vật kính x4 / x10 / x40 (hình trụ có tỷ lệ)
//   • EyepieceSelector  – chọn thị kính x10 / x8
//   • RotaryKnob        – ốc vi cấp thứ cấp (SVG tròn có mũi tên xoay)
// KHÔNG chứa: logic ảnh, state slide, layout chính.
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useEffect } from "react";

// ─── Shared tokens ─────────────────────────────────────────────────────────
const T = {
  border: "#dedad4",
  borderMid: "#c4bfb7",
  surface: "#ffffff",
  surfaceAlt: "#f0efec",
  textMuted: "#6b6760",
  textFaint: "#a8a49e",
  green: "#1a7a42",
  greenLight: "#e6f5ec",
  orange: "#c45c10",
};

// ─── ObjectiveSelector ─────────────────────────────────────────────────────
// Hiển thị 3 ống vật kính dạng hình trụ; chiều cao tỷ lệ thuận với phóng đại:
//   x4 = ngắn nhỏ, x10 = trung bình, x40 = cao và lớn nhất

const OBJECTIVES = [
  {
    id: "x4",
    label: "×4",
    tubeH: 26,
    tubeW: 11,
    color: "#1a7a42",
    desc: "Định hướng tổng thể",
  },
  {
    id: "x10",
    label: "×10",
    tubeH: 40,
    tubeW: 14,
    color: "#1d6fa4",
    desc: "Cấu trúc tổng quát",
  },
  {
    id: "x40",
    label: "×40",
    tubeH: 60,
    tubeW: 17,
    color: "#7c3aed",
    desc: "Chi tiết tế bào",
  },
];

const MAG = { x4: 4, x10: 10, x40: 40 };

export function ObjectiveSelector({ value, onChange, minObjective = "x4" }) {
  const minMag = MAG[minObjective] ?? 4;

  useEffect(() => {
    if (MAG[value] < minMag) onChange(minObjective);
  }, [value, minObjective, minMag, onChange]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <span
        style={{
          fontSize: "9px",
          color: T.textMuted,
          letterSpacing: "0.12em",
          fontFamily: "monospace",
          marginBottom: "2px",
        }}
      >
        VẬT KÍNH
      </span>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}>
        {OBJECTIVES.map((obj) => {
          const active = value === obj.id;
          const disabled = MAG[obj.id] < minMag;
          return (
            <div
              key={obj.id}
              onClick={() => !disabled && onChange(obj.id)}
              title={
                disabled
                  ? `Không khả dụng (ảnh gốc ${minObjective})`
                  : `${obj.label} – ${obj.desc}`
              }
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.22 : 1,
                transition: "opacity 0.15s",
              }}
            >
              {/* Ống vật kính */}
              <div
                style={{
                  width: `${active ? obj.tubeW + 3 : obj.tubeW}px`,
                  height: `${obj.tubeH}px`,
                  background: active ? obj.color : T.surfaceAlt,
                  border: `2px solid ${active ? obj.color : T.border}`,
                  borderRadius: "3px 3px 7px 7px",
                  transition: "all 0.18s",
                  boxShadow: active ? `0 2px 10px ${obj.color}44` : "none",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "8px",
                    background: active ? obj.color + "cc" : T.borderMid,
                    borderTop: `1px solid ${active ? obj.color : T.border}`,
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: "9px",
                  fontFamily: "monospace",
                  color: active ? obj.color : T.textFaint,
                  fontWeight: active ? 700 : 400,
                }}
              >
                {obj.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── EyepieceSelector ──────────────────────────────────────────────────────
const EYEPIECES = [
  { id: "x10", label: "×10", color: "#c45c10" },
  { id: "x8", label: "×8", color: "#b83232" },
];

export function EyepieceSelector({ value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <span
        style={{
          fontSize: "9px",
          color: T.textMuted,
          letterSpacing: "0.12em",
          fontFamily: "monospace",
          marginBottom: "2px",
        }}
      >
        THỊ KÍNH
      </span>
      <div style={{ display: "flex", gap: "6px" }}>
        {EYEPIECES.map((eye) => {
          const active = value === eye.id;
          return (
            <button
              key={eye.id}
              onClick={() => onChange(eye.id)}
              style={{
                padding: "5px 13px",
                fontSize: "11px",
                fontFamily: "monospace",
                background: active ? eye.color + "15" : T.surface,
                border: `1.5px solid ${active ? eye.color : T.border}`,
                borderRadius: "4px",
                color: active ? eye.color : T.textMuted,
                cursor: "pointer",
                fontWeight: active ? 700 : 400,
                transition: "all 0.15s",
              }}
            >
              {eye.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── RotaryKnob – ốc vi cấp thứ cấp ───────────────────────────────────────
// SVG hình tròn thể hiện:
//   - Vòng ngoài có vạch chia từ -5 đến +5
//   - Hai mũi tên cong thể hiện chiều xoay (CCW và CW)
//   - Đĩa trong xoay theo góc tương ứng với Z-level
//   - Arc màu hiển thị độ lệch khỏi tiêu cự (Z=0)
// Interaction: kéo chuột lên/xuống, hoặc click ▲▼, hoặc click dot

const TICKS = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];

export function RotaryKnob({ value, onChange }) {
  const [dragging, setDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startVal, setStartVal] = useState(0);

  const inFocus = value === 0;
  const arcColor = inFocus ? T.green : T.orange;
  // 1 level = 18°, range -5..+5 → -90°..+90°
  const knobAngle = value * 18;

  const onMouseDown = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(true);
      setStartY(e.clientY);
      setStartVal(value);
    },
    [value]
  );

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const delta = Math.round((startY - e.clientY) / 13);
      onChange(Math.max(-5, Math.min(5, startVal + delta)));
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, startY, startVal, onChange]);

  // Arc path từ 12 giờ đến vị trí hiện tại
  const arcPath = (() => {
    if (value === 0) return null;
    const r = 22;
    const cx = 38,
      cy = 38;
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (value / 5) * (Math.PI * 0.47);
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const large = Math.abs(value) > 2 ? 1 : 0;
    const sweep = value > 0 ? 1 : 0;
    return `M${x1},${y1} A${r},${r} 0 ${large},${sweep} ${x2},${y2}`;
  })();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        padding: "10px 6px",
      }}
    >
      {/* Label */}
      <span
        style={{
          fontSize: "8px",
          color: T.textMuted,
          letterSpacing: "0.1em",
          fontFamily: "monospace",
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        ỐC VI CẤP
        <br />
        THỨ CẤP
      </span>

      {/* SVG Knob */}
      <svg
        width="76"
        height="76"
        viewBox="0 0 76 76"
        onMouseDown={onMouseDown}
        style={{
          cursor: dragging ? "ns-resize" : "grab",
          userSelect: "none",
          flexShrink: 0,
        }}
        aria-label={`Ốc vi cấp: Z = ${value}`}
      >
        {/* Bóng nổi ngoài */}
        <circle
          cx="38"
          cy="38"
          r="34"
          fill="none"
          stroke="#e0ddd8"
          strokeWidth="3"
        />
        {/* Vòng ngoài */}
        <circle
          cx="38"
          cy="38"
          r="32"
          fill={T.surfaceAlt}
          stroke={T.borderMid}
          strokeWidth="1.5"
        />

        {/* Vạch chia độ */}
        {TICKS.map((t) => {
          const a = (t / 5) * 85 - 90; // map -5..5 → -175°..+80° quanh 12h
          const rad = (a * Math.PI) / 180;
          const r1 = 25,
            r2 = 30;
          const isZero = t === 0;
          const isCurrent = t === value;
          return (
            <line
              key={t}
              x1={38 + r1 * Math.cos(rad)}
              y1={38 + r1 * Math.sin(rad)}
              x2={38 + r2 * Math.cos(rad)}
              y2={38 + r2 * Math.sin(rad)}
              stroke={isZero ? T.green : isCurrent ? arcColor : T.borderMid}
              strokeWidth={isZero ? 2.2 : isCurrent ? 1.8 : 0.8}
              strokeLinecap="round"
            />
          );
        })}

        {/* Arc chỉ độ lệch */}
        {arcPath && (
          <path
            d={arcPath}
            fill="none"
            stroke={arcColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.65"
          />
        )}

        {/* ── Đĩa trong xoay theo Z ── */}
        <g transform={`rotate(${knobAngle}, 38, 38)`}>
          <circle
            cx="38"
            cy="38"
            r="18"
            fill={T.surface}
            stroke={inFocus ? T.green : T.borderMid}
            strokeWidth={inFocus ? 1.8 : 1.2}
          />
          {/* Chỉ thị vị trí (notch) */}
          <line
            x1="38"
            y1="22"
            x2="38"
            y2="30"
            stroke={arcColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Rãnh cầm nắm */}
          <line
            x1="30"
            y1="38"
            x2="46"
            y2="38"
            stroke="#d4d0ca"
            strokeWidth="0.7"
          />
        </g>

        {/* ── Mũi tên xoay ngược chiều kim đồng hồ (CCW) ── */}
        <g opacity="0.42">
          <path
            d="M 13,29 A 22,22 0 0,1 26,14"
            fill="none"
            stroke={T.textFaint}
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <polygon points="11.5,25 11,31 17,28.5" fill={T.textFaint} />
        </g>

        {/* ── Mũi tên xoay thuận chiều kim đồng hồ (CW) ── */}
        <g opacity="0.42">
          <path
            d="M 63,47 A 22,22 0 0,1 50,62"
            fill="none"
            stroke={T.textFaint}
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <polygon points="64.5,51 65,45 59,47.5" fill={T.textFaint} />
        </g>

        {/* Giá trị Z ở trung tâm */}
        <text
          x="38"
          y="42"
          textAnchor="middle"
          fill={inFocus ? T.green : T.orange}
          fontSize="10"
          fontWeight="700"
          fontFamily="monospace"
          letterSpacing="-0.5"
        >
          {value > 0 ? `+${value}` : value}
        </text>
      </svg>

      {/* Nút ▲ / FOCUS / ▼ */}
      <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
        <IconBtn
          onClick={() => onChange(Math.max(-5, value - 1))}
          title="Xoay xuống"
        >
          ▼
        </IconBtn>
        <button
          onClick={() => onChange(0)}
          title="Reset tiêu cự"
          style={{
            padding: "3px 8px",
            fontSize: "8px",
            fontFamily: "monospace",
            letterSpacing: "0.08em",
            background: inFocus ? T.greenLight : T.surface,
            border: `1px solid ${inFocus ? T.green : T.border}`,
            borderRadius: "4px",
            color: inFocus ? T.green : T.textMuted,
            cursor: "pointer",
          }}
        >
          FOCUS
        </button>
        <IconBtn
          onClick={() => onChange(Math.min(5, value + 1))}
          title="Xoay lên"
        >
          ▲
        </IconBtn>
      </div>

      {/* Dot indicator row */}
      <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
        {TICKS.map((t) => (
          <div
            key={t}
            onClick={() => onChange(t)}
            title={`Z = ${t}`}
            style={{
              width: t === 0 ? "9px" : "5px",
              height: t === 0 ? "9px" : "5px",
              borderRadius: "50%",
              cursor: "pointer",
              background:
                t === value
                  ? t === 0
                    ? T.green
                    : T.orange
                  : t === 0
                  ? "#c8ecd5"
                  : T.surfaceAlt,
              border: `1px solid ${
                t === value
                  ? t === 0
                    ? T.green
                    : T.orange
                  : t === 0
                  ? T.green + "44"
                  : T.border
              }`,
              transition: "all 0.12s",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── IconBtn helper ────────────────────────────────────────────────────────
function IconBtn({ onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: "22px",
        height: "22px",
        fontSize: "9px",
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: "4px",
        color: T.textMuted,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </button>
  );
}
