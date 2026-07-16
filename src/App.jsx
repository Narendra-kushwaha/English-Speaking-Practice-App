import { useEffect, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { fsListen } from "./utils/store";

import LoginScreen from "./components/auth/LoginScreen";
import RegisterScreen from "./components/auth/RegisterScreen";
import DeveloperAuth from "./components/developer/DeveloperAuth";
import StudentHome from "./components/student/StudentHome";
import AdminPanel from "./components/admin/AdminPanel";
import DeveloperPanel from "./components/developer/DeveloperPanel";
import VerifyCertificate from "./components/shared/VerifyCertificate";
import MaintenanceNotice from "./components/shared/MaintenanceNotice";

import { S } from "./data/questions";

export default function App() {
  const { user, profile, loading } = useAuth();

  const [authScreen, setAuthScreen] = useState("login");
  const [registerRole, setRegisterRole] = useState("student");

  const [maintenanceNotice, setMaintenanceNotice] =
    useState(null);

  const [noticeLoading, setNoticeLoading] =
    useState(true);

  const currentPath = window.location.pathname;

  const isDeveloperRoute =
    currentPath === "/developer" ||
    currentPath === "/developer/";

  const params = new URLSearchParams(
    window.location.search
  );

  const verifyCertificateId = params.get("verify");

  useEffect(() => {
    const unsubscribe = fsListen(
      "systemSettings",
      "maintenanceNotice",
      (notice) => {
        setMaintenanceNotice(notice);
        setNoticeLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Authentication aur notice check hone tak loading screen
  if (loading || noticeLoading) {
    return (
      <div
        style={{
          ...S.pg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 48,
              marginBottom: 16,
            }}
          >
            📚
          </div>

          <div
            style={{
              color: "#64748B",
              fontSize: 14,
            }}
          >
            Loading…
          </div>
        </div>
      </div>
    );
  }

  /*
    DEVELOPER BYPASS ROUTE

    Maintenance notice active hone par bhi:
    /developer se Developer Login ya Developer Panel khulega.
  */
  if (isDeveloperRoute) {
    if (user && profile?.role === "developer") {
      return (
        <DeveloperPanel profile={profile} />
      );
    }

    return (
      <DeveloperAuth
        onBack={() => {
          window.location.href = "/";
        }}
      />
    );
  }

  /*
    Agar developer pehle se login hai aur normal URL open karta hai,
    tab bhi uska Developer Panel open rahega.
  */
  if (user && profile?.role === "developer") {
    return (
      <DeveloperPanel profile={profile} />
    );
  }

  /*
    Maintenance notice active hone par:
    Login, Signup, Admin, Student aur Certificate pages hide rahenge.
  */
  if (maintenanceNotice?.active === true) {
    return (
      <MaintenanceNotice
        notice={maintenanceNotice}
      />
    );
  }

  // Notice delete hone ke baad normal website flow
  if (verifyCertificateId) {
    return (
      <VerifyCertificate
        certificateId={verifyCertificateId}
      />
    );
  }

  if (user && profile) {
    if (profile.role === "admin") {
      return (
        <AdminPanel profile={profile} />
      );
    }

    if (profile.role === "student") {
      return (
        <StudentHome profile={profile} />
      );
    }
  }

  if (authScreen === "developerAuth") {
    return (
      <DeveloperAuth
        onBack={() =>
          setAuthScreen("login")
        }
      />
    );
  }

  if (authScreen === "register") {
    return (
      <RegisterScreen
        role={registerRole}
        onBack={() =>
          setAuthScreen("login")
        }
      />
    );
  }

  return (
    <LoginScreen
      onGoRegister={(role) => {
        setRegisterRole(role);
        setAuthScreen("register");
      }}
      onGoDeveloper={() => {
        setAuthScreen("developerAuth");
      }}
    />
  );
}