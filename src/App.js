// ─── App.js ───────────────────────────────────────────────────────────────────
// Folder tree 3 cấp: Chương trình → Ngành → Chủ đề
// Tự tạo folder khi có data, hiện "Chưa có tiêu bản" nếu rỗng.
// Thêm tiêu bản mới: chỉ cần thêm vào images1.js / images2.js / ...
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from "react";
import { SLIDES_1 } from "./images1.js";
import { SLIDES_2 } from "./images2.js";
import Simulation from "./simulation.js";
import InfoPanel from "./info.js";

// ── Tất cả slides ─────────────────────────────────────────────────────────
const ALL_SLIDES = [...SLIDES_1, ...SLIDES_2].filter((s) => s.imageUrl);
const getSlideById = (id) =>
  ALL_SLIDES.find((s) => s.id === id) ?? ALL_SLIDES[0];

// ── Danh sách folder chuẩn (luôn hiện dù chưa có tiêu bản) ───────────────
// Format: "Chương trình / Ngành / Chủ đề"
const PREDEFINED_FOLDERS = [
  "Đại học / Ký sinh trùng / Ký sinh trùng máu",
  "Đại học / Ký sinh trùng / Ký sinh trùng đường ruột",
  "Đại học / Ký sinh trùng / Ký sinh trùng mô",
  "Đại học / Ký sinh trùng / Ký sinh trùng gan mật",
  "Đại học / Vi sinh / Vi khuẩn",
  "Đại học / Vi sinh / Nấm",
  "Đại học / Vi sinh / Virus",
  "Đại học / Huyết học / Phết máu ngoại vi",
  "Đại học / Huyết học / Tủy đồ",
  "Đại học / Giải phẫu bệnh / Mô học cơ bản",
  "Đại học / Giải phẫu bệnh / Bệnh học",
  "THPT / Sinh học / Tế bào học",
  "THPT / Sinh học / Vi sinh vật",
  "THCS / Khoa học tự nhiên / Tế bào",
];

// ── Build folder tree 3 cấp ───────────────────────────────────────────────
// Kết quả: { "Đại học": { "Ký sinh trùng": { "KST máu": [...slides] } } }
function buildFolderTree() {
  const tree = {};

  // 1. Tạo sẵn tất cả folder từ PREDEFINED_FOLDERS
  PREDEFINED_FOLDERS.forEach((path) => {
    const [lvl1, lvl2, lvl3] = path.split("/").map((s) => s.trim());
    if (!tree[lvl1]) tree[lvl1] = {};
    if (!tree[lvl1][lvl2]) tree[lvl1][lvl2] = {};
    if (!tree[lvl1][lvl2][lvl3]) tree[lvl1][lvl2][lvl3] = [];
  });

  // 2. Đặt slides vào đúng folder theo trường `folder`
  ALL_SLIDES.forEach((slide) => {
    const parts = (slide.folder ?? "Chưa phân loại / Chung / Chung")
      .split("/")
      .map((s) => s.trim());
    const lvl1 = parts[0] ?? "Chưa phân loại";
    const lvl2 = parts[1] ?? "Chung";
    const lvl3 = parts[2] ?? "Chung";
    if (!tree[lvl1]) tree[lvl1] = {};
    if (!tree[lvl1][lvl2]) tree[lvl1][lvl2] = {};
    if (!tree[lvl1][lvl2][lvl3]) tree[lvl1][lvl2][lvl3] = [];
    tree[lvl1][lvl2][lvl3].push(slide);
  });

  return tree;
}

// ─── Theme ────────────────────────────────────────────────────────────────
const C = {
  bg: "#f5f4f1",
  surface: "#ffffff",
  surfaceAlt: "#f0efec",
  border: "#dedad4",
  borderMid: "#c4bfb7",
  text: "#1a1917",
  textMuted: "#6b6760",
  textFaint: "#a8a49e",
  blue: "#1d6fa4",
  blueLight: "#e8f2fa",
  green: "#1a7a42",
};

// ─── MicroscopeSchematic ─────────────────────────────────────────────────
function MicroscopeSchematic({ objective, eyepiece, focusLevel }) {
  const tubeH = { x4: 13, x10: 22, x40: 36 }[objective] ?? 22;
  const objColor = { x4: "#1a7a42", x10: "#1d6fa4", x40: "#7c3aed" }[objective];
  const inFocus = focusLevel === 0;
  return (
    <svg width="100%" viewBox="0 0 130 158" fill="none" aria-hidden="true">
      <rect
        x="50"
        y="3"
        width="30"
        height="14"
        rx="3"
        stroke={C.blue}
        strokeWidth="1"
        fill={C.blueLight}
      />
      <text
        x="65"
        y="13.5"
        textAnchor="middle"
        fill={C.blue}
        fontSize="6.5"
        fontFamily="monospace"
      >
        {eyepiece}
      </text>
      <rect
        x="58"
        y="17"
        width="14"
        height="30"
        stroke={C.border}
        strokeWidth="0.8"
        fill={C.surfaceAlt}
      />
      <ellipse
        cx="65"
        cy="50"
        rx="20"
        ry="6"
        stroke={C.borderMid}
        strokeWidth="0.8"
        fill={C.surfaceAlt}
      />
      <rect
        x="58"
        y="56"
        width="14"
        height={tubeH}
        rx="3"
        stroke={objColor}
        strokeWidth="1.2"
        fill="white"
      />
      <text
        x="65"
        y={62 + tubeH / 2}
        textAnchor="middle"
        fill={objColor}
        fontSize="6.5"
        fontFamily="monospace"
      >
        {objective}
      </text>
      <rect
        x="28"
        y={60 + tubeH}
        width="74"
        height="7"
        rx="2"
        stroke={C.borderMid}
        strokeWidth="0.8"
        fill={C.surfaceAlt}
      />
      <line
        x1="28"
        y1={63 + tubeH + focusLevel * 1.5}
        x2="102"
        y2={63 + tubeH + focusLevel * 1.5}
        stroke={inFocus ? C.green : "#c45c10"}
        strokeWidth="0.8"
        strokeDasharray={inFocus ? "0" : "3 2"}
      />
      <rect
        x="18"
        y={70 + tubeH}
        width="94"
        height="11"
        rx="3"
        stroke={C.border}
        strokeWidth="0.8"
        fill={C.surfaceAlt}
      />
      <path
        d={`M56,50 L38,${67 + tubeH} L38,${70 + tubeH}`}
        stroke={C.border}
        strokeWidth="1.8"
        fill="none"
      />
      <path
        d={`M74,50 L92,${67 + tubeH} L92,${70 + tubeH}`}
        stroke={C.border}
        strokeWidth="1.8"
        fill="none"
      />
      <text
        x="65"
        y="151"
        textAnchor="middle"
        fill={C.textFaint}
        fontSize="6"
        fontFamily="monospace"
      >
        SCHEMATIC
      </text>
    </svg>
  );
}

// ─── SlideDrawer – folder tree 3 cấp ─────────────────────────────────────
function SlideDrawer({ slideId, onSelect, objective, eyepiece, focusLevel }) {
  const tree = buildFolderTree();

  // Tìm path của slide hiện tại để mở sẵn đúng folder
  const curSlide = getSlideById(slideId);
  const curParts = (curSlide?.folder ?? "").split("/").map((s) => s.trim());
  const [openL1, setOpenL1] = useState({ [curParts[0]]: true });
  const [openL2, setOpenL2] = useState({
    [`${curParts[0]}/${curParts[1]}`]: true,
  });

  const toggleL1 = (k) => setOpenL1((p) => ({ ...p, [k]: !p[k] }));
  const toggleL2 = (k) => setOpenL2((p) => ({ ...p, [k]: !p[k] }));

  return (
    <div
      style={{
        width: "230px",
        background: C.surface,
        borderRight: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "11px 14px",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            color: C.blue,
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.12em",
          }}
        >
          TIÊU BẢN
        </span>
        <span style={{ color: C.textFaint, fontSize: "9px" }}>
          {ALL_SLIDES.length} tiêu bản
        </span>
      </div>

      <div style={{ overflowY: "auto", flex: 1 }}>
        {Object.entries(tree).map(([l1, l2map]) => {
          const l1Open = !!openL1[l1];
          const l1Count = Object.values(l2map)
            .flatMap((l3) => Object.values(l3))
            .flat().length;

          return (
            <div key={l1}>
              {/* ── Level 1: Chương trình ── */}
              <button
                onClick={() => toggleL1(l1)}
                style={{
                  width: "100%",
                  padding: "9px 14px",
                  background: "#ebe9e5",
                  border: "none",
                  borderBottom: `1px solid ${C.borderMid}`,
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "7px" }}
                >
                  <span style={{ fontSize: "12px" }}>
                    {l1Open ? "📂" : "📁"}
                  </span>
                  <span
                    style={{ color: C.text, fontSize: "10px", fontWeight: 700 }}
                  >
                    {l1}
                  </span>
                </div>
                <span style={{ color: C.textFaint, fontSize: "9px" }}>
                  {l1Count > 0 ? l1Count : ""}
                </span>
              </button>

              {l1Open &&
                Object.entries(l2map).map(([l2, l3map]) => {
                  const l2Key = `${l1}/${l2}`;
                  const l2Open = !!openL2[l2Key];
                  const l2Count = Object.values(l3map).flat().length;

                  return (
                    <div key={l2}>
                      {/* ── Level 2: Ngành ── */}
                      <button
                        onClick={() => toggleL2(l2Key)}
                        style={{
                          width: "100%",
                          padding: "7px 14px 7px 26px",
                          background: "#f3f2ef",
                          border: "none",
                          borderBottom: `1px solid ${C.border}`,
                          cursor: "pointer",
                          textAlign: "left",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <span style={{ fontSize: "10px" }}>
                            {l2Open ? "▾" : "▸"}
                          </span>
                          <span
                            style={{
                              color: C.textMuted,
                              fontSize: "9px",
                              fontWeight: 700,
                              letterSpacing: "0.08em",
                            }}
                          >
                            {l2}
                          </span>
                        </div>
                        {l2Count === 0 ? (
                          <span
                            style={{
                              color: C.textFaint,
                              fontSize: "8px",
                              fontStyle: "italic",
                            }}
                          >
                            trống
                          </span>
                        ) : (
                          <span style={{ color: C.textFaint, fontSize: "9px" }}>
                            {l2Count}
                          </span>
                        )}
                      </button>

                      {l2Open &&
                        Object.entries(l3map).map(([l3, slides]) => (
                          <div key={l3}>
                            {/* ── Level 3: Chủ đề ── */}
                            <div
                              style={{
                                padding: "5px 14px 4px 38px",
                                background: "#f8f7f5",
                                borderBottom: `1px solid ${C.border}`,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <span
                                style={{
                                  color: C.textFaint,
                                  fontSize: "8px",
                                  fontWeight: 700,
                                  letterSpacing: "0.1em",
                                }}
                              >
                                {l3.toUpperCase()}
                              </span>
                              {slides.length === 0 && (
                                <span
                                  style={{
                                    color: "#d4a900",
                                    fontSize: "7px",
                                    background: "#fff8e0",
                                    border: "1px solid #f0d060",
                                    borderRadius: "3px",
                                    padding: "1px 5px",
                                  }}
                                >
                                  Chưa có tiêu bản
                                </span>
                              )}
                            </div>

                            {/* ── Slides ── */}
                            {slides.map((s) => {
                              const active = slideId === s.id;
                              return (
                                <button
                                  key={s.id}
                                  onClick={() => onSelect(s.id)}
                                  style={{
                                    width: "100%",
                                    padding: 0,
                                    background: "none",
                                    border: "none",
                                    borderLeft: `3px solid ${
                                      active ? s.color : "transparent"
                                    }`,
                                    borderBottom: `1px solid ${C.border}`,
                                    cursor: "pointer",
                                    textAlign: "left",
                                    transition: "background 0.12s",
                                  }}
                                >
                                  {/* Thumbnail */}
                                  <div
                                    style={{
                                      position: "relative",
                                      height: "48px",
                                      overflow: "hidden",
                                      background: C.surfaceAlt,
                                    }}
                                  >
                                    <img
                                      src={s.imageUrl}
                                      alt={s.nameVi}
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        opacity: active ? 1 : 0.5,
                                        transition: "opacity 0.15s",
                                      }}
                                      onError={(e) => {
                                        e.target.style.display = "none";
                                      }}
                                    />
                                    {!active && (
                                      <div
                                        style={{
                                          position: "absolute",
                                          inset: 0,
                                          background: "rgba(255,255,255,0.25)",
                                        }}
                                      />
                                    )}
                                  </div>
                                  {/* Info */}
                                  <div
                                    style={{
                                      padding: "5px 10px 5px 12px",
                                      background: active
                                        ? s.color + "08"
                                        : "transparent",
                                    }}
                                  >
                                    <div
                                      style={{
                                        color: active ? C.text : C.textMuted,
                                        fontSize: "10px",
                                        lineHeight: 1.35,
                                      }}
                                    >
                                      {s.nameVi}
                                    </div>
                                    <div
                                      style={{
                                        color: C.textFaint,
                                        fontSize: "8px",
                                        marginTop: "1px",
                                        fontFamily: "monospace",
                                      }}
                                    >
                                      {s.species ?? s.category}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        ))}
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>

      {/* Schematic */}
      <div style={{ padding: "12px", borderTop: `1px solid ${C.border}` }}>
        <MicroscopeSchematic
          objective={objective}
          eyepiece={eyepiece}
          focusLevel={focusLevel}
        />
      </div>
    </div>
  );
}

// ─── Navbar ──────────────────────────────────────────────────────────────
function Navbar({ slide, showDrawer, showInfo, onToggleDrawer, onToggleInfo }) {
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "0 18px",
        height: "46px",
        background: C.surface,
        borderBottom: `1px solid ${C.border}`,
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="11" stroke={C.blue} strokeWidth="1.5" />
          <circle
            cx="12"
            cy="12"
            r="6"
            stroke={C.green}
            strokeWidth="0.8"
            strokeDasharray="2 2"
          />
          <circle cx="12" cy="12" r="2.5" fill={C.blue} opacity="0.85" />
          <line
            x1="12"
            y1="1"
            x2="12"
            y2="5"
            stroke={C.blue}
            strokeWidth="1.5"
          />
          <line
            x1="12"
            y1="19"
            x2="12"
            y2="23"
            stroke={C.blue}
            strokeWidth="1.5"
          />
        </svg>
        <div>
          <div style={{ color: C.text, fontSize: "13px", fontWeight: 800 }}>
            VirtualScope
          </div>
          <div
            style={{
              color: C.textFaint,
              fontSize: "8px",
              letterSpacing: "0.18em",
              fontFamily: "monospace",
            }}
          >
            KÍNH HIỂN VI ẢO · VLU
          </div>
        </div>
      </div>
      <div style={{ flex: 1 }} />
      {slide && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            padding: "4px 12px",
            background: C.surfaceAlt,
            border: `1px solid ${C.border}`,
            borderRadius: "6px",
            maxWidth: "360px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: slide.color,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              color: C.text,
              fontSize: "11px",
              fontWeight: 500,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {slide.nameVi}
          </span>
          <span style={{ color: C.border, flexShrink: 0 }}>|</span>
          <span
            style={{
              color: C.textFaint,
              fontSize: "10px",
              fontStyle: "italic",
              whiteSpace: "nowrap",
            }}
          >
            {slide.folder}
          </span>
        </div>
      )}
      <NavBtn active={showDrawer} onClick={onToggleDrawer} label="TIÊU BẢN" />
      <NavBtn active={showInfo} onClick={onToggleInfo} label="INFO" />
    </nav>
  );
}

function NavBtn({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "4px 11px",
        background: active ? C.blueLight : "transparent",
        border: `1px solid ${active ? C.blue : C.border}`,
        borderRadius: "4px",
        color: active ? C.blue : C.textMuted,
        cursor: "pointer",
        fontSize: "10px",
        fontFamily: "monospace",
        fontWeight: active ? 700 : 400,
        letterSpacing: "0.08em",
        transition: "all 0.14s",
      }}
    >
      {label}
    </button>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────
export default function App() {
  const first = ALL_SLIDES[0];
  const [slideId, setSlideId] = useState(first?.id);
  const [objective, setObjective] = useState(first?.defaultObjective ?? "x40");
  const [eyepiece, setEyepiece] = useState("x10");
  const [focusLevel, setFocusLevel] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showDrawer, setShowDrawer] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  const slide = getSlideById(slideId);

  const handleSlideChange = useCallback((id) => {
    const s = getSlideById(id);
    setSlideId(id);
    setFocusLevel(0);
    setPan({ x: 0, y: 0 });
    setObjective(s?.defaultObjective ?? "x40");
  }, []);

  const handleObjectiveChange = useCallback((obj) => {
    setObjective(obj);
    setFocusLevel(0);
    setPan({ x: 0, y: 0 });
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        background: C.bg,
        fontFamily: "system-ui, sans-serif",
        color: C.text,
        overflow: "hidden",
      }}
    >
      <Navbar
        slide={slide}
        showDrawer={showDrawer}
        showInfo={showInfo}
        onToggleDrawer={() => setShowDrawer((v) => !v)}
        onToggleInfo={() => setShowInfo((v) => !v)}
      />
      <div
        style={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {showDrawer && (
          <SlideDrawer
            slideId={slideId}
            onSelect={handleSlideChange}
            objective={objective}
            eyepiece={eyepiece}
            focusLevel={focusLevel}
          />
        )}
        <Simulation
          objective={objective}
          eyepiece={eyepiece}
          focusLevel={focusLevel}
          slide={slide}
          pan={pan}
          onPan={setPan}
          onObjectiveChange={handleObjectiveChange}
          onEyepieceChange={setEyepiece}
          onFocusChange={setFocusLevel}
        />
        {showInfo && (
          <InfoPanel
            slide={slide}
            objective={objective}
            eyepiece={eyepiece}
            focusLevel={focusLevel}
            onClose={() => setShowInfo(false)}
          />
        )}
      </div>
    </div>
  );
}
