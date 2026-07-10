import QRCode from "qrcode";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  if (!value) return "N/A";

  try {
    if (value?.toDate) value = value.toDate();

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return String(value);
  }
}

function createCertificateId(studentId) {
  const year = new Date().getFullYear();
  const id = String(studentId || "000001")
    .replace(/[^a-z0-9]/gi, "")
    .slice(-6)
    .toUpperCase();

  return `CERT-${year}-${id || "000001"}`;
}

async function loadImage(source) {
  if (!source) return "";
  if (String(source).startsWith("data:image/")) return source;

  try {
    const response = await fetch(source);
    if (!response.ok) return "";

    const blob = await response.blob();

    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result || "");
      reader.onerror = () => resolve("");
      reader.readAsDataURL(blob);
    });
  } catch {
    return "";
  }
}

async function waitForImages(win) {
  const images = Array.from(win.document.images);

  await Promise.all(
    images.map(
      (image) =>
        new Promise((resolve) => {
          if (image.complete) return resolve();
          image.onload = resolve;
          image.onerror = resolve;
        })
    )
  );
}

export async function generateCertificatePdf({
  student = {},
  certificate = {},
  settings = {},
  progress = {},
  adminProfile = {},
} = {}) {
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
    "English Learning Academy";

  const academyTitle =
    settings.academyTitle ||
    settings.courseTitle ||
    "English Learning Academy";

  const courseName =
    certificate.courseName ||
    settings.courseName ||
    "English Practice Course";

  const instructorName =
    certificate.adminName ||
    settings.adminName ||
    adminProfile.fullName ||
    "Course Instructor";

  const startDate =
    certificate.startDate ||
    student.joiningDate ||
    student.createdAt ||
    student._at;

  const endDate =
    certificate.endDate ||
    settings.defaultEndDate ||
    new Date();

  const totalScore = certificate.totalScore ?? progress.totalScore ?? 0;
  const totalCorrect = certificate.totalCorrect ?? progress.totalCorrect ?? 0;
  const totalWrong = certificate.totalWrong ?? progress.totalWrong ?? 0;

  const totalAttempted =
    certificate.totalCompleted ??
    certificate.totalAttempted ??
    Number(totalCorrect) + Number(totalWrong);

  const accuracy =
    certificate.accuracy ??
    (totalAttempted > 0
      ? ((Number(totalCorrect) / Number(totalAttempted)) * 100).toFixed(1)
      : "0.0");

  const level =
    certificate.level ||
    progress.currentLevel ||
    settings.defaultLevel ||
    "Advanced";

  const certificateId =
    certificate.certificateId ||
    createCertificateId(certificate.studentId || student.uid || student.id);

  const issueDate = formatDate(certificate.issueDate || new Date());

  const verificationUrl =
    `${window.location.origin}/verify?certId=` +
    encodeURIComponent(certificateId);

  const qrCode = await QRCode.toDataURL(verificationUrl, {
    width: 220,
    margin: 1,
    color: {
      dark: "#102b52",
      light: "#fffdf5",
    },
  });

  const [logo, signature, seal] = await Promise.all([
    loadImage(settings.logo || certificate.logo),
    loadImage(settings.signature || certificate.signature),
    loadImage(settings.seal || certificate.seal),
  ]);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(studentName)} Certificate</title>

<style>
@page {
  size: A4 landscape;
  margin: 0;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  width: 297mm;
  height: 210mm;
  overflow: hidden;
}

body {
  background: #ffffff;
  font-family: Georgia, "Times New Roman", serif;
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}

.page {
  width: 297mm;
  height: 210mm;
  display: flex;
  align-items: center;
  justify-content: center;
}

.certificate {
  position: relative;
  width: 289mm;
  height: 180mm;
  overflow: hidden;
  background:
    radial-gradient(circle at center, rgba(255, 255, 255, .98), transparent 63%),
    linear-gradient(145deg, #fffef8 0%, #fbf3dc 55%, #f7e8bd 100%);
  border: 1.35mm solid #c78f16;
  box-shadow:
    inset 0 0 0 .65mm #f0d998,
    inset 0 0 18mm rgba(199, 143, 22, .09);
}

.certificate::before {
  content: "";
  position: absolute;
  inset: 3.2mm;
  border: .42mm solid #d7a62b;
  pointer-events: none;
}

.certificate::after {
  content: "";
  position: absolute;
  inset: 5.4mm;
  border: .18mm solid rgba(199, 143, 22, .68);
  pointer-events: none;
}

.watermark {
  position: absolute;
  left: 50%;
  top: 51%;
  transform: translate(-50%, -50%) rotate(-25deg);
  color: rgba(199, 143, 22, .032);
  font-size: 30mm;
  font-weight: bold;
  letter-spacing: 2.4mm;
  white-space: nowrap;
}

.corner {
  position: absolute;
  z-index: 3;
  width: 9mm;
  height: 9mm;
  border-color: #c78f16;
}

.tl { top: 5mm; left: 5mm; border-top: .9mm solid; border-left: .9mm solid; }
.tr { top: 5mm; right: 5mm; border-top: .9mm solid; border-right: .9mm solid; }
.bl { bottom: 5mm; left: 5mm; border-bottom: .9mm solid; border-left: .9mm solid; }
.br { bottom: 5mm; right: 5mm; border-bottom: .9mm solid; border-right: .9mm solid; }

.inner {
  position: relative;
  z-index: 2;
  height: 100%;
  padding: 8mm 18mm 6mm;
  display: flex;
  flex-direction: column;
}

.brand {
  text-align: center;
  padding: 0 22mm;
}

.brand-row {
  min-height: 15mm;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4mm;
}

.logo {
  width: 15mm;
  height: 15mm;
  object-fit: contain;
}

.logo-placeholder {
  width: 15mm;
  height: 15mm;
  border: .45mm solid #c78f16;
  border-radius: 50%;
  color: #bd7c05;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4.2mm;
  font-weight: bold;
}

.institute {
  max-width: 188mm;
  color: #102b52;
  font-size: 4mm;
  font-weight: bold;
  letter-spacing: 1.4mm;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.academy {
  max-width: 225mm;
  margin: .8mm auto 0;
  color: #102b52;
  font-size: 10.4mm;
  font-weight: bold;
  letter-spacing: .45mm;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.divider {
  display: flex;
  align-items: center;
  gap: 3.5mm;
  margin: 2.2mm 0;
}

.line {
  flex: 1;
  height: .28mm;
  background: linear-gradient(to right, transparent, #c78f16, transparent);
}

.star {
  color: #c78f16;
  font-size: 3.5mm;
  line-height: 1;
}

.title {
  text-align: center;
  color: #102b52;
  font-size: 12mm;
  font-weight: bold;
  letter-spacing: 2.7mm;
  line-height: 1;
}

.subtitle {
  text-align: center;
  color: #a56b00;
  font-size: 4.2mm;
  letter-spacing: 1.4mm;
  margin-top: 1.5mm;
}

.certify {
  text-align: center;
  color: #102b52;
  font-size: 4.4mm;
  font-style: italic;
  margin-top: .8mm;
}

.student {
  max-width: 225mm;
  margin: 2.2mm auto;
  text-align: center;
  color: #bd7c05;
  font-size: clamp(8mm, 5vw, 13mm);
  font-weight: bold;
  line-height: 1.05;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.course {
  max-width: 220mm;
  margin: auto;
  text-align: center;
  color: #10203d;
  font-size: 4.05mm;
  line-height: 1.45;
}

.dates {
  text-align: center;
  color: #102b52;
  font-size: 3.95mm;
  font-weight: bold;
  margin-top: 1.8mm;
}

.stats {
  width: 205mm;
  margin: 3.4mm auto 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border: .35mm solid #d39a1b;
  border-radius: 1.2mm;
  overflow: hidden;
  background: rgba(255, 253, 245, .52);
}

.stat {
  min-height: 16mm;
  padding: 2.3mm;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 2mm;
  border-right: .32mm solid #d39a1b;
  background: linear-gradient(180deg, rgba(255, 255, 255, .5), rgba(255, 248, 222, .32));
}

.stat:last-child {
  border-right: 0;
}

.stat-icon {
  width: 7mm;
  height: 7mm;
  border: .35mm solid #d39a1b;
  border-radius: 50%;
  color: #bd7c05;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.1mm;
  font-weight: bold;
}

.stat-main {
  min-width: 0;
  text-align: center;
}

.stat-value {
  color: #102b52;
  font-size: 5.4mm;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-label {
  color: #625633;
  font-size: 2.6mm;
  letter-spacing: .28mm;
  margin-top: .6mm;
}

.footer {
  margin-top: auto;
  min-height: 42mm;
  display: grid;
  grid-template-columns: 1fr 34mm 1fr;
  gap: 16mm;
  align-items: end;
  padding-top: 5mm;
}

.signature-block {
  min-width: 0;
  text-align: center;
}

.signature-image {
  max-width: 48mm;
  height: 13mm;
  object-fit: contain;
}

.signature-script {
  height: 13mm;
  display: flex;
  align-items: end;
  justify-content: center;
  color: #102b52;
  font-family: "Brush Script MT", "Segoe Script", cursive;
  font-size: 6.6mm;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.signature-line {
  width: 50mm;
  max-width: 100%;
  height: .3mm;
  margin: 0 auto 1.5mm;
  background: #bd7c05;
}

.signature-name {
  max-width: 62mm;
  margin: auto;
  color: #102b52;
  font-size: 3.9mm;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.signature-role {
  color: #625633;
  font-size: 2.55mm;
  letter-spacing: .42mm;
  margin-top: .7mm;
}

.seal-wrap {
  display: flex;
  justify-content: center;
  align-items: end;
}

.seal-image {
  width: 30mm;
  height: 30mm;
  object-fit: contain;
}

.seal-placeholder {
  width: 30mm;
  height: 30mm;
  border: .85mm double #c78f16;
  border-radius: 50%;
  color: #bd7c05;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 3.2mm;
  font-weight: bold;
  line-height: 1.35;
}

.bottom {
  margin-top: 1mm;
  min-height: 5mm;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4mm;
  color: #10203d;
  font-size: 2.8mm;
  letter-spacing: .25mm;
  white-space: nowrap;
}

.separator {
  color: #c78f16;
}

.qr {
  position: absolute;
  top: 8mm;
  right: 8mm;
  z-index: 5;
  width: 17mm;
  height: 17mm;
  padding: .7mm;
  background: #fffdf5;
  border: .25mm solid rgba(199, 143, 22, .55);
  box-shadow: 0 1mm 3mm rgba(16, 43, 82, .08);
}
</style>
</head>

<body>
<div class="page">
  <div class="certificate">
    <div class="watermark">CERTIFIED</div>
    <div class="corner tl"></div>
    <div class="corner tr"></div>
    <div class="corner bl"></div>
    <div class="corner br"></div>

    <img src="${qrCode}" class="qr" alt="QR Verification" />

    <div class="inner">
      <div class="brand">
        <div class="brand-row">
          ${
            logo
              ? `<img src="${logo}" class="logo" alt="Logo" />`
              : `<div class="logo-placeholder">EL</div>`
          }
          <div class="institute">${escapeHtml(instituteName)}</div>
        </div>

        <div class="academy">${escapeHtml(academyTitle)}</div>
      </div>

      <div class="divider">
        <div class="line"></div>
        <span class="star">*</span>
        <span class="star">*</span>
        <span class="star">*</span>
        <div class="line"></div>
      </div>

      <div class="title">CERTIFICATE</div>
      <div class="subtitle">OF COMPLETION</div>

      <div class="divider">
        <div class="line"></div>
        <span class="star">*</span>
        <div class="line"></div>
      </div>

      <div class="certify">This is to certify that</div>
      <div class="student">${escapeHtml(studentName)}</div>

      <div class="course">
        has successfully completed the
        <strong>${escapeHtml(courseName)}</strong>
        <br />
        with dedication and outstanding performance.
      </div>

      <div class="dates">
        ${formatDate(startDate)}
        &nbsp;&nbsp;-&nbsp;&nbsp;
        ${formatDate(endDate)}
      </div>

      <div class="stats">
        <div class="stat">
          <div class="stat-icon">S</div>
          <div class="stat-main">
            <div class="stat-value">${totalScore}</div>
            <div class="stat-label">TOTAL SCORE</div>
          </div>
        </div>

        <div class="stat">
          <div class="stat-icon">Q</div>
          <div class="stat-main">
            <div class="stat-value">${totalCorrect}/${totalAttempted}</div>
            <div class="stat-label">QUESTIONS</div>
          </div>
        </div>

        <div class="stat">
          <div class="stat-icon">%</div>
          <div class="stat-main">
            <div class="stat-value">${accuracy}%</div>
            <div class="stat-label">ACCURACY</div>
          </div>
        </div>

        <div class="stat">
          <div class="stat-icon">L</div>
          <div class="stat-main">
            <div class="stat-value">${escapeHtml(level)}</div>
            <div class="stat-label">LEVEL</div>
          </div>
        </div>
      </div>

      <div class="footer">
        <div class="signature-block">
          ${
            signature
              ? `<img src="${signature}" class="signature-image" alt="Signature" />`
              : `<div class="signature-script">${escapeHtml(instructorName)}</div>`
          }
          <div class="signature-line"></div>
          <div class="signature-name">${escapeHtml(instructorName)}</div>
          <div class="signature-role">COURSE INSTRUCTOR</div>
        </div>

        <div class="seal-wrap">
          ${
            seal
              ? `<img src="${seal}" class="seal-image" alt="Seal" />`
              : `<div class="seal-placeholder">VERIFIED<br />CERTIFIED</div>`
          }
        </div>

        <div class="signature-block">
          <div class="signature-script">${escapeHtml(instituteName)}</div>
          <div class="signature-line"></div>
          <div class="signature-name">${escapeHtml(instituteName)}</div>
          <div class="signature-role">AUTHORIZED SIGNATORY</div>
        </div>
      </div>

      <div class="bottom">
        <span>Issue Date: ${issueDate}</span>
        <span class="separator">|</span>
        <span>Certificate ID: ${escapeHtml(certificateId)}</span>
      </div>
    </div>
  </div>
</div>
</body>
</html>`;

  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    throw new Error("Popup blocked. Please allow popups for certificate download.");
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  await new Promise((resolve) => {
    printWindow.onload = resolve;
  });

  await waitForImages(printWindow);
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
  }, 500);
}

export default generateCertificatePdf;
