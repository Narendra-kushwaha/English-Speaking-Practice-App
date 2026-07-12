import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { fsGet, fsSet } from "../../utils/store";
import { S } from "../../data/questions";
import { Btn, TopBar, Msg, Card, Field } from "../shared/UI";
import CertificateTemplate from "../shared/CertificateTemplate";
import { getCertificatePreviewData } from "../../utils/certificatePdf";

export default function CertificateSettings({
  onBack,
  adminProfile,
}) {
  const [instituteName, setInstituteName] = useState("");
  const [academyTitle, setAcademyTitle] = useState(
    "English Learning Academy"
  );
  const [courseName, setCourseName] = useState(
    "English Practice Course"
  );
  const [adminName, setAdminName] = useState("");
  const [defaultEndDate, setDefaultEndDate] = useState("");
  const [defaultLevel, setDefaultLevel] = useState("Advanced");

  const [logo, setLogo] = useState("");
  const [signature, setSignature] = useState("");
  const [seal, setSeal] = useState("");
  const [previewQr, setPreviewQr] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const adminId = adminProfile?.adminId;
  const docId = adminId;

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    generatePreviewQr();
  }, [adminId]);

  async function loadSettings() {
    setLoading(true);

    const data = await fsGet(
      "certificateSettings",
      docId
    );

    if (data) {
      setInstituteName(
        data.instituteName || ""
      );

      setAcademyTitle(
        data.academyTitle ||
          "English Learning Academy"
      );

      setCourseName(
        data.courseName ||
          "English Practice Course"
      );

      setAdminName(
        data.adminName ||
          adminProfile?.fullName ||
          ""
      );

      setDefaultEndDate(
        data.defaultEndDate || ""
      );

      setDefaultLevel(
        data.defaultLevel || "Advanced"
      );

      setLogo(data.logo || "");
      setSignature(data.signature || "");
      setSeal(data.seal || "");
    } else {
      setInstituteName(
        adminProfile?.instituteName ||
          adminProfile?.fullName ||
          ""
      );

      setAcademyTitle(
        "English Learning Academy"
      );

      setCourseName(
        "English Practice Course"
      );

      setAdminName(
        adminProfile?.fullName || ""
      );

      setDefaultEndDate("");
      setDefaultLevel("Advanced");
      setLogo("");
      setSignature("");
      setSeal("");
    }

    setLoading(false);
  }

  async function generatePreviewQr() {
    try {
      const previewId =
        `PREVIEW-${adminId || "ADMIN"}`;

      const verificationUrl =
        `${window.location.origin}/verify?certId=` +
        encodeURIComponent(previewId);

      const qr = await QRCode.toDataURL(
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

      setPreviewQr(qr);
    } catch (error) {
      console.error(
        "Preview QR generation failed:",
        error
      );

      setPreviewQr("");
    }
  }

  function readImage(file, setter) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showMessage(
        "Please upload an image file only."
      );
      return;
    }

    const maxSize = 900 * 1024;

    if (file.size > maxSize) {
      showMessage(
        "Image size should be less than 900 KB."
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setter(reader.result || "");
    };

    reader.onerror = () => {
      showMessage(
        "Image could not be loaded."
      );
    };

    reader.readAsDataURL(file);
  }

  function showMessage(text) {
    setMsg(text);

    setTimeout(() => {
      setMsg("");
    }, 3000);
  }

  async function saveSettings() {
    if (!instituteName.trim()) {
      showMessage(
        "Please enter institute/admin name."
      );
      return;
    }

    if (!academyTitle.trim()) {
      showMessage(
        "Please enter academy title."
      );
      return;
    }

    if (!courseName.trim()) {
      showMessage(
        "Please enter course name."
      );
      return;
    }

    setSaving(true);

    const payload = {
      adminId,

      instituteName:
        instituteName.trim(),

      academyTitle:
        academyTitle.trim(),

      courseName:
        courseName.trim(),

      adminName:
        adminName.trim() ||
        adminProfile?.fullName ||
        "Admin",

      defaultEndDate,

      defaultLevel:
        defaultLevel || "Advanced",

      logo,
      signature,
      seal,

      updatedAt: Date.now(),
    };

    const ok = await fsSet(
      "certificateSettings",
      docId,
      payload
    );

    setSaving(false);

    if (ok) {
      showMessage(
        "Certificate settings saved successfully."
      );
    } else {
      showMessage(
        "Something went wrong. Please try again."
      );
    }
  }

  const previewData = useMemo(() => {
    return getCertificatePreviewData({
      student: {
        uid: "preview-student",
        fullName: "Student Name",
        joiningDate: "2026-01-01",
      },

      certificate: {
        studentId: "preview-student",
        studentName: "Student Name",
        totalScore: 245,
        totalCorrect: 38,
        totalWrong: 7,
        totalCompleted: 45,
        accuracy: "84.4",
        level: defaultLevel,
        startDate: "2026-01-01",

        endDate:
          defaultEndDate ||
          "2026-07-09",

        certificateId:
          "CERT-2026-PREVIEW",

        issueDate: new Date(),
      },

      settings: {
        instituteName:
          instituteName ||
          "English Learning Academy",

        academyTitle:
          academyTitle ||
          "English Learning Academy",

        courseName:
          courseName ||
          "English Practice Course",

        adminName:
          adminName ||
          adminProfile?.fullName ||
          "Course Instructor",

        defaultEndDate:
          defaultEndDate ||
          "2026-07-09",

        defaultLevel:
          defaultLevel ||
          "Advanced",

        logo,
        signature,
        seal,
      },

      progress: {
        totalScore: 245,
        totalCorrect: 38,
        totalWrong: 7,
        currentLevel:
          defaultLevel ||
          "Advanced",
      },

      adminProfile: {
        ...adminProfile,

        instituteName:
          instituteName ||
          adminProfile?.instituteName ||
          adminProfile?.fullName ||
          "English Learning Academy",

        fullName:
          adminName ||
          adminProfile?.fullName ||
          "Course Instructor",
      },

      qrCode: previewQr,
    });
  }, [
    instituteName,
    academyTitle,
    courseName,
    adminName,
    defaultEndDate,
    defaultLevel,
    logo,
    signature,
    seal,
    previewQr,
    adminProfile,
  ]);

  function ImageUploader({
    label,
    value,
    onChange,
    onRemove,
    hint,
  }) {
    return (
      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            ...S.lbl,
            marginBottom: 8,
          }}
        >
          {label}
        </div>

        <div
          style={{
            border:
              "1.5px dashed #334155",

            borderRadius: 12,
            padding: 14,
            background: "#0F172A",
          }}
        >
          {value ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <img
                src={value}
                alt={label}
                style={{
                  width: 110,
                  height: 70,
                  objectFit: "contain",
                  background: "#F8FAFC",
                  borderRadius: 10,
                  padding: 8,
                }}
              />

              <div
                style={{
                  flex: 1,
                  minWidth: 160,
                }}
              >
                <div
                  style={{
                    color: "#22C55E",
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  Image selected
                </div>

                <div
                  style={{
                    color: "#64748B",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  This image will appear in
                  preview and final certificate.
                </div>
              </div>

              <Btn
                onClick={onRemove}
                color="#EF4444"
                sm
              >
                Remove
              </Btn>
            </div>
          ) : (
            <div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={(event) =>
                  readImage(
                    event.target.files?.[0],
                    onChange
                  )
                }
                style={{
                  width: "100%",
                  color: "#94A3B8",
                  fontSize: 13,
                }}
              />

              <div
                style={{
                  color: "#64748B",
                  fontSize: 11,
                  marginTop: 8,
                }}
              >
                {hint}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={S.pg}>
      <div style={S.wrap}>
        <TopBar
          onBack={onBack}
          title="🏛️ Certificate Settings"
        />

        <Msg
          type={
            msg.includes("wrong") ||
            msg.includes("Please") ||
            msg.includes("could not") ||
            msg.includes("less than")
              ? "error"
              : "success"
          }
          text={msg}
        />

        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              color: "#64748B",
            }}
          >
            Loading certificate settings...
          </div>
        )}

        {!loading && (
          <>
            <Card>
              <div
                style={{
                  ...S.lbl,
                  marginBottom: 12,
                }}
              >
                Certificate Basic Details
              </div>

              <Field
                label="Institute / Admin Name *"
                value={instituteName}
                onChange={(event) =>
                  setInstituteName(
                    event.target.value
                  )
                }
                placeholder="e.g. Bright Future Institute"
              />

              <Field
                label="Academy Title *"
                value={academyTitle}
                onChange={(event) =>
                  setAcademyTitle(
                    event.target.value
                  )
                }
                placeholder="e.g. English Learning Academy"
              />

              <Field
                label="Course Name *"
                value={courseName}
                onChange={(event) =>
                  setCourseName(
                    event.target.value
                  )
                }
                placeholder="e.g. English Practice Course"
              />

              <Field
                label="Admin / Instructor Name"
                value={adminName}
                onChange={(event) =>
                  setAdminName(
                    event.target.value
                  )
                }
                placeholder="e.g. Narendra Kushwaha"
              />

              <div
                style={{
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    ...S.lbl,
                    marginBottom: 8,
                  }}
                >
                  Default Course End Date
                </div>

                <input
                  type="date"
                  value={defaultEndDate}
                  onChange={(event) =>
                    setDefaultEndDate(
                      event.target.value
                    )
                  }
                  style={{
                    ...S.inp,
                    colorScheme: "dark",
                  }}
                />
              </div>

              <div
                style={{
                  marginBottom: 4,
                }}
              >
                <div
                  style={{
                    ...S.lbl,
                    marginBottom: 8,
                  }}
                >
                  Default Level
                </div>

                <select
                  value={defaultLevel}
                  onChange={(event) =>
                    setDefaultLevel(
                      event.target.value
                    )
                  }
                  style={{
                    ...S.inp,
                    colorScheme: "dark",
                  }}
                >
                  <option value="Beginner">
                    Beginner
                  </option>

                  <option value="Intermediate">
                    Intermediate
                  </option>

                  <option value="Advanced">
                    Advanced
                  </option>
                </select>
              </div>
            </Card>

            <Card>
              <div
                style={{
                  ...S.lbl,
                  marginBottom: 12,
                }}
              >
                Certificate Images
              </div>

              <ImageUploader
                label="Institute Logo"
                value={logo}
                onChange={setLogo}
                onRemove={() =>
                  setLogo("")
                }
                hint="Upload PNG, JPG or WEBP. Maximum size: 900 KB."
              />

              <ImageUploader
                label="Digital Signature"
                value={signature}
                onChange={setSignature}
                onRemove={() =>
                  setSignature("")
                }
                hint="Transparent PNG signature gives the best result."
              />

              <ImageUploader
                label="Institute Seal"
                value={seal}
                onChange={setSeal}
                onRemove={() =>
                  setSeal("")
                }
                hint="Upload a transparent institute seal or stamp image."
              />
            </Card>

            <Card>
              <div
                style={{
                  ...S.lbl,
                  marginBottom: 12,
                }}
              >
                Live Certificate Preview
              </div>

              <div
  style={{
    width: "100%",
    maxWidth: "100%",
    overflow: "hidden",
    borderRadius: 12,
    background: "#FFFFFF",
    border: "1px solid #334155",
  }}
>
  <CertificateTemplate
    data={previewData}
    width="100%"
    height={520}
    title="Certificate Live Preview"
  />
</div>

              <div
                style={{
                  marginTop: 10,
                  color: "#64748B",
                  fontSize: 11,
                  lineHeight: 1.6,
                }}
              >
                This preview uses the same
                shared template as the final
                certificate.
              </div>
            </Card>

            <Btn
              onClick={saveSettings}
              disabled={saving}
              color="#22C55E"
              full
            >
              {saving
                ? "Saving..."
                : "Save Certificate Settings"}
            </Btn>
          </>
        )}
      </div>
    </div>
  );
}
