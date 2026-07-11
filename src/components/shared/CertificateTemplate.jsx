import { useEffect, useMemo, useRef, useState } from "react";

const A4_WIDTH_PX = (297 / 25.4) * 96;
const A4_HEIGHT_PX = (210 / 25.4) * 96;
const MOBILE_BREAKPOINT = 768;

export function escapeCertificateHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function formatCertificateDate(value) {
  if (!value) return "N/A";
  try {
    if (value?.toDate) value = value.toDate();
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit", month: "long", year: "numeric",
    });
  } catch { return String(value); }
}

export const CERTIFICATE_STYLES = `
  @page { size: A4 landscape; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 297mm; height: 210mm; overflow: hidden; }
  body { background: #ffffff; font-family: Georgia, "Times New Roman", serif; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  .certificate-page { width: 297mm; height: 210mm; display: flex; align-items: center; justify-content: center; }
  .certificate { position: relative; width: 289mm; height: 202mm; overflow: hidden; background: radial-gradient(circle at center, rgba(255,255,255,0.98), transparent 63%), linear-gradient(145deg, #fffef8 0%, #fbf3dc 55%, #f7e8bd 100%); border: 1.35mm solid #c78f16; box-shadow: inset 0 0 0 0.65mm #f0d998, inset 0 0 18mm rgba(199,143,22,0.09); }
  .certificate::before { content: ""; position: absolute; inset: 3.2mm; border: 0.42mm solid #d7a62b; pointer-events: none; }
  .certificate::after { content: ""; position: absolute; inset: 5.4mm; border: 0.18mm solid rgba(199,143,22,0.68); pointer-events: none; }
  .certificate-watermark { position: absolute; left: 50%; top: 51%; transform: translate(-50%,-50%) rotate(-25deg); color: rgba(199,143,22,0.032); font-size: 30mm; font-weight: bold; letter-spacing: 2.4mm; white-space: nowrap; }
  .certificate-corner { position: absolute; z-index: 3; width: 9mm; height: 9mm; border-color: #c78f16; }
  .certificate-corner-tl { top: 5mm; left: 5mm; border-top: 0.9mm solid; border-left: 0.9mm solid; }
  .certificate-corner-tr { top: 5mm; right: 5mm; border-top: 0.9mm solid; border-right: 0.9mm solid; }
  .certificate-corner-bl { bottom: 5mm; left: 5mm; border-bottom: 0.9mm solid; border-left: 0.9mm solid; }
  .certificate-corner-br { bottom: 5mm; right: 5mm; border-bottom: 0.9mm solid; border-right: 0.9mm solid; }
  .certificate-inner { position: relative; z-index: 2; height: 100%; padding: 8mm 18mm 6mm; display: flex; flex-direction: column; }
  .certificate-brand { text-align: center; padding: 0 22mm; }
  .certificate-brand-row { min-height: 15mm; display: flex; justify-content: center; align-items: center; gap: 4mm; }
  .certificate-logo { width: 15mm; height: 15mm; object-fit: contain; }
  .certificate-logo-placeholder { width: 15mm; height: 15mm; border: 0.45mm solid #c78f16; border-radius: 50%; color: #bd7c05; display: flex; align-items: center; justify-content: center; font-size: 4.2mm; font-weight: bold; }
  .certificate-institute { max-width: 188mm; color: #102b52; font-size: 4mm; font-weight: bold; letter-spacing: 1.4mm; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .certificate-academy { max-width: 225mm; margin: 0.8mm auto 0; color: #102b52; font-size: 10.4mm; font-weight: bold; letter-spacing: 0.45mm; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .certificate-divider { display: flex; align-items: center; gap: 3.5mm; margin: 2.2mm 0; }
  .certificate-divider-line { flex: 1; height: 0.28mm; background: linear-gradient(to right, transparent, #c78f16, transparent); }
  .certificate-divider-star { color: #c78f16; font-size: 3.5mm; line-height: 1; }
  .certificate-title { text-align: center; color: #102b52; font-size: 12mm; font-weight: bold; letter-spacing: 2.7mm; line-height: 1; }
  .certificate-subtitle { text-align: center; color: #a56b00; font-size: 4.2mm; letter-spacing: 1.4mm; margin-top: 1.5mm; }
  .certificate-certify { text-align: center; color: #102b52; font-size: 4.4mm; font-style: italic; margin-top: 0.8mm; }
  .certificate-student { max-width: 225mm; margin: 2.2mm auto; text-align: center; color: #bd7c05; font-size: clamp(8mm,5vw,13mm); font-weight: bold; line-height: 1.05; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .certificate-course { max-width: 220mm; margin: auto; text-align: center; color: #10203d; font-size: 4.05mm; line-height: 1.45; }
  .certificate-dates { text-align: center; color: #102b52; font-size: 3.95mm; font-weight: bold; margin-top: 1.8mm; }
  .certificate-stats { width: 205mm; margin: 3.4mm auto 0; display: grid; grid-template-columns: repeat(4,1fr); border: 0.35mm solid #d39a1b; border-radius: 1.2mm; overflow: hidden; background: rgba(255,253,245,0.52); }
  .certificate-stat { min-height: 16mm; padding: 2.3mm; display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 2mm; border-right: 0.32mm solid #d39a1b; background: linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,248,222,0.32)); }
  .certificate-stat:last-child { border-right: 0; }
  .certificate-stat-icon { width: 7mm; height: 7mm; border: 0.35mm solid #d39a1b; border-radius: 50%; color: #bd7c05; display: flex; align-items: center; justify-content: center; font-size: 3.1mm; font-weight: bold; }
  .certificate-stat-main { min-width: 0; text-align: center; }
  .certificate-stat-value { color: #102b52; font-size: 5.4mm; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .certificate-stat-label { color: #625633; font-size: 2.6mm; letter-spacing: 0.28mm; margin-top: 0.6mm; }
  .certificate-footer { margin-top: auto; min-height: 42mm; display: grid; grid-template-columns: 1fr 34mm 1fr; gap: 16mm; align-items: end; padding-top: 5mm; }
  .certificate-signature-block { min-width: 0; text-align: center; }
  .certificate-signature-image { max-width: 48mm; height: 13mm; object-fit: contain; }
  .certificate-signature-script { height: 13mm; display: flex; align-items: end; justify-content: center; color: #102b52; font-family: "Brush Script MT","Segoe Script",cursive; font-size: 6.6mm; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .certificate-signature-line { width: 50mm; max-width: 100%; height: 0.3mm; margin: 0 auto 1.5mm; background: #bd7c05; }
  .certificate-signature-name { max-width: 62mm; margin: auto; color: #102b52; font-size: 3.9mm; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .certificate-signature-role { color: #625633; font-size: 2.55mm; letter-spacing: 0.42mm; margin-top: 0.7mm; }
  .certificate-seal-wrap { display: flex; justify-content: center; align-items: end; }
  .certificate-seal-image { width: 30mm; height: 30mm; object-fit: contain; }
  .certificate-seal-placeholder { width: 30mm; height: 30mm; border: 0.85mm double #c78f16; border-radius: 50%; color: #bd7c05; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 3.2mm; font-weight: bold; line-height: 1.35; }
  .certificate-bottom { margin-top: 1mm; min-height: 5mm; display: flex; justify-content: center; align-items: center; gap: 4mm; color: #10203d; font-size: 2.8mm; letter-spacing: 0.25mm; white-space: nowrap; }
  .certificate-separator { color: #c78f16; }
  .certificate-qr { position: absolute; top: 8mm; right: 8mm; z-index: 5; width: 17mm; height: 17mm; padding: 0.7mm; background: #fffdf5; border: 0.25mm solid rgba(199,143,22,0.55); box-shadow: 0 1mm 3mm rgba(16,43,82,0.08); }
  @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
`;

export function buildCertificateMarkup({
  studentName = "Student Name",
  instituteName = "English Learning Academy",
  academyTitle = "English Learning Academy",
  courseName = "English Practice Course",
  instructorName = "Course Instructor",
  startDate = null,
  endDate = null,
  totalScore = 0,
  totalCorrect = 0,
  totalAttempted = 0,
  accuracy = "0.0",
  level = "Advanced",
  issueDate = new Date(),
  certificateId = "CERT-2026-000001",
  logo = "",
  signature = "",
  seal = "",
  qrCode = "",
} = {}) {
  return `
    <div class="certificate-page">
      <div class="certificate">
        <div class="certificate-watermark">CERTIFIED</div>
        <div class="certificate-corner certificate-corner-tl"></div>
        <div class="certificate-corner certificate-corner-tr"></div>
        <div class="certificate-corner certificate-corner-bl"></div>
        <div class="certificate-corner certificate-corner-br"></div>
        ${qrCode ? `<img src="${qrCode}" class="certificate-qr" alt="QR Verification"/>` : ""}
        <div class="certificate-inner">
          <div class="certificate-brand">
            <div class="certificate-brand-row">
              ${logo
                ? `<img src="${logo}" class="certificate-logo" alt="Institute Logo"/>`
                : `<div class="certificate-logo-placeholder">EL</div>`}
              <div class="certificate-institute">${escapeCertificateHtml(instituteName)}</div>
            </div>
            <div class="certificate-academy">${escapeCertificateHtml(academyTitle)}</div>
          </div>
          <div class="certificate-divider">
            <div class="certificate-divider-line"></div>
            <span class="certificate-divider-star">*</span>
            <span class="certificate-divider-star">*</span>
            <span class="certificate-divider-star">*</span>
            <div class="certificate-divider-line"></div>
          </div>
          <div class="certificate-title">CERTIFICATE</div>
          <div class="certificate-subtitle">OF COMPLETION</div>
          <div class="certificate-divider">
            <div class="certificate-divider-line"></div>
            <span class="certificate-divider-star">*</span>
            <div class="certificate-divider-line"></div>
          </div>
          <div class="certificate-certify">This is to certify that</div>
          <div class="certificate-student">${escapeCertificateHtml(studentName)}</div>
          <div class="certificate-course">
            has successfully completed the <strong>${escapeCertificateHtml(courseName)}</strong><br/>
            with dedication and outstanding performance.
          </div>
          <div class="certificate-dates">
            ${formatCertificateDate(startDate)} &nbsp;&nbsp;-&nbsp;&nbsp; ${formatCertificateDate(endDate)}
          </div>
          <div class="certificate-stats">
            <div class="certificate-stat">
              <div class="certificate-stat-icon">S</div>
              <div class="certificate-stat-main">
                <div class="certificate-stat-value">${totalScore}</div>
                <div class="certificate-stat-label">TOTAL SCORE</div>
              </div>
            </div>
            <div class="certificate-stat">
              <div class="certificate-stat-icon">Q</div>
              <div class="certificate-stat-main">
                <div class="certificate-stat-value">${totalCorrect}/${totalAttempted}</div>
                <div class="certificate-stat-label">QUESTIONS</div>
              </div>
            </div>
            <div class="certificate-stat">
              <div class="certificate-stat-icon">%</div>
              <div class="certificate-stat-main">
                <div class="certificate-stat-value">${accuracy}%</div>
                <div class="certificate-stat-label">ACCURACY</div>
              </div>
            </div>
            <div class="certificate-stat">
              <div class="certificate-stat-icon">L</div>
              <div class="certificate-stat-main">
                <div class="certificate-stat-value">${escapeCertificateHtml(level)}</div>
                <div class="certificate-stat-label">LEVEL</div>
              </div>
            </div>
          </div>
          <div class="certificate-footer">
            <div class="certificate-signature-block">
              ${signature
                ? `<img src="${signature}" class="certificate-signature-image" alt="Digital Signature"/>`
                : `<div class="certificate-signature-script">${escapeCertificateHtml(instructorName)}</div>`}
              <div class="certificate-signature-line"></div>
              <div class="certificate-signature-name">${escapeCertificateHtml(instructorName)}</div>
              <div class="certificate-signature-role">COURSE INSTRUCTOR</div>
            </div>
            <div class="certificate-seal-wrap">
              ${seal
                ? `<img src="${seal}" class="certificate-seal-image" alt="Institute Seal"/>`
                : `<div class="certificate-seal-placeholder">VERIFIED<br/>CERTIFIED</div>`}
            </div>
            <div class="certificate-signature-block">
              <div class="certificate-signature-script">${escapeCertificateHtml(instituteName)}</div>
              <div class="certificate-signature-line"></div>
              <div class="certificate-signature-name">${escapeCertificateHtml(instituteName)}</div>
              <div class="certificate-signature-role">AUTHORIZED SIGNATORY</div>
            </div>
          </div>
          <div class="certificate-bottom">
            <span>Issue Date: ${formatCertificateDate(issueDate)}</span>
            <span class="certificate-separator">|</span>
            <span>Certificate ID: ${escapeCertificateHtml(certificateId)}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function buildCertificateDocument(data = {}, previewOptions = {}) {
  const { mobilePreview = false, previewScale = 1 } = previewOptions;
  const mobilePreviewStyles = mobilePreview ? `
    html, body { width: 100%; height: 100%; overflow: hidden; }
    body { position: relative; }
    .certificate-page { position: absolute; top: 0; left: 0; transform: scale(${previewScale}); transform-origin: top left; }
  ` : "";
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>${escapeCertificateHtml(data.studentName || "Certificate")}</title>
        <style>${CERTIFICATE_STYLES}${mobilePreviewStyles}</style>
      </head>
      <body>${buildCertificateMarkup(data)}</body>
    </html>
  `;
}

export default function CertificateTemplate({ data = {}, width = "100%", height = 520, title = "Certificate Preview" }) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    function updatePreviewSize() {
      setContainerWidth(container.clientWidth);
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    }
    updatePreviewSize();
    const resizeObserver = new ResizeObserver(updatePreviewSize);
    resizeObserver.observe(container);
    window.addEventListener("resize", updatePreviewSize);
    return () => { resizeObserver.disconnect(); window.removeEventListener("resize", updatePreviewSize); };
  }, []);

  const mobileScale = isMobile && containerWidth > 0 ? Math.min(1, containerWidth / A4_WIDTH_PX) : 1;
  const responsiveHeight = isMobile && containerWidth > 0 ? Math.ceil(A4_HEIGHT_PX * mobileScale) : height;
  const documentHtml = useMemo(() => buildCertificateDocument(data, { mobilePreview: isMobile, previewScale: mobileScale }), [data, isMobile, mobileScale]);

  return (
    <div ref={containerRef} style={{ width:"100%", overflow:"hidden", borderRadius:12, background:"#FFFFFF" }}>
      <iframe title={title} srcDoc={documentHtml} style={{ width, height:responsiveHeight, border:"none", display:"block", background:"#FFFFFF" }} />
    </div>
  );
      }
