import { useEffect, useState } from "react";
import { fsGet, fsSet } from "../../utils/store";
import { S } from "../../data/questions";
import { Btn, TopBar, Msg, Card, Field } from "../shared/UI";

export default function CertificateSettings({ onBack, adminProfile }) {
  const [instituteName, setInstituteName] = useState("");
  const [courseName, setCourseName] = useState("English Practice Course");
  const [adminName, setAdminName] = useState("");
  const [defaultEndDate, setDefaultEndDate] = useState("");

  const [logo, setLogo] = useState("");
  const [signature, setSignature] = useState("");
  const [seal, setSeal] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const adminId = adminProfile?.adminId;
  const docId = adminId;

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);

    const data = await fsGet("certificateSettings", docId);

    if (data) {
      setInstituteName(data.instituteName || "");
      setCourseName(data.courseName || "English Practice Course");
      setAdminName(data.adminName || adminProfile?.fullName || "");
      setDefaultEndDate(data.defaultEndDate || "");
      setLogo(data.logo || "");
      setSignature(data.signature || "");
      setSeal(data.seal || "");
    } else {
      setInstituteName(adminProfile?.instituteName || adminProfile?.fullName || "");
      setCourseName("English Practice Course");
      setAdminName(adminProfile?.fullName || "");
      setDefaultEndDate("");
      setLogo("");
      setSignature("");
      setSeal("");
    }

    setLoading(false);
  }

  function readImage(file, setter) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMsg("Please upload an image file only.");
      setTimeout(() => setMsg(""), 2500);
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setter(reader.result);
    };

    reader.readAsDataURL(file);
  }

  async function saveSettings() {
    if (!instituteName.trim()) {
      setMsg("Please enter institute/admin name.");
      setTimeout(() => setMsg(""), 2500);
      return;
    }

    if (!courseName.trim()) {
      setMsg("Please enter course name.");
      setTimeout(() => setMsg(""), 2500);
      return;
    }

    setSaving(true);

    const payload = {
      adminId,
      instituteName: instituteName.trim(),
      courseName: courseName.trim(),
      adminName: adminName.trim() || adminProfile?.fullName || "Admin",
      defaultEndDate,
      logo,
      signature,
      seal,
      updatedAt: Date.now(),
    };

    const ok = await fsSet("certificateSettings", docId, payload);

    setSaving(false);

    if (ok) {
      setMsg("Certificate settings saved successfully.");
    } else {
      setMsg("Something went wrong. Please try again.");
    }

    setTimeout(() => setMsg(""), 2500);
  }

  function ImageUploader({ label, value, onChange, onRemove, hint }) {
    return (
      <div style={{ marginBottom: 14 }}>
        <div style={{ ...S.lbl, marginBottom: 8 }}>{label}</div>

        <div
          style={{
            border: "1.5px dashed #334155",
            borderRadius: 12,
            padding: 14,
            background: "#0F172A",
          }}
        >
          {value ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
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

              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ color: "#22C55E", fontWeight: 800, fontSize: 13 }}>
                  Image selected
                </div>
                <div style={{ color: "#64748B", fontSize: 12, marginTop: 4 }}>
                  This image will be printed on certificate PDF.
                </div>
              </div>

              <Btn onClick={onRemove} color="#EF4444" sm>
                Remove
              </Btn>
            </div>
          ) : (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => readImage(e.target.files?.[0], onChange)}
                style={{
                  width: "100%",
                  color: "#94A3B8",
                  fontSize: 13,
                }}
              />

              <div style={{ color: "#64748B", fontSize: 11, marginTop: 8 }}>
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
        <TopBar onBack={onBack} title="🏛️ Certificate Settings" />

        <Msg type={msg.includes("wrong") ? "error" : "success"} text={msg} />

        {loading && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#64748B" }}>
            Loading certificate settings...
          </div>
        )}

        {!loading && (
          <>
            <Card>
              <div style={{ ...S.lbl, marginBottom: 12 }}>
                Certificate Basic Details
              </div>

              <Field
                label="Institute / Admin Name *"
                value={instituteName}
                onChange={(e) => setInstituteName(e.target.value)}
                placeholder="e.g. SDL English Academy"
              />

              <Field
                label="Course Name *"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g. English Practice Course"
              />

              <Field
                label="Admin Name / Signature Name"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="e.g. Narendra Kushwaha"
              />

              <div style={{ marginBottom: 14 }}>
                <div style={{ ...S.lbl, marginBottom: 8 }}>
                  Default Course End Date
                </div>

                <input
                  type="date"
                  value={defaultEndDate}
                  onChange={(e) => setDefaultEndDate(e.target.value)}
                  style={{
                    ...S.inp,
                    colorScheme: "dark",
                  }}
                />
              </div>
            </Card>

            <Card>
              <div style={{ ...S.lbl, marginBottom: 12 }}>
                Certificate Images
              </div>

              <ImageUploader
                label="Institute Logo"
                value={logo}
                onChange={setLogo}
                onRemove={() => setLogo("")}
                hint="Upload institute logo. PNG/JPG recommended."
              />

              <ImageUploader
                label="Digital Signature"
                value={signature}
                onChange={setSignature}
                onRemove={() => setSignature("")}
                hint="Upload transparent PNG signature for best result."
              />

              <ImageUploader
                label="Institute Seal"
                value={seal}
                onChange={setSeal}
                onRemove={() => setSeal("")}
                hint="Upload institute seal/stamp image."
              />
            </Card>

            <Card>
              <div style={{ ...S.lbl, marginBottom: 12 }}>
                Preview
              </div>

              <div
                style={{
                  background: "#FFFDF5",
                  border: "4px solid #D4AF37",
                  borderRadius: 14,
                  padding: 18,
                  color: "#0F172A",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    background: "#0F172A",
                    color: "#FCD34D",
                    padding: "12px 16px",
                    borderRadius: 10,
                    fontWeight: 900,
                    marginBottom: 18,
                  }}
                >
                  🏛️ {instituteName || "Institute Name"}
                </div>

                <div style={{ fontSize: 18, fontWeight: 900, color: "#D4AF37" }}>
                  CERTIFICATE OF COMPLETION
                </div>

                <div style={{ margin: "14px 0", color: "#374151", fontSize: 13 }}>
                  This certificate will be generated for eligible students.
                </div>

                <div style={{ fontSize: 24, fontWeight: 900, color: "#B8860B" }}>
                  ★ Student Name ★
                </div>

                <div style={{ marginTop: 12, fontSize: 13, color: "#374151" }}>
                  Course: {courseName || "English Practice Course"}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    border: "1px solid #D4AF37",
                    marginTop: 18,
                    fontSize: 12,
                  }}
                >
                  <div style={{ padding: 8, borderRight: "1px solid #D4AF37" }}>
                    <b>Total Score</b>
                    <br />
                    245 pts
                  </div>
                  <div style={{ padding: 8, borderRight: "1px solid #D4AF37" }}>
                    <b>Correct</b>
                    <br />
                    38 / 45
                  </div>
                  <div style={{ padding: 8 }}>
                    <b>Accuracy</b>
                    <br />
                    84.4%
                  </div>
                </div>

                <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span>Admin Signature</span>
                  <span>Institute Seal</span>
                </div>
              </div>
            </Card>

            <Btn onClick={saveSettings} disabled={saving} color="#22C55E" full>
              {saving ? "Saving..." : "Save Certificate Settings"}
            </Btn>
          </>
        )}
      </div>
    </div>
  );
}
