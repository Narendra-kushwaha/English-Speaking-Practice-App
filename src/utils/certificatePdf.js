import jsPDF from "jspdf";
import QRCode from "qrcode";

function formatDate(value) {
  if (!value) return "N/A";

  try {
    if (value?.toDate) value = value.toDate();

    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return String(value);
  }
}

function imageFormat(image) {
  if (!image) return "PNG";
  if (image.includes("image/jpeg") || image.includes("image/jpg")) return "JPEG";
  return "PNG";
}

function addImageSafe(doc, image, x, y, w, h) {
  if (!image) return;

  try {
    doc.addImage(image, imageFormat(image), x, y, w, h);
  } catch (err) {
    console.warn("Certificate image skipped:", err);
  }
}

function makeCertificateId(studentId) {
  const year = new Date().getFullYear();
  const shortId = String(studentId || "000001")
    .replace(/[^a-z0-9]/gi, "")
    .slice(-6)
    .toUpperCase();

  return `CERT-${year}-${shortId || "000001"}`;
}

function text(doc, value, x, y, options = {}) {
  const {
    size = 12,
    color = [0, 0, 0],
    font = "helvetica",
    style = "normal",
    align = "left",
    charSpace = 0,
  } = options;

  doc.setFont(font, style);
  doc.setFontSize(size);
  doc.setTextColor(...color);
  doc.setCharSpace(charSpace);
  doc.text(String(value || ""), x, y, { align });
  doc.setCharSpace(0);
}

function center(doc, value, y, options = {}) {
  text(doc, value, 148.5, y, { ...options, align: "center" });
}

function drawDivider(doc, y, withThreeStars = true) {
  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.35);

  if (withThreeStars) {
    doc.line(35, y, 116, y);
    doc.line(181, y, 262, y);

    text(doc, "✦", 137, y + 1.8, {
      size: 9,
      color: [201, 168, 76],
      align: "center",
    });

    text(doc, "✦", 148.5, y + 1.8, {
      size: 9,
      color: [201, 168, 76],
      align: "center",
    });

    text(doc, "✦", 160, y + 1.8, {
      size: 9,
      color: [201, 168, 76],
      align: "center",
    });
  } else {
    doc.line(35, y, 139, y);
    doc.line(158, y, 262, y);

    text(doc, "✦", 148.5, y + 1.8, {
      size: 9,
      color: [201, 168, 76],
      align: "center",
    });
  }
}

function drawStatCell(doc, x, y, w, h, value, label) {
  doc.setFillColor(201, 168, 76, 0.06);
  doc.rect(x, y, w, h, "F");

  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.35);
  doc.rect(x, y, w, h);

  text(doc, value, x + w / 2, y + 10, {
    size: 13,
    color: [26, 58, 92],
    style: "bold",
    align: "center",
  });

  text(doc, label.toUpperCase(), x + w / 2, y + 18, {
    size: 6.5,
    color: [138, 122, 80],
    style: "bold",
    align: "center",
    charSpace: 0.5,
  });
}

function drawSealPlaceholder(doc, x, y, size, sealImage) {
  if (sealImage) {
    addImageSafe(doc, sealImage, x, y, size, size);
    return;
  }

  const cx = x + size / 2;
  const cy = y + size / 2;

  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(1.2);
  doc.circle(cx, cy, size / 2);

  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.4);
  doc.circle(cx, cy, size / 2 - 3);

  text(doc, "★", cx, cy - 8, {
    size: 9,
    color: [201, 168, 76],
    align: "center",
    style: "bold",
  });

  text(doc, "VERIFIED", cx, cy, {
    size: 6.5,
    color: [201, 168, 76],
    align: "center",
    style: "bold",
  });

  text(doc, "CERTIFIED", cx, cy + 7, {
    size: 6.5,
    color: [201, 168, 76],
    align: "center",
    style: "bold",
  });
}

export async function generateCertificatePdf({
  student = {},
  certificate = {},
  settings = {},
  progress = {},
  adminProfile = {},
} = {}) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const W = 297;
  const H = 210;

  const bg = [255, 254, 247];
  const bg2 = [253, 248, 225];
  const gold = [201, 168, 76];
  const navy = [26, 58, 92];
  const textDark = [68, 68, 68];
  const muted = [138, 122, 80];

  const studentName =
    certificate.studentName ||
    student.fullName ||
    student.name ||
    "Student Name";

  const instituteName =
    certificate.instituteName ||
    settings.instituteName ||
    adminProfile.instituteName ||
    adminProfile.fullName ||
    "Bright Future Institute";

  const academyTitle =
    settings.academyTitle ||
    certificate.academyTitle ||
    settings.courseTitle ||
    instituteName ||
    "English Learning Academy";

  const courseName =
    certificate.courseName ||
    settings.courseName ||
    "English Practice Course";

  const adminName =
    certificate.adminName ||
    settings.adminName ||
    adminProfile.fullName ||
    "Course Instructor";

  const totalScore = certificate.totalScore ?? progress.totalScore ?? 0;
  const totalCorrect = certificate.totalCorrect ?? progress.totalCorrect ?? 0;
  const totalWrong = certificate.totalWrong ?? progress.totalWrong ?? 0;

  const totalCompleted =
    certificate.totalCompleted ?? Number(totalCorrect) + Number(totalWrong);

  const accuracy =
    certificate.accuracy ??
    (totalCompleted > 0
      ? ((Number(totalCorrect) / Number(totalCompleted)) * 100).toFixed(1)
      : "0.0");

  const level =
    certificate.level ||
    progress.currentLevel ||
    settings.defaultLevel ||
    "Advanced";

  const startDate =
    certificate.startDate ||
    student.createdAt ||
    student.joiningDate ||
    student._at ||
    null;

  const endDate =
    certificate.endDate ||
    settings.defaultEndDate ||
    new Date();

  const issueDate = certificate.issueDate || new Date();

  const certId =
    certificate.certificateId ||
    makeCertificateId(certificate.studentId || student.uid || student.id);

  const logo = settings.logo || certificate.logo || "";
  const signature = settings.signature || certificate.signature || "";
  const seal = settings.seal || certificate.seal || "";

  const qrPayload = JSON.stringify({
    certificateId: certId,
    studentName,
    instituteName,
    courseName,
    issueDate: formatDate(issueDate),
    score: totalScore,
    accuracy: `${accuracy}%`,
  });

  const qrImage = await QRCode.toDataURL(qrPayload, {
    margin: 1,
    width: 220,
    color: {
      dark: "#1a3a5c",
      light: "#fffef7",
    },
  });

  // Background
  doc.setFillColor(...bg);
  doc.rect(0, 0, W, H, "F");

  doc.setFillColor(...bg2);
  doc.rect(12, 12, W - 24, H - 24, "F");

  // Outer border
  doc.setDrawColor(...gold);
  doc.setLineWidth(1.2);
  doc.rect(10, 10, W - 20, H - 20);

  // Inner border
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.45);
  doc.rect(15, 15, W - 30, H - 30);

  // Corner ornaments
  text(doc, "❋", 18, 22, { size: 13, color: gold, style: "bold" });
  text(doc, "❋", W - 18, 22, { size: 13, color: gold, style: "bold", align: "right" });
  text(doc, "❋", 18, H - 15, { size: 13, color: gold, style: "bold" });
  text(doc, "❋", W - 18, H - 15, { size: 13, color: gold, style: "bold", align: "right" });

  // Watermark
  doc.setFont("helvetica", "bold");
  doc.setFontSize(52);
  doc.setTextColor(201, 168, 76);
  if (doc.setGState) {
    doc.setGState(new doc.GState({ opacity: 0.07 }));
    doc.text("CERTIFIED", W / 2, 118, {
      align: "center",
      angle: -28,
    });
    doc.setGState(new doc.GState({ opacity: 1 }));
  }

  // Header
  if (logo) {
    addImageSafe(doc, logo, 25, 20, 22, 22);
  }

  center(doc, `🏛️ ${instituteName}`, 29, {
    size: 8,
    color: navy,
    style: "bold",
    charSpace: 2,
  });

  center(doc, academyTitle, 39, {
    size: 18,
    color: navy,
    style: "bold",
    charSpace: 0.8,
  });

  drawDivider(doc, 50, true);

  center(doc, "CERTIFICATE", 66, {
    size: 22,
    color: navy,
    style: "bold",
    charSpace: 4.5,
  });

  center(doc, "OF COMPLETION", 74, {
    size: 7,
    color: muted,
    style: "bold",
    charSpace: 2.2,
  });

  drawDivider(doc, 86, false);

  center(doc, "This is to certify that", 101, {
    size: 9.5,
    color: textDark,
    font: "times",
    style: "italic",
  });

  center(doc, studentName, 116, {
    size: 25,
    color: gold,
    font: "times",
    style: "bold",
    charSpace: 0.6,
  });

  center(doc, `has successfully completed the ${courseName}`, 130, {
    size: 9,
    color: textDark,
    font: "times",
  });

  center(doc, "with dedication and outstanding performance", 137, {
    size: 9,
    color: textDark,
    font: "times",
  });

  center(
    doc,
    `📅 ${formatDate(startDate)}   →   ${formatDate(endDate)}`,
    148,
    {
      size: 9,
      color: navy,
      style: "bold",
    }
  );

  // Stats table
  const tableX = 54;
  const tableY = 157;
  const cellW = 47;
  const cellH = 18;

  drawStatCell(doc, tableX, tableY, cellW, cellH, String(totalScore), "Total Score");
  drawStatCell(doc, tableX + cellW, tableY, cellW, cellH, `${totalCorrect}/${totalCompleted}`, "Questions");
  drawStatCell(doc, tableX + cellW * 2, tableY, cellW, cellH, `${accuracy}%`, "Accuracy");
  drawStatCell(doc, tableX + cellW * 3, tableY, cellW, cellH, level, "Level");

  // QR code small
  addImageSafe(doc, qrImage, 245, 154, 20, 20);

  // Footer separator
  doc.setDrawColor(224, 213, 176);
  doc.setLineWidth(0.35);
  doc.line(28, 182, 269, 182);

  // Left signature
  if (signature) {
    addImageSafe(doc, signature, 33, 176, 38, 14);
  }

  doc.setDrawColor(...navy);
  doc.setLineWidth(0.45);
  doc.line(28, 191, 84, 191);

  text(doc, adminName, 56, 197, {
    size: 8,
    color: navy,
    style: "bold",
    align: "center",
  });

  text(doc, "COURSE INSTRUCTOR", 56, 202, {
    size: 5.7,
    color: muted,
    align: "center",
    style: "bold",
    charSpace: 0.4,
  });

  // Center seal
  drawSealPlaceholder(doc, 133.5, 181, 30, seal);

  // Right signature block
  doc.setDrawColor(...navy);
  doc.setLineWidth(0.45);
  doc.line(213, 191, 269, 191);

  text(doc, instituteName, 241, 197, {
    size: 8,
    color: navy,
    style: "bold",
    align: "center",
  });

  text(doc, "AUTHORIZED SIGNATORY", 241, 202, {
    size: 5.7,
    color: muted,
    align: "center",
    style: "bold",
    charSpace: 0.4,
  });

  // Issue date
  center(doc, `Issue Date: ${formatDate(issueDate)}   |   Certificate ID: ${certId}`, 204, {
    size: 7,
    color: muted,
    charSpace: 0.4,
  });

  const fileName = `${studentName.replace(/[^a-z0-9]/gi, "_")}_Certificate.pdf`;
  doc.save(fileName);
}

export default generateCertificatePdf;
