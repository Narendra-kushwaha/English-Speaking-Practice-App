import { useState, useEffect } from "react";
import {
  fsAll,
  fsUpdate,
  fsGet,
  fsSet,
  fsDel,
} from "../../utils/store";

import { logoutUser } from "../../utils/auth";
import AccountSettings from "../auth/AccountSettings";
import { Btn, TopBar, Msg } from "../shared/UI";
import { S } from "../../data/questions";

export default function DeveloperPanel({ profile }) {
  const [screen, setScreen] = useState("home");

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState("");

  const [noticeMessage, setNoticeMessage] =
    useState("");

  const [contactNumber, setContactNumber] =
    useState("");

  const [startTime, setStartTime] =
    useState("");

  const [endTime, setEndTime] =
    useState("");

  const [noticeExists, setNoticeExists] =
    useState(false);

  const [noticeLoading, setNoticeLoading] =
    useState(false);

  const [noticeSaving, setNoticeSaving] =
    useState(false);

  useEffect(() => {
    if (screen === "admins") {
      loadAdmins();
    }

    if (screen === "maintenance") {
      loadMaintenanceNotice();
    }
  }, [screen]);

  function showMessage(text) {
    setMsg(text);

    setTimeout(() => {
      setMsg("");
    }, 3000);
  }

  async function loadAdmins() {
    setLoading(true);

    const all = await fsAll("users");

    setAdmins(
      all.filter((user) => user.role === "admin")
    );

    setLoading(false);
  }

  async function toggleBlock(admin) {
    const newBlockedValue = !admin.blocked;

    await fsUpdate("users", admin.uid, {
      blocked: newBlockedValue,
    });

    setAdmins((previousAdmins) =>
      previousAdmins.map((item) =>
        item.uid === admin.uid
          ? {
              ...item,
              blocked: newBlockedValue,
            }
          : item
      )
    );

    showMessage(
      `${admin.fullName} has been ${
        newBlockedValue
          ? "blocked"
          : "unblocked"
      }.`
    );
  }

  async function loadMaintenanceNotice() {
    setNoticeLoading(true);

    const notice = await fsGet(
      "systemSettings",
      "maintenanceNotice"
    );

    if (notice?.active) {
      setNoticeMessage(notice.message || "");
      setContactNumber(
        notice.contactNumber || ""
      );
      setStartTime(notice.startTime || "");
      setEndTime(notice.endTime || "");
      setNoticeExists(true);
    } else {
      setNoticeMessage("");
      setContactNumber("");
      setStartTime("");
      setEndTime("");
      setNoticeExists(false);
    }

    setNoticeLoading(false);
  }

  async function saveMaintenanceNotice() {
    if (!noticeMessage.trim()) {
      showMessage(
        "Please enter a maintenance message."
      );
      return;
    }

    if (!contactNumber.trim()) {
      showMessage(
        "Please enter developer contact number."
      );
      return;
    }

    if (!startTime || !endTime) {
      showMessage(
        "Please select start and end time."
      );
      return;
    }

    try {
      setNoticeSaving(true);

      const saved = await fsSet(
        "systemSettings",
        "maintenanceNotice",
        {
          active: true,
          message: noticeMessage.trim(),
          contactNumber:
            contactNumber.trim(),
          startTime,
          endTime,
          createdBy: profile?.uid || "",
          createdByName:
            profile?.fullName || "",
          createdAt: Date.now(),
        }
      );

      if (!saved) {
        showMessage(
          "Maintenance notice could not be saved."
        );
        return;
      }

      setNoticeExists(true);

      showMessage(
        "Maintenance notice is now active."
      );
    } catch (error) {
      console.error(
        "Maintenance save error:",
        error
      );

      showMessage(
        "Maintenance notice could not be saved."
      );
    } finally {
      setNoticeSaving(false);
    }
  }

  async function deleteMaintenanceNotice() {
    const confirmed = window.confirm(
      "Do you want to remove the maintenance notice and reopen the website?"
    );

    if (!confirmed) return;

    try {
      setNoticeSaving(true);

      const deleted = await fsDel(
        "systemSettings",
        "maintenanceNotice"
      );

      if (!deleted) {
        showMessage(
          "Maintenance notice could not be deleted."
        );
        return;
      }

      setNoticeExists(false);
      setNoticeMessage("");
      setContactNumber("");
      setStartTime("");
      setEndTime("");

      showMessage(
        "Maintenance notice deleted. Website is now available."
      );
    } catch (error) {
      console.error(
        "Maintenance delete error:",
        error
      );

      showMessage(
        "Maintenance notice could not be deleted."
      );
    } finally {
      setNoticeSaving(false);
    }
  }

  const filtered = admins.filter(
    (admin) =>
      admin.fullName
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      admin.email
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      admin.adminId?.includes(search)
  );

  // ACCOUNT SETTINGS
  if (screen === "settings") {
    return (
      <AccountSettings
        profile={profile}
        onBack={() => setScreen("home")}
      />
    );
  }

  // MAINTENANCE NOTICE
  if (screen === "maintenance") {
    return (
      <div style={S.pg}>
        <div style={S.wrap}>
          <TopBar
            onBack={() => setScreen("home")}
            title="🛠️ Maintenance Notice"
            right={
              <button
                type="button"
                onClick={loadMaintenanceNotice}
                style={{
                  background: "#1E293B",
                  border:
                    "1.5px solid #334155",
                  color: "#94A3B8",
                  borderRadius: 8,
                  padding: "7px 12px",
                  cursor: "pointer",
                }}
              >
                ↻
              </button>
            }
          />

          <Msg type="success" text={msg} />

          {noticeLoading ? (
            <div
              style={{
                textAlign: "center",
                padding: 40,
                color: "#64748B",
              }}
            >
              Loading notice…
            </div>
          ) : (
            <div style={S.card}>
              {noticeExists && (
                <div
                  style={{
                    background: "#422006",
                    border:
                      "1px solid #F59E0B",
                    color: "#FCD34D",
                    borderRadius: 10,
                    padding: "10px 12px",
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 18,
                  }}
                >
                  🟠 Maintenance notice is currently
                  active. The website is locked for
                  admins and students.
                </div>
              )}

              <div
                style={{
                  color: "#94A3B8",
                  fontSize: 12,
                  fontWeight: 700,
                  marginBottom: 7,
                }}
              >
                Maintenance Message
              </div>

              <textarea
                value={noticeMessage}
                onChange={(event) =>
                  setNoticeMessage(
                    event.target.value
                  )
                }
                placeholder="Example: Website maintenance is in progress. Some features are being updated."
                rows={5}
                style={{
                  ...S.inp,
                  width: "100%",
                  resize: "vertical",
                  marginBottom: 16,
                  lineHeight: 1.6,
                }}
              />

              <div
                style={{
                  color: "#94A3B8",
                  fontSize: 12,
                  fontWeight: 700,
                  marginBottom: 7,
                }}
              >
                Developer Contact Number
              </div>

              <input
                type="tel"
                value={contactNumber}
                onChange={(event) =>
                  setContactNumber(
                    event.target.value
                  )
                }
                placeholder="Enter contact number"
                style={{
                  ...S.inp,
                  width: "100%",
                  marginBottom: 16,
                }}
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(160px,1fr))",
                  gap: 12,
                  marginBottom: 18,
                }}
              >
                <div>
                  <div
                    style={{
                      color: "#94A3B8",
                      fontSize: 12,
                      fontWeight: 700,
                      marginBottom: 7,
                    }}
                  >
                    Work Start Time
                  </div>

                  <input
                    type="time"
                    value={startTime}
                    onChange={(event) =>
                      setStartTime(
                        event.target.value
                      )
                    }
                    style={{
                      ...S.inp,
                      width: "100%",
                      colorScheme: "dark",
                    }}
                  />
                </div>

                <div>
                  <div
                    style={{
                      color: "#94A3B8",
                      fontSize: 12,
                      fontWeight: 700,
                      marginBottom: 7,
                    }}
                  >
                    Work End Time
                  </div>

                  <input
                    type="time"
                    value={endTime}
                    onChange={(event) =>
                      setEndTime(
                        event.target.value
                      )
                    }
                    style={{
                      ...S.inp,
                      width: "100%",
                      colorScheme: "dark",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <Btn
                  onClick={saveMaintenanceNotice}
                  disabled={noticeSaving}
                  color="#8B5CF6"
                >
                  {noticeSaving
                    ? "Saving..."
                    : noticeExists
                    ? "Update Notice"
                    : "Show Notice"}
                </Btn>

                {noticeExists && (
                  <Btn
                    onClick={
                      deleteMaintenanceNotice
                    }
                    disabled={noticeSaving}
                    color="#EF4444"
                  >
                    Delete Notice
                  </Btn>
                )}
              </div>

              <div
                style={{
                  color: "#64748B",
                  fontSize: 11,
                  lineHeight: 1.7,
                  marginTop: 16,
                }}
              >
                The website will remain locked until
                this notice is deleted. Start and end
                times are displayed to users but do
                not automatically remove the notice.
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // HOME
  if (screen === "home") {
    return (
      <div style={S.pg}>
        <div style={S.wrap}>
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              marginBottom: 24,
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div>
              <div
                style={{
                  color: "#8B5CF6",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                👨‍💻 DEVELOPER PANEL
              </div>

              <div
                style={{
                  fontWeight: 800,
                  fontSize: 20,
                }}
              >
                {profile?.fullName}
              </div>

              <div
                style={{
                  color: "#64748B",
                  fontSize: 12,
                }}
              >
                {profile?.email}
              </div>
            </div>

            <Btn
              onClick={logoutUser}
              color="#EF4444"
              sm
            >
              Logout
            </Btn>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(200px,1fr))",
              gap: 14,
            }}
          >
            {[
              {
                key: "admins",
                icon: "👨‍🏫",
                t: "All Admins",
                d: "View and manage admin accounts",
              },
              {
                key: "maintenance",
                icon: "🛠️",
                t: "Maintenance Notice",
                d: "Lock the website and show a developer message",
              },
              {
                key: "settings",
                icon: "⚙️",
                t: "Account Settings",
                d: "Change password, email or mobile",
              },
            ].map((menu) => (
              <button
                type="button"
                key={menu.key}
                onClick={() =>
                  setScreen(menu.key)
                }
                style={{
                  padding: "22px 18px",
                  borderRadius: 14,
                  border:
                    "1.5px solid #8B5CF644",
                  background: "#1E293B",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: 28 }}>
                  {menu.icon}
                </div>

                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 15,
                    color: "#F8FAFC",
                  }}
                >
                  {menu.t}
                </div>

                <div
                  style={{
                    color: "#475569",
                    fontSize: 12,
                    marginTop: 6,
                  }}
                >
                  {menu.d}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ADMINS
  return (
    <div style={S.pg}>
      <div style={S.wrap}>
        <TopBar
          onBack={() => setScreen("home")}
          title="👨‍🏫 All Admins"
          right={
            <button
              type="button"
              onClick={loadAdmins}
              style={{
                background: "#1E293B",
                border:
                  "1.5px solid #334155",
                color: "#94A3B8",
                borderRadius: 8,
                padding: "7px 12px",
                cursor: "pointer",
              }}
            >
              ↻
            </button>
          }
        />

        <Msg type="success" text={msg} />

        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="🔍 Search name, email or Admin ID…"
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 10,
            background: "#1E293B",
            border:
              "1.5px solid #334155",
            color: "#fff",
            marginBottom: 16,
          }}
        />

        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: 40,
            }}
          >
            Loading...
          </div>
        )}

        {filtered.map((admin) => (
          <div
            key={admin.uid}
            style={{
              ...S.card,
              display: "flex",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontSize: 24 }}>
              👨‍🏫
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>
                {admin.fullName}
              </div>

              <div
                style={{
                  color: "#64748B",
                  fontSize: 12,
                }}
              >
                {admin.email} 📱 {admin.mobile}
              </div>

              <div
                style={{
                  color: "#FCD34D",
                  fontSize: 12,
                }}
              >
                🔑 Admin ID: {admin.adminId}
              </div>
            </div>

            <Btn
              onClick={() =>
                toggleBlock(admin)
              }
              color={
                admin.blocked
                  ? "#22C55E"
                  : "#EF4444"
              }
              sm
            >
              {admin.blocked
                ? "Unblock"
                : "Block"}
            </Btn>
          </div>
        ))}
      </div>
    </div>
  );
}