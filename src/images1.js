// ─── images1.js ───────────────────────────────────────────────────────────────
// Chương trình: Đại học – Ký sinh trùng
// Mỗi entry là một tiêu bản đầy đủ: URL ảnh + metadata + nội dung học thuật.
// App.js đọc file này và tự gom vào folder theo trường `folder`.
// ──────────────────────────────────────────────────────────────────────────────

export const SLIDES_1 = [
  {
    id: "malaria_rbc_giemsa",
    nameVi: "Phết máu Giemsa – Thể nhẫn mật độ cao",
    nameEn: "Giemsa Blood Film – High-density Ring Forms",
    folder: "Đại học / Ký sinh trùng / Ký sinh trùng máu",
    category: "Ký sinh trùng máu",
    species: "Plasmodium sp.",
    staining: "Giemsa",
    color: "#4f46e5",
    author: {
      name: "Lâm Kiến Thành, MD",
      title: "Giảng viên Khoa Kỹ thuật Y học",
      institution: "Trường Đại học Văn Lang",
      email: "thanh.lk@vlu.edu.vn",
    },
    imageUrl:
      "https://res.cloudinary.com/de5k4mw3a/image/upload/v1779256638/65343_c3cp1q.jpg",
    defaultObjective: "x10",
    backstory: `Mẫu từ bệnh nhân nam 28 tuổi, công nhân xây dựng vừa trở về từ công trình tại tỉnh Bình Phước sau 3 tháng. Sốt cao từng cơn (39–40°C) kèm rét run, đau đầu dữ dội, buồn nôn. Phết máu ngoại vi nhuộm Giemsa ghi nhận mật độ ký sinh trùng cao (~2,5%), nhiều hồng cầu mang thể nhẫn nhỏ.`,
    morphology: `Hồng cầu nhiễm không phóng to (kích thước bình thường). Thể nhẫn (ring form) nhỏ, mảnh, chiếm ~1/5 đường kính HC. Một số HC mang 2–3 thể nhẫn (multi-invasion). Chromatin chấm đơn (single dot). Không thấy đốm Maurer. Đặc điểm gợi ý P. falciparum giai đoạn sớm.`,
    clinicalNote: `Ký sinh trùng sốt rét thể nặng nhất. Cần xác định loài ngay bằng RDT (HRP2 antigen) và PCR. Nếu KST falciparum, nhập viện và điều trị Artemisinin-based combination therapy (ACT) theo phác đồ Bộ Y tế.`,
    objectiveTips: {
      x10: "Phát hiện vùng có mật độ HC nhiễm cao. Ước lượng tỷ lệ KST (%). Quan sát phân bố thể nhẫn.",
      x40: "Đọc chi tiết: đếm thể nhẫn/HC, đánh giá kích thước HC nhiễm (không phóng to = falciparum), tìm giao tử hình lưỡi liềm.",
    },
    scaleBars: { x10: "100 μm", x40: "20 μm" },
  },

  {
    id: "plasmodium_vivax",
    nameVi: "Plasmodium vivax – Trophozoite & Schizont",
    nameEn: "Plasmodium vivax – Trophozoite & Schizont Stages",
    folder: "Đại học / Ký sinh trùng / Ký sinh trùng máu",
    category: "Ký sinh trùng máu",
    species: "Plasmodium vivax",
    staining: "Giemsa",
    color: "#7c3aed",
    author: {
      name: "Lâm Kiến Thành, MD.",
      title: "Giảng viên Khoa Kỹ thuật Y học",
      institution: "Trường Đại học Văn Lang",
      email: "thanh.lk@vlu.edu.vn",
    },
    imageUrl:
      "https://res.cloudinary.com/de5k4mw3a/image/upload/v1779256638/Plasmodium_vivax_lgqpxb.jpg",
    defaultObjective: "x40",
    backstory: `Mẫu phết máu từ bệnh nhân nữ 34 tuổi, giáo viên tại Đắk Lắk, sốt cách nhật 48 giờ (sốt tư nhật), mệt mỏi, lách to độ II. Tiền sử mắc sốt rét 2 lần trong 5 năm trước. Nhuộm Giemsa cho thấy nhiều giai đoạn P. vivax đồng thời: trophozoite ameboid, schizont trưởng thành và giao tử cầu.`,
    morphology: `Hồng cầu nhiễm phóng to rõ rệt (1.5–2× HC bình thường), bào tương nhợt. Đốm Schüffner (Schüffner's stippling) dạng chấm hồng/tím đặc trưng phủ khắp HC. Thể trophozoite ameboid – nhân to, bào tương không đều. Schizont trưởng thành chia 12–24 merozoite sắp xếp quanh khối hemozoin trung tâm (hoa cúc – rosette). Giao tử hình cầu, nhân lớn, chromatin phân tán.`,
    clinicalNote: `P. vivax gây sốt cách nhật 48h, ít gây biến chứng nặng hơn P. falciparum. Tuy nhiên thể ngủ (hypnozoite) trong gan có thể tái phát sau nhiều năm. Điều trị: Chloroquine (diệt thể máu) + Primaquine 14 ngày (diệt hypnozoite). Kiểm tra G6PD trước khi dùng Primaquine.`,
    objectiveTips: {
      x10: "Xác định HC nhiễm P. vivax phóng to, bào tương nhợt – dễ nhận so với HC bình thường. Đánh giá mật độ KST tổng thể.",
      x40: "Phân biệt giai đoạn: nhẫn ameboid, trophozoite, schizont (rosette), giao tử cầu. Quan sát đốm Schüffner.",
    },
    scaleBars: { x40: "20 μm" },
  },

  {
    id: "pf_accole",
    nameVi: "P. falciparum – Thể nhẫn Accole (Appliqué)",
    nameEn: "P. falciparum – Accole / Appliqué Ring Forms",
    folder: "Đại học / Ký sinh trùng / Ký sinh trùng máu",
    category: "Ký sinh trùng máu",
    species: "Plasmodium falciparum",
    staining: "Giemsa",
    color: "#c0392b",
    author: {
      name: "Lâm Kiến Thành, MD",
      title: "Giảng viên Khoa Kỹ thuật Y học",
      institution: "Trường Đại học Văn Lang",
      email: "thanh.lk@vlu.edu.vn",
    },
    imageUrl:
      "https://res.cloudinary.com/de5k4mw3a/image/upload/v1779256640/PF_accole_ucmtrh.png",
    defaultObjective: "x40",
    backstory: `Mẫu từ bệnh nhân nam 41 tuổi, trở về từ vùng rừng núi Campuchia sau đợt làm việc 6 tuần. Sốt cao liên tục 40°C, đau đầu, nước tiểu sậm màu. Kết quả RDT: HRP2 (+) mạnh → P. falciparum. Phết máu Giemsa xác nhận falciparum với thể nhẫn accole đặc trưng.`,
    morphology: `Hồng cầu nhiễm KHÔNG phóng to. Thể nhẫn nhỏ và mảnh (~1/5 HC). Dấu hiệu ACCOLE (appliqué): nhẫn bám sát vào mép ngoài màng HC. Chromatin đôi (double chromatin dot) – dấu hiệu đặc hiệu cho P. falciparum. Đa nhiễm: 1 HC có thể mang 2–3 nhẫn.`,
    clinicalNote: `Sốt rét P. falciparum có thể tiến triển thành sốt rét ác tính trong 24–48h. Điều trị: Artesunate IV ngay nếu ký sinh trùng ≥1% hoặc có biến chứng.`,
    objectiveTips: {
      x10: "Quan sát mật độ HC nhiễm. HC nhiễm không phóng to – mật độ cao, phân bố đều.",
      x40: "Tìm dấu hiệu ACCOLE: nhẫn bám mép màng. Xác định double chromatin dot. Đây là tiêu chuẩn vàng định loài falciparum.",
    },
    scaleBars: { x40: "20 μm" },
  },

  {
    id: "entamoeba_cyst_stool",
    nameVi: "Nang Entamoeba – Soi tươi phân (Lugol)",
    nameEn: "Entamoeba Cyst – Direct Stool Smear (Lugol)",
    folder: "Đại học / Ký sinh trùng / Ký sinh trùng đường ruột",
    category: "Ký sinh trùng đường ruột",
    species: "Entamoeba sp.",
    staining: "Không nhuộm / Lugol loãng",
    color: "#92400e",
    author: {
      name: "Phạm Thị Mỹ Tiên, MD; Ngô Văn Hóa, Trần Hứa Gia Bảo ",
      title: "Khoa Kỹ thuật Y học",
      institution: "Trường Đại học Văn Lang",
      email: "tien.ptm@vlu.edu.vn",
    },
    imageUrl:
      "https://res.cloudinary.com/de5k4mw3a/image/upload/v1779346592/hinh_tron_oj1pqp.png",
    defaultObjective: "x40",
    backstory: `Mẫu phân từ bệnh nhân nữ 26 tuổi, nhân viên văn phòng tại TP.HCM, đau bụng âm ỉ vùng hố chậu phải, tiêu chảy không máu tái diễn 3 tuần. Không sốt. Xét nghiệm phân soi tươi phát hiện nang tròn đơn độc kích thước lớn trên nền nhiều mảnh vụn thực phẩm và vi khuẩn. Gửi thêm mẫu nhuộm trichrome để xác định loài.`,
    morphology: `Nang hình cầu đều, đường kính ước tính 15–20 μm (lớn → gợi ý E. histolytica/dispar hoặc E. coli). Vỏ nang dày, nhẵn, bắt màu hồng nhạt. Nội chất dạng hạt mịn, đồng đều. Ở độ phóng đại x40, chưa phân biệt được số nhân hay thể vùi glycogen rõ ràng – cần nhuộm Lugol đậm đặc hoặc trichrome để xác định số nhân (≤4 nhân = E. histolytica/dispar; 8 nhân = E. coli). Nền tiêu bản: nhiều mảnh vụn thực phẩm, vi khuẩn, bạch cầu rải rác.`,
    clinicalNote: `E. histolytica gây lỵ amip (tiêu chảy máu) và áp-xe gan amip. E. dispar và E. coli không gây bệnh. Không thể phân biệt E. histolytica/dispar trên hình thái – cần xét nghiệm ELISA kháng nguyên hoặc PCR phân. Điều trị khi xác định E. histolytica: Metronidazole 750mg × 3 lần/ngày × 10 ngày + Paromomycin diệt nang ruột.`,
    objectiveTips: {
      x10: "Quét toàn bộ tiêu bản tìm nang tròn to, đồng đều, nổi bật so với nền mảnh vụn. Ước lượng số lượng nang/vi trường.",
      x40: "Đánh giá kích thước, vỏ nang, nội chất. Nhỏ thêm 1 giọt Lugol đậm để hiện nhân và thể vùi glycogen (màu vàng nâu). Đếm số nhân để định loài Entamoeba.",
    },
    scaleBars: { x40: "20 μm" },
  },

  {
    id: "entamoeba_cyst_multi_lugol",
    nameVi: "Nang Entamoeba – Nhiều nang, soi tươi Lugol",
    nameEn: "Entamoeba Cysts – Multiple Cysts, Lugol Wet Mount",
    folder: "Đại học / Ký sinh trùng / Ký sinh trùng đường ruột",
    category: "Ký sinh trùng đường ruột",
    species: "Entamoeba sp. (cần xác định loài)",
    staining: "Lugol loãng",
    color: "#92400e",
    author: {
      name: "Phạm Thị Mỹ Tiên, MD; Ngô Văn Hóa, Trần Hứa Gia Bảo ",
      title: "Khoa Kỹ thuật Y học",
      institution: "Trường Đại học Văn Lang",
      email: "tien.ptm@vlu.edu.vn",
    },
    imageUrl:
      "https://res.cloudinary.com/de5k4mw3a/image/upload/v1779346740/hinh_tron_2_yz2y6y.png",
    defaultObjective: "x40",
    backstory: `Mẫu phân từ bệnh nhân nữ 26 tuổi, nhân viên văn phòng tại TP.HCM, đau bụng âm ỉ vùng hố chậu phải, tiêu chảy không máu tái diễn 3 tuần. Không sốt. Xét nghiệm phân soi tươi phát hiện nang tròn đơn độc kích thước lớn trên nền nhiều mảnh vụn thực phẩm và vi khuẩn. Gửi thêm mẫu nhuộm trichrome để xác định loài.`,
    morphology: `Quan sát được 2–3 nang hình cầu trên cùng một vi trường – mật độ khá cao, gợi ý nhiễm nặng. Nang lớn (đường kính ước tính 15–20 μm): vỏ dày, nhẵn, bắt màu cam đỏ với Lugol; nội chất hạt mịn đồng đều. Nang nhỏ hơn (~8–10 μm, góc phải dưới): vỏ mỏng hơn, nội chất ít hạt hơn – có thể là giai đoạn nang non hoặc loài khác (Endolimax nana, Iodamoeba bütschlii). Nền tiêu bản: chất nhầy đặc, mảnh vụn thực phẩm, hồng cầu rải rác gợi ý viêm niêm mạc nhẹ.`,
    clinicalNote: `Hiện diện nhiều nang/vi trường và hồng cầu trên nền nhầy → không loại trừ E. histolytica. Ưu tiên: (1) ELISA kháng nguyên E. histolytica trong phân, (2) PCR phân nếu có điều kiện. Nếu xác định E. histolytica: Metronidazole 750mg × 3/ngày × 10 ngày + Paromomycin 500mg × 3/ngày × 7 ngày. E. coli và Endolimax nana: không cần điều trị đặc hiệu.`,
    objectiveTips: {
      x10: "Phát hiện vùng nhiều nang tập trung. Đánh giá mật độ và phân bố nang trên toàn tiêu bản. Chú ý nền nhầy – chỉ điểm viêm đường ruột.",
      x40: "So sánh kích thước các nang trong cùng vi trường (phân biệt loài). Tìm nhân bằng Lugol đậm: E. histolytica/dispar ≤4 nhân, E. coli 8 nhân, Endolimax nana 4 nhân nhỏ. Quan sát thể vùi glycogen: bắt màu vàng nâu đậm với Lugol.",
    },
    scaleBars: { x40: "20 μm" },
  },

  {
    id: "fasciola_adult_wet_mount",
    nameVi: "Sán lá gan lớn – Tiêu bản soi tươi (không nhuộm)",
    nameEn: "Liver Fluke – Adult/Fragment, Direct Wet Mount",
    folder: "Đại học / Ký sinh trùng / Ký sinh trùng gan mật",
    category: "Ký sinh trùng gan mật",
    species: "Fasciola sp.",
    staining: "Không nhuộm (soi tươi nước muối sinh lý)",
    color: "#78350f",
    author: {
      name: "Phạm Thị Mỹ Tiên, MD; Ngô Văn Hóa, Trần Hứa Gia Bảo ",
      title: "Khoa Kỹ thuật Y học",
      institution: "Trường Đại học Văn Lang",
      email: "tien.ptm@vlu.edu.vn",
    },
    imageUrl:
      "https://res.cloudinary.com/de5k4mw3a/image/upload/v1779347236/san_la_gan_wuiccj.png",
    defaultObjective: "x40",
    backstory: `Mẫu dịch tá tràng từ bệnh nhân nữ 45 tuổi, nông dân tại vùng Đồng bằng sông Cửu Long, đau hạ sườn phải âm ỉ 4 tháng, vàng da nhẹ, sốt nhẹ về chiều. Siêu âm bụng: ống mật chủ giãn nhẹ, gan to. Xét nghiệm: bạch cầu ái toan 18% (tăng cao). Dịch tá tràng soi tươi phát hiện vật thể lạ hình bầu dục lớn màu vàng nâu.`,
    morphology: `Vật thể hình bầu dục/lá, kích thước lớn (ước tính >1 mm theo thang vi trường x10), màu vàng nâu đặc trưng do tích lũy sắc tố mật (bile-stained). Bề mặt không đều, có thể là mảnh thân sán hoặc sán trưởng thành bị ép dẹt dưới lam. Bên cạnh: một mảnh nhỏ hơn (có thể là mảnh vụn mô hoặc phần phụ của sán). Nền tiêu bản phía trái: nhiều tế bào biểu mô trụ (niêm mạc tá tràng), bạch cầu đa nhân, mảnh vụn tế bào – bối cảnh viêm đường mật.`,
    clinicalNote: `Fasciola hepatica/gigantica: sán lá gan lớn, lây qua rau thủy sinh (rau muống, ngó sen, cải xoong). Giai đoạn cấp: ấu trùng xuyên thành ruột → gan → viêm gan tăng bạch cầu ái toan. Giai đoạn mạn: sán trưởng thành trong ống mật → viêm xơ đường mật, sỏi mật. Điều trị: Triclabendazole 10mg/kg (Fasciola) hoặc Praziquantel 75mg/kg/ngày × 2 ngày (Clonorchis).`,
    objectiveTips: {
      x10: "Xác định hình thái tổng thể: hình bầu dục/lá, màu vàng nâu, kích thước lớn bất thường so với tế bào xung quanh. Đây là độ phóng đại phù hợp nhất để định danh ban đầu sán lá.",
      x40: "Tìm giác miệng (oral sucker) và giác bụng (ventral sucker/acetabulum) để xác định loài. Quan sát cấu trúc tử cung (trứng bên trong nếu sán trưởng thành). Đo kích thước để phân biệt Fasciola vs Clonorchis.",
    },
    scaleBars: { x10: "500 μm", x40: "100 μm" },
  },

  {
    id: "trichuris_trichiura_eggs",
    nameVi: "Trứng Trichuris trichiura (Giun tóc)",
    nameEn: "Trichuris trichiura Eggs – Direct Stool Smear",
    folder: "Đại học / Ký sinh trùng / Ký sinh trùng đường ruột",
    category: "Ký sinh trùng đường ruột",
    species: "Trichuris trichiura",
    staining: "Không nhuộm (soi tươi Lugol)",
    color: "#b45309",
    author: {
      name: "Lâm Kiến Thành, MD",
      title: "Giảng viên Khoa Kỹ thuật Y học",
      institution: "Trường Đại học Văn Lang",
      email: "thanh.lk@vlu.edu.vn",
    },
    imageUrl:
      "https://res.cloudinary.com/de5k4mw3a/image/upload/v1779256639/eggs-trichuris-trichiura-whipworm-stool-analyze-by-microscope_581734-1511_zrhodz.avif",
    defaultObjective: "x40",
    backstory: `Mẫu phân từ bệnh nhi 7 tuổi, học sinh tiểu học tại huyện ngoại thành TP.HCM, đau bụng tái diễn, thiếu máu nhẹ (Hb 10.2 g/dL). Xét nghiệm phân trực tiếp (Kato-Katz) phát hiện trứng giun tóc mật độ 3.200 trứng/gram phân – mức nhiễm trung bình.`,
    morphology: `Trứng hình thùng bia (barrel-shaped) đặc trưng. Kích thước ~50–54 × 22–23 μm. Vỏ dày hai lớp: lớp ngoài màu vàng nâu (bile-stained), lớp trong trong suốt. Nút nhầy trong suốt (hyaline mucous plugs) nhô ra ở hai cực – dấu hiệu định danh quan trọng nhất. Nội chất dạng hạt đều, chưa phân chia phôi.`,
    clinicalNote: `Nhiễm nặng (>10.000 trứng/g phân) gây hội chứng lỵ Trichuris: tiêu chảy máu, sa trực tràng ở trẻ em. Điều trị: Albendazole 400mg liều duy nhất hoặc Mebendazole 100mg × 2 lần/ngày × 3 ngày.`,
    objectiveTips: {
      x10: "Xác định trứng Trichuris: hình thùng bia, màu vàng nâu đậm, hai nút nhầy (hyaline plugs) hai đầu. Ước lượng mật độ trứng/vi trường.",
      x40: "Quan sát chi tiết vỏ hai lớp, đo kích thước. Phân biệt với trứng giun khác.",
    },
    scaleBars: { x10: "200 μm", x40: "50 μm" },
  },
];
