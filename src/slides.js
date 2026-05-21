// ─── images.js ────────────────────────────────────────────────────────────────
// Vai trò: URL ảnh Cloudinary thô + CSS scale theo vật kính.
// Zoom/blur/pan xử lý hoàn toàn bằng CSS phía client.
// ──────────────────────────────────────────────────────────────────────────────

export const IMAGE_URLS = {
  // defaultObjective: vật kính mà ảnh gốc được chụp ở độ phóng đại đó
  // App.js đọc giá trị này để set scale CSS đúng (x4=1.0 là baseline)

  malaria_rbc_giemsa: {
    url: "https://res.cloudinary.com/de5k4mw3a/image/upload/v1779256638/65343_c3cp1q.jpg",
    defaultObjective: "x40", // ảnh chụp ở x40
  },

  plasmodium_vivax: {
    url: "https://res.cloudinary.com/de5k4mw3a/image/upload/v1779256638/Plasmodium_vivax_lgqpxb.jpg",
    defaultObjective: "x40", // ảnh chụp ở x40
  },

  trichuris_trichiura_eggs: {
    url: "https://res.cloudinary.com/de5k4mw3a/image/upload/v1779256639/eggs-trichuris-trichiura-whipworm-stool-analyze-by-microscope_581734-1511_zrhodz.avif",
    defaultObjective: "x10", // ảnh chụp ở x10
  },

  pf_accole: {
    url: "https://res.cloudinary.com/de5k4mw3a/image/upload/v1779256640/PF_accole_ucmtrh.png",
    defaultObjective: "x40", // ảnh chụp ở x40
  },
};

// Trả về raw URL từ entry
export function buildOpticalUrl(imageEntry) {
  if (!imageEntry) return null;
  return typeof imageEntry === "string" ? imageEntry : imageEntry.url;
}

// Bậc phóng đại tuyệt đối của từng vật kính
const MAG = { x4: 4, x10: 10, x40: 40 };

// getClientScale(objective, defaultObjective)
//   objective        – vật kính đang chọn: "x4" | "x10" | "x40"
//   defaultObjective – vật kính ảnh được chụp (từ slide.defaultObjective)
// Luôn >= 1.0 vì ObjectiveSelector ẩn vật kính thấp hơn defaultObjective
export function getClientScale(objective, defaultObjective = "x40") {
  return Math.max(1.0, MAG[objective] / MAG[defaultObjective]);
}
