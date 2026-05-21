// ─── info.js ──────────────────────────────────────────────────────────────────
// Vai trò: Panel thông tin bên phải – hiển thị đầy đủ:
//   Tab "Tiêu bản"  – thumbnail, backstory lâm sàng, hình thái, ghi chú lâm sàng,
//                     thông số hiện tại, gợi ý quan sát theo vật kính
//   Tab "Quang học" – thông số NA, WD, FOV, công thức phân giải Rayleigh
//   Tab "Tác giả"   – thông tin Lâm Kiến Thành, VLU
// KHÔNG chứa: logic ảnh, viewport, controls.
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from "react";

// ─── Thông số quang học theo vật kính / thị kính ──────────────────────────
const OBJECTIVE_OPTICS = {
  x4: {
    na: 0.1,
    wd: "30 mm",
    fov: "4.5 mm",
    resolution: "3.35 μm",
    use: "Định hướng, scan tổng thể",
  },
  x10: {
    na: 0.25,
    wd: "10 mm",
    fov: "1.8 mm",
    resolution: "1.34 μm",
    use: "Cấu trúc mô, đếm mật độ",
  },
  x40: {
    na: 0.65,
    wd: "0.5 mm",
    fov: "0.45 mm",
    resolution: "0.52 μm",
    use: "Phân loại tế bào, định loài KST",
  },
};

const EYEPIECE_OPTICS = {
  x10: {
    fov: "20 mm",
    type: "Widefield 10×",
    note: "Thị kính chuẩn, sử dụng phổ biến nhất",
  },
  x8: {
    fov: "22 mm",
    type: "Widefield 8× (UW)",
    note: "Trường nhìn rộng hơn, thích hợp đọc phết máu",
  },
};

// ─── InfoPanel (default export) ───────────────────────────────────────────
export default function InfoPanel({
  slide,
  objective,
  eyepiece,
  focusLevel,
  onClose,
}) {
  const [tab, setTab] = useState("slide");

  const totalMag =
    parseInt(objective.replace("x", ""), 10) *
    parseInt(eyepiece.replace("x", ""), 10);
  const oo = OBJECTIVE_OPTICS[objective] ?? {};
  const eo = EYEPIECE_OPTICS[eyepiece] ?? {};
  const tip =
    slide?.objectiveTips?.[objective] ?? "Chọn vật kính phù hợp để quan sát.";

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        width: "300px",
        background: "#ffffff",
        borderLeft: "1px solid #dedad4",
        display: "flex",
        flexDirection: "column",
        fontFamily: "system-ui, sans-serif",
        zIndex: 20,
        boxShadow: "-4px 0 20px rgba(0,0,0,0.09)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #dedad4",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            color: "#1d6fa4",
            fontWeight: 700,
            fontSize: "11px",
            letterSpacing: "0.08em",
          }}
        >
          ◈ INFO PANEL
        </span>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "1px solid #dedad4",
            color: "#6b6760",
            borderRadius: "4px",
            width: "24px",
            height: "24px",
            cursor: "pointer",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ×
        </button>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", borderBottom: "1px solid #dedad4" }}>
        {[
          ["slide", "Tiêu bản"],
          ["optics", "Quang học"],
          ["author", "Tác giả"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              flex: 1,
              padding: "9px 4px",
              background: "none",
              border: "none",
              borderBottom:
                tab === id ? "2px solid #1d6fa4" : "2px solid transparent",
              color: tab === id ? "#1d6fa4" : "#6b6760",
              cursor: "pointer",
              fontSize: "10px",
              fontFamily: "inherit",
              fontWeight: tab === id ? 700 : 400,
              transition: "color 0.15s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        {/* ── Tab: Tiêu bản ─────────────────────────────────────────── */}
        {tab === "slide" && slide && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            {/* Thumbnail */}
            <div
              style={{
                position: "relative",
                height: "108px",
                borderRadius: "8px",
                overflow: "hidden",
                border: "1px solid #dedad4",
              }}
            >
              <img
                src={slide.imageUrl}
                alt={slide.nameVi}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: "linear-gradient(transparent, rgba(0,0,0,0.58))",
                  padding: "8px 10px",
                }}
              >
                <span
                  style={{ color: "white", fontSize: "10px", fontWeight: 700 }}
                >
                  {slide.nameVi}
                </span>
              </div>
            </div>

            {/* Category badge + species */}
            <div
              style={{
                background: slide.color + "0e",
                border: `1px solid ${slide.color}2a`,
                borderRadius: "8px",
                padding: "10px 12px",
              }}
            >
              <div
                style={{
                  color: slide.color,
                  fontSize: "9px",
                  letterSpacing: "0.12em",
                  fontWeight: 700,
                  marginBottom: "3px",
                }}
              >
                {slide.category.toUpperCase()}
              </div>
              <div
                style={{
                  color: "#1a1917",
                  fontWeight: 700,
                  fontSize: "12px",
                  marginBottom: "2px",
                }}
              >
                {slide.nameVi}
              </div>
              <div
                style={{
                  color: "#6b6760",
                  fontSize: "10px",
                  fontStyle: "italic",
                }}
              >
                {slide.species} · {slide.staining}
              </div>
            </div>

            {/* Backstory lâm sàng */}
            <Section title="BACKSTORY LÂM SÀNG" color="#1d6fa4">
              <Body>{slide.backstory}</Body>
            </Section>

            {/* Hình thái */}
            <Section title="ĐẶC ĐIỂM HÌNH THÁI" color="#1d6fa4">
              <Body>{slide.morphology}</Body>
            </Section>

            {/* Ghi chú lâm sàng */}
            <Section title="GHI CHÚ CHẨN ĐOÁN / ĐIỀU TRỊ" color="#b45309">
              <div
                style={{
                  background: "#fdf0e6",
                  border: "1px solid #c45c1030",
                  borderLeft: "3px solid #c45c10",
                  borderRadius: "6px",
                  padding: "10px 12px",
                }}
              >
                <Body style={{ color: "#6b4020" }}>{slide.clinicalNote}</Body>
              </div>
            </Section>

            {/* Thông số hiện tại */}
            <Section title="THÔNG SỐ HIỆN TẠI" color="#1d6fa4">
              <DataRow l="Vật kính" v={objective} />
              <DataRow l="Thị kính" v={eyepiece} />
              <DataRow l="Phóng đại" v={`×${totalMag}`} c="#1a7a42" />
              <DataRow
                l="Mức Z"
                v={
                  focusLevel === 0
                    ? "Tiêu cự ✓"
                    : focusLevel > 0
                    ? `+${focusLevel} (trên tiêu cự)`
                    : `${focusLevel} (dưới tiêu cự)`
                }
                c={focusLevel === 0 ? "#1a7a42" : "#c45c10"}
              />
            </Section>

            {/* Gợi ý quan sát */}
            <Section
              title={`GỢI Ý QUAN SÁT – ${objective.toUpperCase()}`}
              color="#1a7a42"
            >
              <div
                style={{
                  background: "#e6f5ec",
                  border: "1px solid #1a7a4220",
                  borderLeft: "3px solid #1a7a42",
                  borderRadius: "6px",
                  padding: "10px 12px",
                }}
              >
                <Body style={{ color: "#1a4030" }}>{tip}</Body>
              </div>
            </Section>
          </div>
        )}

        {/* ── Tab: Quang học ─────────────────────────────────────────── */}
        {tab === "optics" && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            <Section
              title={`VẬT KÍNH — ${objective.toUpperCase()}`}
              color="#1d6fa4"
            >
              <DataRow l="Khẩu độ số (NA)" v={oo.na} />
              <DataRow l="Cự ly làm việc" v={oo.wd} />
              <DataRow l="Trường nhìn thực" v={oo.fov} />
              <DataRow l="Phân giải lý thuyết" v={oo.resolution} c="#1a7a42" />
              <DataRow l="Ứng dụng" v={oo.use} />
            </Section>

            <Section
              title={`THỊ KÍNH — ${eyepiece.toUpperCase()}`}
              color="#1d6fa4"
            >
              <DataRow l="Đường kính trường nhìn" v={eo.fov} />
              <DataRow l="Loại" v={eo.type} />
              <DataRow l="Ghi chú" v={eo.note} />
            </Section>

            <Section title="TỔ HỢP" color="#1d6fa4">
              <DataRow l="Phóng đại tổng" v={`×${totalMag}`} c="#1a7a42" />
              <DataRow
                l="Phân giải thực tế"
                v={`${(0.61 / (oo.na ?? 0.1)).toFixed(2)} μm`}
              />
            </Section>

            {/* Công thức Rayleigh */}
            <div
              style={{
                background: "#f0efec",
                borderRadius: "8px",
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  color: "#1d6fa4",
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  marginBottom: "8px",
                }}
              >
                CÔNG THỨC RAYLEIGH
              </div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: "13px",
                  color: "#1a1917",
                  marginBottom: "6px",
                }}
              >
                d = 0.61 × λ / NA
              </div>
              <Body>
                λ = 550 nm (ánh sáng xanh lá, độ nhạy mắt cao nhất){"\n"}
                NA = khẩu độ số của vật kính{"\n"}d = giới hạn phân giải tối
                thiểu
              </Body>
            </div>

            {/* So sánh 3 vật kính */}
            <Section title="SO SÁNH VẬT KÍNH" color="#1d6fa4">
              {Object.entries({
                x4: { label: "×4", color: "#1a7a42" },
                x10: { label: "×10", color: "#1d6fa4" },
                x40: { label: "×40", color: "#7c3aed" },
              }).map(([k, meta]) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "5px 0",
                    borderBottom: "1px solid #dedad4",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      color: meta.color,
                      fontWeight: 700,
                      fontSize: "11px",
                      minWidth: "28px",
                    }}
                  >
                    {meta.label}
                  </span>
                  <span style={{ color: "#6b6760", fontSize: "10px" }}>
                    NA {OBJECTIVE_OPTICS[k].na} · {OBJECTIVE_OPTICS[k].fov} ·{" "}
                    {OBJECTIVE_OPTICS[k].resolution}
                  </span>
                </div>
              ))}
            </Section>
          </div>
        )}

        {/* ── Tab: Tác giả ───────────────────────────────────────────── */}
        {tab === "author" &&
          (() => {
            const a = slide?.author;
            const initials = a?.name
              ? a.name
                  .split(" ")
                  .filter((w) => w === w.toUpperCase() || w.length <= 3)
                  .slice(-2)
                  .map((w) => w[0])
                  .join("") || a.name[0]
              : "?";
            return !a ? (
              <div
                style={{ color: "#a8a49e", fontSize: "11px", padding: "8px 0" }}
              >
                Tiêu bản này chưa có thông tin tác giả.
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    background: "#e8f2fa",
                    border: "1px solid #1d6fa420",
                    borderRadius: "10px",
                    padding: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "46px",
                      height: "46px",
                      borderRadius: "50%",
                      background: "#1d6fa418",
                      border: "2px solid #1d6fa444",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#1d6fa4",
                      marginBottom: "12px",
                    }}
                  >
                    {initials}
                  </div>
                  <div
                    style={{
                      color: "#1a1917",
                      fontWeight: 700,
                      fontSize: "14px",
                    }}
                  >
                    {a.name}
                  </div>
                  <div
                    style={{
                      color: "#6b6760",
                      fontSize: "11px",
                      marginTop: "3px",
                    }}
                  >
                    {a.title}
                  </div>
                  <div
                    style={{
                      color: "#1d6fa4",
                      fontSize: "11px",
                      marginTop: "4px",
                      fontWeight: 600,
                    }}
                  >
                    {a.institution}
                  </div>
                  {a.city && (
                    <div
                      style={{
                        color: "#a8a49e",
                        fontSize: "10px",
                        marginTop: "2px",
                      }}
                    >
                      {a.city}
                    </div>
                  )}
                </div>

                {a.expertise?.length > 0 && (
                  <Section title="CHUYÊN MÔN" color="#1d6fa4">
                    {a.expertise.map((e, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          gap: "8px",
                          marginBottom: "7px",
                          lineHeight: 1.45,
                        }}
                      >
                        <span
                          style={{
                            color: "#1d6fa4",
                            fontSize: "11px",
                            marginTop: "1px",
                          }}
                        >
                          ▸
                        </span>
                        <span style={{ color: "#6b6760", fontSize: "11px" }}>
                          {e}
                        </span>
                      </div>
                    ))}
                  </Section>
                )}

                {a.email && (
                  <div
                    style={{
                      borderTop: "1px solid #dedad4",
                      paddingTop: "12px",
                    }}
                  >
                    <div style={{ color: "#1d6fa4", fontSize: "11px" }}>
                      ✉ {a.email}
                    </div>
                  </div>
                )}

                {a.note && (
                  <div
                    style={{
                      background: "#f0efec",
                      borderRadius: "8px",
                      padding: "12px 14px",
                    }}
                  >
                    <div
                      style={{
                        color: "#1d6fa4",
                        fontSize: "9px",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        marginBottom: "8px",
                      }}
                    >
                      GHI CHÚ
                    </div>
                    <Body>{a.note}</Body>
                  </div>
                )}
              </div>
            );
          })()}
      </div>
    </div>
  );
}

// ─── Helper sub-components ─────────────────────────────────────────────────
function Section({ title, color = "#1d6fa4", children }) {
  return (
    <div>
      <div
        style={{
          color,
          fontSize: "9px",
          letterSpacing: "0.12em",
          fontWeight: 700,
          marginBottom: "8px",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function Body({ children, style }) {
  return (
    <p
      style={{
        color: "#6b6760",
        fontSize: "11px",
        lineHeight: 1.7,
        margin: 0,
        whiteSpace: "pre-wrap",
        ...style,
      }}
    >
      {children}
    </p>
  );
}

function DataRow({ l, v, c }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "5px 0",
        borderBottom: "1px solid #dedad4",
        gap: "8px",
      }}
    >
      <span style={{ color: "#6b6760", fontSize: "11px", flexShrink: 0 }}>
        {l}
      </span>
      <span
        style={{
          color: c ?? "#1a1917",
          fontSize: "11px",
          fontWeight: 600,
          textAlign: "right",
        }}
      >
        {v}
      </span>
    </div>
  );
}
