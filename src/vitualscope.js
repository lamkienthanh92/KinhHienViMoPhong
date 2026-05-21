import { useState, useCallback, useEffect, useRef } from "react";

// ══════════════════════════════════════════════════════════════════════════
// MODULE: images.js
// ══════════════════════════════════════════════════════════════════════════

// ─── images.js ────────────────────────────────────────────────────────────────
// Vai trò: Lưu trữ URL ảnh Cloudinary thô và xây dựng URL có transform
//          mô phỏng quang học (zoom vật kính, blur mất nét).
// KHÔNG chứa: metadata tiêu bản, mô tả, UI component.
// ──────────────────────────────────────────────────────────────────────────────

const CLOUDINARY_CLOUD = "de5k4mw3a";

// ─── Raw image URLs (không transform) ─────────────────────────────────────────
const IMAGE_URLS = {
  // Hình 1 – Phết máu Giemsa, nhiều HC nhiễm thể nhẫn nhỏ
  malaria_rbc_giemsa:
    "https://res.cloudinary.com/de5k4mw3a/image/upload/v1779256638/65343_c3cp1q.jpg",

  // Hình 2 – Plasmodium vivax, trophozoite ameboid + schizont
  plasmodium_vivax:
    "https://res.cloudinary.com/de5k4mw3a/image/upload/v1779256638/Plasmodium_vivax_lgqpxb.jpg",

  // Hình 3 – Trứng Trichuris trichiura, soi phân trực tiếp
  trichuris_trichiura_eggs:
    "https://res.cloudinary.com/de5k4mw3a/image/upload/v1779256639/eggs-trichuris-trichiura-whipworm-stool-analyze-by-microscope_581734-1511_zrhodz.avif",

  // Hình 4 – P. falciparum thể nhẫn accole (appliqué), nhân đôi
  pf_accole:
    "https://res.cloudinary.com/de5k4mw3a/image/upload/v1779256640/PF_accole_ucmtrh.png",
};

// ─── buildOpticalUrl ──────────────────────────────────────────────────────────
// Inject Cloudinary transforms vào URL để mô phỏng:
//   - Zoom theo vật kính (x4 = full frame, x10 = 1.4×, x40 = 2.6×)
//   - Blur + dim khi focusLevel ≠ 0 (ốc vi cấp lệch khỏi tiêu cự)
// Args:
//   rawUrl     – URL từ IMAGE_URLS
//   objective  – "x4" | "x10" | "x40"
//   focusLevel – số nguyên -5..+5, 0 = in focus
// Returns: URL string với transforms

function buildOpticalUrl(rawUrl, objective, focusLevel = 0) {
  if (!rawUrl) return rawUrl;

  const mag = parseInt(objective.replace("x", ""), 10);
  const blur = Math.abs(focusLevel);

  const transforms = [];

  // Zoom server-side theo vật kính
  const zoom = { 4: 1.0, 10: 1.4, 40: 2.6 }[mag] ?? 1.4;
  transforms.push(`w_900,h_680,c_fill,z_${zoom.toFixed(1)}`);

  // Mô phỏng mất nét khi Z ≠ 0
  if (blur > 0) {
    transforms.push(`e_blur:${blur * 200}`);
    transforms.push(`e_brightness:${-(blur * 9)}`);
  }

  // Inject transforms: .../upload/TRANSFORMS/vXXX/public_id
  const marker = "/upload/";
  const idx = rawUrl.indexOf(marker);
  if (idx === -1) return rawUrl;
  return (
    rawUrl.slice(0, idx + marker.length) +
    transforms.join(",") +
    "/" +
    rawUrl.slice(idx + marker.length)
  );
}

// ─── getClientScale ───────────────────────────────────────────────────────────
// CSS scale thêm phía client để pan mượt và thấy rõ chi tiết khi kéo tiêu bản.
function getClientScale(objective) {
  return { x4: 1.0, x10: 1.35, x40: 2.1 }[objective] ?? 1.35;
}

// ══════════════════════════════════════════════════════════════════════════
// MODULE: slides.js
// ══════════════════════════════════════════════════════════════════════════

// ─── slides.js ────────────────────────────────────────────────────────────────
// Vai trò: Dữ liệu đầy đủ cho từng tiêu bản – metadata, backstory lâm sàng,
//          mô tả hình thái, hướng dẫn quan sát theo vật kính.
// KHÔNG chứa: URLs ảnh (xem images.js), UI component (xem simulation.js).
// ──────────────────────────────────────────────────────────────────────────────

const SLIDES = [
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "malaria_rbc_giemsa",
    nameVi: "Phết máu Giemsa – Thể nhẫn mật độ cao",
    nameEn: "Giemsa Blood Film – High-density Ring Forms",
    category: "Ký sinh trùng máu",
    species: "Plasmodium sp.",
    staining: "Giemsa",
    imageKey: "malaria_rbc_giemsa", // key vào IMAGE_URLS
    imageUrl: IMAGE_URLS.malaria_rbc_giemsa,
    color: "#4f46e5",
    defaultObjective: "x40",

    // ── Backstory lâm sàng ─────────────────────────────────────────────────
    backstory: `Mẫu từ bệnh nhân nam 28 tuổi, công nhân xây dựng vừa trở về 
từ công trình tại tỉnh Bình Phước sau 3 tháng. Sốt cao từng cơn (39–40°C) kèm 
rét run, đau đầu dữ dội, buồn nôn. Phết máu ngoại vi nhuộm Giemsa ghi nhận 
mật độ ký sinh trùng cao (~2,5%), nhiều hồng cầu mang thể nhẫn nhỏ.`,

    // ── Mô tả hình thái ───────────────────────────────────────────────────
    morphology: `Hồng cầu nhiễm không phóng to (kích thước bình thường). 
Thể nhẫn (ring form) nhỏ, mảnh, chiếm ~1/5 đường kính HC. Một số HC mang 
2–3 thể nhẫn (multi-invasion). Chromatin chấm đơn (single dot). Không thấy 
đốm Maurer. Đặc điểm gợi ý P. falciparum giai đoạn sớm.`,

    // ── Ý nghĩa chẩn đoán ─────────────────────────────────────────────────
    clinicalNote: `Ký sinh trùng sốt rét thể nặng nhất. Cần xác định loài 
ngay bằng RDT (HRP2 antigen) và PCR. Nếu KST falciparum, nhập viện và điều 
trị Artemisinin-based combination therapy (ACT) theo phác đồ Bộ Y tế.`,

    // ── Hướng dẫn quan sát theo vật kính ─────────────────────────────────
    objectiveTips: {
      x4: "Tổng quan tiêu bản. Tìm vùng phết một lớp – nơi HC không chồng lắp nhau. Đánh giá chất lượng tiêu bản.",
      x10: "Phát hiện vùng có mật độ HC nhiễm cao. Ước lượng tỷ lệ KST (%). Quan sát phân bố thể nhẫn.",
      x40: "Đọc chi tiết: đếm thể nhẫn/HC, đánh giá kích thước HC nhiễm (không phóng to = falciparum), tìm giao tử hình lưỡi liềm.",
    },
    scaleBars: { x4: "500 μm", x10: "100 μm", x40: "20 μm" },
    doi: null,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "plasmodium_vivax",
    nameVi: "Plasmodium vivax – Trophozoite & Schizont",
    nameEn: "Plasmodium vivax – Trophozoite & Schizont Stages",
    category: "Ký sinh trùng máu",
    species: "Plasmodium vivax",
    staining: "Giemsa",
    imageKey: "plasmodium_vivax",
    imageUrl: IMAGE_URLS.plasmodium_vivax,
    color: "#7c3aed",
    defaultObjective: "x40",

    backstory: `Mẫu phết máu từ bệnh nhân nữ 34 tuổi, giáo viên tại Đắk Lắk, 
sốt cách nhật 48 giờ (sốt tư nhật), mệt mỏi, lách to độ II. Tiền sử mắc sốt 
rét 2 lần trong 5 năm trước. Nhuộm Giemsa cho thấy nhiều giai đoạn P. vivax 
đồng thời: trophozoite ameboid, schizont trưởng thành và giao tử cầu.`,

    morphology: `Hồng cầu nhiễm phóng to rõ rệt (1.5–2× HC bình thường), 
bào tương nhợt. Đốm Schüffner (Schüffner's stippling) dạng chấm hồng/tím 
đặc trưng phủ khắp HC. Thể trophozoite ameboid – nhân to, bào tương không đều. 
Schizont trưởng thành chia 12–24 merozoite sắp xếp quanh khối hemozoin trung tâm 
(hoa cúc – rosette). Giao tử hình cầu, nhân lớn, chromatin phân tán.`,

    clinicalNote: `P. vivax gây sốt cách nhật 48h, ít gây biến chứng nặng hơn 
P. falciparum. Tuy nhiên thể ngủ (hypnozoite) trong gan có thể tái phát sau 
nhiều năm. Điều trị: Chloroquine (diệt thể máu) + Primaquine 14 ngày (diệt 
hypnozoite). Kiểm tra G6PD trước khi dùng Primaquine.`,

    objectiveTips: {
      x4: "Định hướng tiêu bản, tìm vùng phết đủ mỏng. Ở vật kính x4 chưa thấy chi tiết KST.",
      x10: "Xác định HC nhiễm P. vivax phóng to, bào tương nhợt – dễ nhận so với HC bình thường. Đánh giá mật độ KST tổng thể.",
      x40: "Phân biệt giai đoạn: nhẫn ameboid (bào tương co kéo), trophozoite (nhân to), schizont (rosette), giao tử cầu (nhân phân tán). Quan sát đốm Schüffner.",
    },
    scaleBars: { x4: "500 μm", x10: "100 μm", x40: "20 μm" },
    doi: null,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "trichuris_trichiura_eggs",
    nameVi: "Trứng Trichuris trichiura (Giun tóc)",
    nameEn: "Trichuris trichiura Eggs – Direct Stool Smear",
    category: "Ký sinh trùng đường ruột",
    species: "Trichuris trichiura",
    staining: "Không nhuộm (soi tươi Lugol)",
    imageKey: "trichuris_trichiura_eggs",
    imageUrl: IMAGE_URLS.trichuris_trichiura_eggs,
    color: "#b45309",
    defaultObjective: "x10",

    backstory: `Mẫu phân từ bệnh nhi 7 tuổi, học sinh tiểu học tại huyện 
ngoại thành TP.HCM, đau bụng tái diễn, thiếu máu nhẹ (Hb 10.2 g/dL), 
đôi khi có máu trong phân. Xét nghiệm phân trực tiếp (Kato-Katz) phát 
hiện trứng giun tóc mật độ 3.200 trứng/gram phân – mức nhiễm trung bình. 
Tiêu bản được làm từ kỹ thuật Lugol không cố định.`,

    morphology: `Trứng hình thùng bia (barrel-shaped) đặc trưng, đối xứng 
hai đầu. Kích thước trung bình 50–54 × 22–23 μm. Vỏ dày hai lớp: lớp ngoài 
màu vàng nâu (bile-stained), lớp trong trong suốt. Nút nhầy trong suốt 
(hyaline mucous plugs) nhô ra ở hai cực – dấu hiệu định danh quan trọng nhất. 
Nội chất dạng hạt đều, chưa phân chia phôi (single-celled stage khi thải ra).`,

    clinicalNote: `Nhiễm nặng (>10.000 trứng/g phân) gây hội chứng lỵ 
Trichuris: tiêu chảy máu, sa trực tràng ở trẻ em. Mức nhiễm này (trung bình): 
điều trị Albendazole 400mg liều duy nhất hoặc Mebendazole 100mg × 2 lần/ngày 
× 3 ngày. Vệ sinh tay và thực phẩm là biện pháp phòng ngừa chính.`,

    objectiveTips: {
      x4: "Tổng quan tiêu bản phân. Tìm cấu trúc hình oval/thùng bia màu vàng nâu đậm nổi bật trên nền mờ.",
      x10: "Tiêu chuẩn đọc trứng giun. Xác định hình thùng bia, hai nút nhầy hai đầu (hyaline plugs). Ước lượng mật độ trứng/vi trường để tính cường độ nhiễm.",
      x40: "Quan sát chi tiết vỏ hai lớp, đo kích thước (thước mắt – ocular micrometer). Phân biệt với trứng giun khác. Kiểm tra tình trạng phôi bào (fertilized vs unfertilized).",
    },
    scaleBars: { x4: "1 mm", x10: "200 μm", x40: "50 μm" },
    doi: null,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "pf_accole",
    nameVi: "P. falciparum – Thể nhẫn Accole (Appliqué)",
    nameEn: "P. falciparum – Accole / Appliqué Ring Forms",
    category: "Ký sinh trùng máu",
    species: "Plasmodium falciparum",
    staining: "Giemsa",
    imageKey: "pf_accole",
    imageUrl: IMAGE_URLS.pf_accole,
    color: "#c0392b",
    defaultObjective: "x40",

    backstory: `Mẫu từ bệnh nhân nam 41 tuổi, trở về từ vùng rừng núi 
Campuchia sau đợt làm việc 6 tuần. Sốt cao liên tục 40°C, đau đầu, nước 
tiểu sậm màu. Kết quả RDT: HRP2 (+) mạnh → P. falciparum. Phết máu Giemsa 
độ dày và mỏng đều xác nhận falciparum với ký sinh trùng đặc trưng: thể 
nhẫn accole bám ngoại biên màng hồng cầu.`,

    morphology: `Hồng cầu nhiễm KHÔNG phóng to – kích thước bình thường 
(phân biệt với P. vivax). Thể nhẫn nhỏ và mảnh, đường kính ~1/5 HC. 
Dấu hiệu đặc trưng ACCOLE (appliqué): nhẫn bám sát vào mép ngoài màng HC 
thay vì trung tâm. Chromatin đôi (double chromatin dot) – dấu hiệu đặc 
hiệu cho P. falciparum. Đa nhiễm: 1 HC có thể mang 2–3 nhẫn. 
Không thấy giao tử trong tiêu bản này (giao tử P. falciparum hình lưỡi liềm 
xuất hiện muộn hơn 7–10 ngày).`,

    clinicalNote: `Sốt rét P. falciparum có thể tiến triển thành sốt rét 
ác tính (cerebral malaria, ARDS, suy đa tạng) trong 24–48h. Ký sinh trùng 
falciparum không có giai đoạn máu ở thể tư dưỡng lớn (sequestration vào 
nội mô vi mạch) – vì vậy trên phết máu thường chỉ thấy thể nhẫn sớm. 
Điều trị: Artesunate IV ngay nếu ký sinh trùng ≥1% hoặc có biến chứng.`,

    objectiveTips: {
      x4: "Định hướng phết máu mỏng. Chưa thể phân biệt đặc điểm falciparum ở vật kính này.",
      x10: "Quan sát mật độ HC nhiễm. HC nhiễm không phóng to – mật độ cao, phân bố đều. Đếm tỷ lệ KST trên 1000 HC.",
      x40: "Tìm dấu hiệu ACCOLE: nhẫn bám mép màng. Xác định double chromatin dot. Đếm số nhẫn/HC. Tìm giao tử lưỡi liềm nếu có. Đây là tiêu chuẩn vàng để định loài falciparum trên phết máu.",
    },
    scaleBars: { x4: "500 μm", x10: "100 μm", x40: "20 μm" },
    doi: null,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getSlideById = (id) => SLIDES.find((s) => s.id === id) ?? SLIDES[0];
const getSlidesByCategory = (cat) => SLIDES.filter((s) => s.category === cat);
const ALL_CATEGORIES = [...new Set(SLIDES.map((s) => s.category))];

// ══════════════════════════════════════════════════════════════════════════
// MODULE: controls.js
// ══════════════════════════════════════════════════════════════════════════

// ─── controls.js ──────────────────────────────────────────────────────────────
// Vai trò: Các UI control vật lý của kính hiển vi:
//   • ObjectiveSelector – chọn vật kính x4 / x10 / x40 (hình trụ có tỷ lệ)
//   • EyepieceSelector  – chọn thị kính x10 / x8
//   • RotaryKnob        – ốc vi cấp thứ cấp (SVG tròn có mũi tên xoay)
// KHÔNG chứa: logic ảnh, state slide, layout chính.
// ──────────────────────────────────────────────────────────────────────────────

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

function ObjectiveSelector({ value, onChange }) {
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
          return (
            <div
              key={obj.id}
              onClick={() => onChange(obj.id)}
              title={`${obj.label} – ${obj.desc}`}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                cursor: "pointer",
              }}
            >
              {/* Ống vật kính – chiều cao & rộng tỷ lệ với phóng đại */}
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
                {/* Thấu kính đầu ống */}
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

function EyepieceSelector({ value, onChange }) {
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

function RotaryKnob({ value, onChange }) {
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

// ══════════════════════════════════════════════════════════════════════════
// MODULE: simulation.js
// ══════════════════════════════════════════════════════════════════════════

// ─── simulation.js ────────────────────────────────────────────────────────────
// Vai trò: Viewport kính hiển vi ảo – hiển thị ảnh tiêu bản thật từ Cloudinary
//          với mô phỏng quang học (zoom, blur, pan, vignette, reticle, scale bar).
//          Chứa: toolbar controls, vòng tròn thị kính, thanh trạng thái.
// KHÔNG chứa: data tiêu bản (xem slides.js), URL ảnh (xem images.js),
//             info panel (xem info.js).
// ──────────────────────────────────────────────────────────────────────────────

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

function SlideImage({ slide, objective, focusLevel, pan }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const prevKey = useRef(null);

  const key = `${slide?.id}-${objective}`;
  useEffect(() => {
    if (prevKey.current !== key) {
      setLoaded(false);
      setError(false);
      prevKey.current = key;
    }
  }, [key]);

  const blur = Math.abs(focusLevel);
  const scale = getClientScale(objective);
  const url = slide?.imageUrl
    ? buildOpticalUrl(slide.imageUrl, objective, focusLevel)
    : null;

  return (
    <div style={{ position: "absolute", inset: 0, background: "#f9f8f5" }}>
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
          key={key}
          src={url}
          alt={slide.nameVi}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          draggable={false}
          style={{
            position: "absolute",
            width: `${scale * 100}%`,
            height: `${scale * 100}%`,
            top: `${-(scale - 1) * 50}%`,
            left: `${-(scale - 1) * 50}%`,
            objectFit: "cover",
            transform: `translate(${pan.x * scale * 0.55}px, ${
              pan.y * scale * 0.55
            }px)`,
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
function Simulation({
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
      const lim = 130 + totalMag * 0.35;
      onPan({
        x: Math.max(-lim, Math.min(lim, e.clientX - dragStart.x)),
        y: Math.max(-lim, Math.min(lim, e.clientY - dragStart.y)),
      });
    },
    [isDragging, dragStart, totalMag, onPan]
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
        <ObjectiveSelector value={objective} onChange={onObjectiveChange} />

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
              width: "min(490px, 66vw)",
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

// ══════════════════════════════════════════════════════════════════════════
// MODULE: info.js
// ══════════════════════════════════════════════════════════════════════════

// ─── info.js ──────────────────────────────────────────────────────────────────
// Vai trò: Panel thông tin bên phải – hiển thị đầy đủ:
//   Tab "Tiêu bản"  – thumbnail, backstory lâm sàng, hình thái, ghi chú lâm sàng,
//                     thông số hiện tại, gợi ý quan sát theo vật kính
//   Tab "Quang học" – thông số NA, WD, FOV, công thức phân giải Rayleigh
//   Tab "Tác giả"   – thông tin Lâm Kiến Thành, VLU
// KHÔNG chứa: logic ảnh, viewport, controls.
// ──────────────────────────────────────────────────────────────────────────────

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

// ─── Thông tin tác giả ─────────────────────────────────────────────────────
const AUTHOR = {
  name: "Lâm Kiến Thành, PhD",
  title: "Giảng viên Khoa Kỹ thuật Y học",
  institution: "Trường Đại học Văn Lang",
  city: "TP. Hồ Chí Minh, Việt Nam",
  email: "thanh.lk@vanlanguni.edu.vn",
  expertise: [
    "Khoa học xét nghiệm y học",
    "Vi sinh lâm sàng & kháng sinh đồ",
    "Phân tích hình ảnh tế bào học (Cellpose)",
    "Máy học ứng dụng lâm sàng (Python, React)",
    "Ký sinh trùng y học",
  ],
  note: `App VirtualScope được xây dựng phục vụ giảng dạy môn Kỹ thuật xét nghiệm 
và Vi sinh lâm sàng, Khoa KT Y học, ĐH Văn Lang. Mục tiêu: sinh viên thực hành 
nhận dạng tiêu bản trước khi tiếp cận kính hiển vi thật.`,
};

// ─── InfoPanel (default export) ───────────────────────────────────────────
function InfoPanel({ slide, objective, eyepiece, focusLevel, onClose }) {
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
        {tab === "author" && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            {/* Author card */}
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
                LKT
              </div>
              <div
                style={{ color: "#1a1917", fontWeight: 700, fontSize: "14px" }}
              >
                {AUTHOR.name}
              </div>
              <div
                style={{ color: "#6b6760", fontSize: "11px", marginTop: "3px" }}
              >
                {AUTHOR.title}
              </div>
              <div
                style={{
                  color: "#1d6fa4",
                  fontSize: "11px",
                  marginTop: "4px",
                  fontWeight: 600,
                }}
              >
                {AUTHOR.institution}
              </div>
              <div
                style={{ color: "#a8a49e", fontSize: "10px", marginTop: "2px" }}
              >
                {AUTHOR.city}
              </div>
            </div>

            {/* Chuyên môn */}
            <Section title="CHUYÊN MÔN" color="#1d6fa4">
              {AUTHOR.expertise.map((e, i) => (
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

            {/* Liên hệ */}
            <div style={{ borderTop: "1px solid #dedad4", paddingTop: "12px" }}>
              <div
                style={{
                  color: "#1d6fa4",
                  fontSize: "11px",
                  marginBottom: "8px",
                }}
              >
                ✉ {AUTHOR.email}
              </div>
            </div>

            {/* Ghi chú app */}
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
                VỀ APP NÀY
              </div>
              <Body>{AUTHOR.note}</Body>
            </div>
          </div>
        )}
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

// ══════════════════════════════════════════════════════════════════════════
// MODULE: app.js
// ══════════════════════════════════════════════════════════════════════════

// ─── App.js ───────────────────────────────────────────────────────────────────
// Vai trò: Root orchestrator – quản lý toàn bộ state ứng dụng, layout chính,
//          kết nối các module lại với nhau.
//
// Module dependencies:
//   images.js    – URL ảnh Cloudinary + transform builder
//   slides.js    – SLIDES data (metadata, backstory, tips)
//   controls.js  – ObjectiveSelector, EyepieceSelector, RotaryKnob
//   simulation.js – Viewport kính hiển vi
//   info.js       – Info panel
//
// State quản lý tại đây (lifted state):
//   slideId, objective, eyepiece, focusLevel, pan
//   showDrawer, showInfo
// ──────────────────────────────────────────────────────────────────────────────

// ─── Theme ──────────────────────────────────────────────────────────────────
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

// ─── MicroscopeSchematic – sơ đồ kính hiển vi mini ─────────────────────────
function MicroscopeSchematic({ objective, eyepiece, focusLevel }) {
  const tubeH = { x4: 13, x10: 22, x40: 36 }[objective] ?? 22;
  const objColor = { x4: "#1a7a42", x10: "#1d6fa4", x40: "#7c3aed" }[objective];
  const inFocus = focusLevel === 0;

  return (
    <svg width="100%" viewBox="0 0 130 158" fill="none" aria-hidden="true">
      {/* Thị kính */}
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

      {/* Ống kính */}
      <rect
        x="58"
        y="17"
        width="14"
        height="30"
        stroke={C.border}
        strokeWidth="0.8"
        fill={C.surfaceAlt}
      />

      {/* Mâm vật kính (revolving nosepiece) */}
      <ellipse
        cx="65"
        cy="50"
        rx="20"
        ry="6"
        stroke={C.borderMid}
        strokeWidth="0.8"
        fill={C.surfaceAlt}
      />

      {/* Vật kính – chiều cao tỷ lệ */}
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

      {/* Bàn kính */}
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

      {/* Đường tiêu cự – xê dịch theo focusLevel */}
      <line
        x1="28"
        y1={63 + tubeH + focusLevel * 1.5}
        x2="102"
        y2={63 + tubeH + focusLevel * 1.5}
        stroke={inFocus ? C.green : "#c45c10"}
        strokeWidth="0.8"
        strokeDasharray={inFocus ? "0" : "3 2"}
      />

      {/* Đế kính */}
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

      {/* Cánh tay kính (arm) */}
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

// ─── SlideDrawer – danh mục tiêu bản bên trái ──────────────────────────────
function SlideDrawer({ slideId, onSelect, objective, eyepiece, focusLevel }) {
  return (
    <div
      style={{
        width: "220px",
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
          DANH MỤC TIÊU BẢN
        </span>
        <span style={{ color: C.textFaint, fontSize: "9px" }}>
          {SLIDES.length}
        </span>
      </div>

      {/* Category + slide list */}
      <div style={{ overflowY: "auto", flex: 1 }}>
        {ALL_CATEGORIES.map((cat) => (
          <div key={cat}>
            {/* Category label */}
            <div
              style={{
                padding: "8px 14px 4px",
                fontSize: "8px",
                fontWeight: 700,
                letterSpacing: "0.14em",
                color: C.textFaint,
                borderBottom: `1px solid ${C.border}`,
                background: C.surfaceAlt,
              }}
            >
              {cat.toUpperCase()}
            </div>

            {/* Slides in this category */}
            {SLIDES.filter((s) => s.category === cat).map((s) => {
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
                    borderLeft: `3px solid ${active ? s.color : "transparent"}`,
                    borderBottom: `1px solid ${C.border}`,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.14s",
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    style={{
                      position: "relative",
                      height: "52px",
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
                        opacity: active ? 1 : 0.55,
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
                          background: "rgba(255,255,255,0.2)",
                        }}
                      />
                    )}
                  </div>
                  {/* Metadata */}
                  <div
                    style={{
                      padding: "7px 12px",
                      background: active ? s.color + "08" : "transparent",
                    }}
                  >
                    <div
                      style={{
                        color: active ? C.text : C.textMuted,
                        fontSize: "10px",
                        lineHeight: 1.35,
                        fontFamily: "inherit",
                      }}
                    >
                      {s.nameVi}
                    </div>
                    <div
                      style={{
                        color: C.textFaint,
                        fontSize: "8px",
                        marginTop: "2px",
                        fontFamily: "monospace",
                      }}
                    >
                      {s.species} · {s.defaultObjective} recommended
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Microscope schematic at bottom */}
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

// ─── Navbar ────────────────────────────────────────────────────────────────
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
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
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
          <div
            style={{
              color: C.text,
              fontSize: "13px",
              fontWeight: 800,
              letterSpacing: "0.04em",
            }}
          >
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

      {/* Current slide badge */}
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
          }}
        >
          <div
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: slide.color,
            }}
          />
          <span style={{ color: C.text, fontSize: "11px", fontWeight: 500 }}>
            {slide.nameVi}
          </span>
          <span style={{ color: C.border }}>|</span>
          <span
            style={{
              color: C.textFaint,
              fontSize: "10px",
              fontStyle: "italic",
            }}
          >
            {slide.species}
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

// ─── App (default export) ──────────────────────────────────────────────────
function App() {
  // ── Global state ────────────────────────────────────────────────────────
  const [slideId, setSlideId] = useState("pf_accole");
  const [objective, setObjective] = useState("x40");
  const [eyepiece, setEyepiece] = useState("x10");
  const [focusLevel, setFocusLevel] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showDrawer, setShowDrawer] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  const slide = getSlideById(slideId);

  // ── Handlers ────────────────────────────────────────────────────────────
  // Đổi tiêu bản: reset focus và pan, áp dụng defaultObjective
  const handleSlideChange = useCallback((id) => {
    const s = SLIDES.find((s) => s.id === id);
    setSlideId(id);
    setFocusLevel(0);
    setPan({ x: 0, y: 0 });
    if (s?.defaultObjective) setObjective(s.defaultObjective);
  }, []);

  // Đổi vật kính: reset focus và pan
  const handleObjectiveChange = useCallback((obj) => {
    setObjective(obj);
    setFocusLevel(0);
    setPan({ x: 0, y: 0 });
  }, []);

  // ── Layout ──────────────────────────────────────────────────────────────
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
      {/* Navbar */}
      <Navbar
        slide={slide}
        showDrawer={showDrawer}
        showInfo={showInfo}
        onToggleDrawer={() => setShowDrawer((v) => !v)}
        onToggleInfo={() => setShowInfo((v) => !v)}
      />

      {/* Body */}
      <div
        style={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Slide drawer */}
        {showDrawer && (
          <SlideDrawer
            slideId={slideId}
            onSelect={handleSlideChange}
            objective={objective}
            eyepiece={eyepiece}
            focusLevel={focusLevel}
          />
        )}

        {/* Main viewport */}
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

        {/* Info panel (overlay) */}
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
