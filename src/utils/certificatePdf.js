import QRCode from "qrcode";

import {
  buildCertificateDocument,
  formatCertificateDate,
} from "../components/shared/CertificateTemplate";

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

  if (String(source).startsWith("data:image/")) {
    return source;
  }

  try {
    const response = await fetch(source);

    if (!response.ok) {
      return "";
    }

    const blob = await response.blob();

    return await new Promise((resolve) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        resolve(reader.result || "");
      };

      reader.onerror = () => {
        resolve("");
      };

      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn("Certificate image could not load:", error);
    return "";
  }
}

async function waitForDocumentImages(documentRef) {
  const images = Array.from(documentRef?.images || []);

  await Promise.all(
    images.map(
      (image) =>
        new Promise((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }

          image.onload = resolve;
          image.onerror = resolve;
        })
    )
  );
}

function createPrintIframe() {
  const oldIframe = document.getElementById(
    "certificate-print-iframe"
  );

  if (oldIframe) {
    oldIframe.remove();
  }

  const iframe = document.createElement("iframe");

  iframe.id = "certificate-print-iframe";
  iframe.setAttribute("title", "Certificate Print");
  iframe.setAttribute("aria-hidden", "true");

  Object.assign(iframe.style, {
    position: "fixed",
    width: "1px",
    height: "1px",
    right: "0",
    bottom: "0",
    border: "0",
    opacity: "0",
    pointerEvents: "none",
    visibility: "hidden",
  });

  document.body.appendChild(iframe);

  return iframe;
}

async function printCertificateHtml(html) {
  const iframe = createPrintIframe();

  const iframeWindow = iframe.contentWindow;
  const iframeDocument = iframe.contentDocument;

  if (!iframeWindow || !iframeDocument) {
    iframe.remove();

    throw new Error(
      "Certificate print frame could not be created."
    );
  }

  iframeDocument.open();
  iframeDocument.write(html);
  iframeDocument.close();

  await new Promise((resolve) => {
    if (iframeDocument.readyState === "complete") {
      resolve();
      return;
    }

    iframe.onload = resolve;

    setTimeout(resolve, 1500);
  });

  await waitForDocumentImages(iframeDocument);

  await new Promise((resolve) => {
    setTimeout(resolve, 400);
  });

  try {
    iframeWindow.focus();
    iframeWindow.print();
  } catch (error) {
    iframe.remove();
    throw error;
  }

  setTimeout(() => {
    iframe.remove();
  }, 3000);
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
    student._at ||
    null;

  const endDate =
    certificate.endDate ||
    settings.defaultEndDate ||
    new Date();

  const totalScore =
    certificate.totalScore ??
    progress.totalScore ??
    0;

  const totalCorrect =
    certificate.totalCorrect ??
    progress.totalCorrect ??
    0;

  const totalWrong =
    certificate.totalWrong ??
    progress.totalWrong ??
    0;

  const totalAttempted =
    certificate.totalCompleted ??
    certificate.totalAttempted ??
    Number(totalCorrect) + Number(totalWrong);

  const accuracy =
    certificate.accuracy ??
    (totalAttempted > 0
      ? (
          (Number(totalCorrect) /
            Number(totalAttempted)) *
          100
        ).toFixed(1)
      : "0.0");

  const level =
    certificate.level ||
    progress.currentLevel ||
    settings.defaultLevel ||
    "Advanced";

  const certificateId =
    certificate.certificateId ||
    createCertificateId(
      certificate.studentId ||
        student.uid ||
        student.id
    );

  const issueDate =
    certificate.issueDate ||
    new Date();

  const verificationUrl =
    `${window.location.origin}?verify=` +
    encodeURIComponent(certificateId);

  const qrCode = await QRCode.toDataURL(
    verificationUrl,
    {
      width: 220,
      margin: 1,
      color: {
        dark: "#102b52",
        light: "#fffdf5",
      },
    }
  );

  const [logo, signature, seal] =
    await Promise.all([
      loadImage(
        settings.logo ||
          certificate.logo ||
          ""
      ),

      loadImage(
        settings.signature ||
          certificate.signature ||
          ""
      ),

      loadImage(
        settings.seal ||
          certificate.seal ||
          ""
      ),
    ]);

  const certificateData = {
    studentName,
    instituteName,
    academyTitle,
    courseName,
    instructorName,
    startDate,
    endDate,
    totalScore,
    totalCorrect,
    totalAttempted,
    accuracy,
    level,
    issueDate,
    certificateId,
    logo,
    signature,
    seal,
    qrCode,
  };

  const html =
    buildCertificateDocument(
      certificateData
    );

  await printCertificateHtml(html);
}

export function getCertificatePreviewData({
  student = {},
  certificate = {},
  settings = {},
  progress = {},
  adminProfile = {},
  qrCode = "",
} = {}) {
  const totalCorrect =
    certificate.totalCorrect ??
    progress.totalCorrect ??
    0;

  const totalWrong =
    certificate.totalWrong ??
    progress.totalWrong ??
    0;

  const totalAttempted =
    certificate.totalCompleted ??
    certificate.totalAttempted ??
    Number(totalCorrect) + Number(totalWrong);

  const accuracy =
    certificate.accuracy ??
    (totalAttempted > 0
      ? (
          (Number(totalCorrect) /
            Number(totalAttempted)) *
          100
        ).toFixed(1)
      : "0.0");

  const certificateId =
    certificate.certificateId ||
    createCertificateId(
      certificate.studentId ||
        student.uid ||
        student.id
    );

  return {
    studentName:
      certificate.studentName ||
      student.fullName ||
      student.name ||
      "Student Name",

    instituteName:
      certificate.instituteName ||
      settings.instituteName ||
      adminProfile.instituteName ||
      adminProfile.fullName ||
      "English Learning Academy",

    academyTitle:
      settings.academyTitle ||
      settings.courseTitle ||
      "English Learning Academy",

    courseName:
      certificate.courseName ||
      settings.courseName ||
      "English Practice Course",

    instructorName:
      certificate.adminName ||
      settings.adminName ||
      adminProfile.fullName ||
      "Course Instructor",

    startDate:
      certificate.startDate ||
      student.joiningDate ||
      student.createdAt ||
      student._at ||
      null,

    endDate:
      certificate.endDate ||
      settings.defaultEndDate ||
      new Date(),

    totalScore:
      certificate.totalScore ??
      progress.totalScore ??
      0,

    totalCorrect,
    totalAttempted,
    accuracy,

    level:
      certificate.level ||
      progress.currentLevel ||
      settings.defaultLevel ||
      "Advanced",

    issueDate:
      certificate.issueDate ||
      new Date(),

    certificateId,

    logo:
      settings.logo ||
      certificate.logo ||
      "",

    signature:
      settings.signature ||
      certificate.signature ||
      "",

    seal:
      settings.seal ||
      certificate.seal ||
      "",

    qrCode,
  };
}

export {
  createCertificateId,
  formatCertificateDate,
};

export default generateCertificatePdf;
