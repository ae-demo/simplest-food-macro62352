// Adapted from thunder-authentication's App.example.tsx. The routing
// STRUCTURE below is prescribed (see that file's header comment): NoAccess
// above the shell and replacing it, Forbidden inside the shell, /callback
// outside the provider, every gated route wrapped in <RequireOperation>, and
// the forbidden navigator wired once from inside the router.
import { useEffect, type ReactElement } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import {
  AuthzProvider,
  Forbidden,
  NoAccess,
  RequireOperation,
  useAuthz,
  useScopes,
} from "./authz/gates";
import { SCREEN_ROUTES, reachableScreens, hasScopedReach } from "./authz/screens";
import { setForbiddenNavigator } from "./authz/client";
import { signIn } from "./authz/session";
import { AppShellRoot } from "./shell/AppShell";
import { APP_NAME } from "./appName";
import { CallbackPage } from "./pages/Callback";
import { TodayPage } from "./pages/Today";
import { LogFoodEntryPage } from "./pages/LogFoodEntry";
import { EditFoodEntryPage } from "./pages/EditFoodEntry";
import { HistoryPage } from "./pages/History";
import { GoalPage } from "./pages/Goal";
import { CoachAccessPage } from "./pages/CoachAccess";
import { GrantCoachAccessPage } from "./pages/GrantCoachAccess";
import { ClientsListPage } from "./pages/ClientsList";
import { ClientProgressPage } from "./pages/ClientProgress";

/** YOUR pages, keyed by the screen keys src/authz/screens.ts declares. */
const PAGE_BY_KEY: Record<string, ReactElement> = {
  today: <TodayPage />,
  "log-food-entry": <LogFoodEntryPage />,
  "edit-food-entry": <EditFoodEntryPage />,
  history: <HistoryPage />,
  goal: <GoalPage />,
  "coach-access": <CoachAccessPage />,
  "grant-coach-access": <GrantCoachAccessPage />,
  "clients-list": <ClientsListPage />,
  "client-progress": <ClientProgressPage />,
};

/** No screen in this app's flows lacks a `role` line, so this is always empty. */
const PUBLIC_SCREENS = SCREEN_ROUTES.filter((screen) => screen.public);

export default function App(): ReactElement {
  return (
    <BrowserRouter>
      <ForbiddenWiring />
      <Routes>
        <Route path="/callback" element={<CallbackPage />} />
        {PUBLIC_SCREENS.map((screen) => (
          <Route
            key={screen.key}
            path={screen.path}
            element={
              <AuthzProvider fallback={<Splash />}>{PAGE_BY_KEY[screen.key]}</AuthzProvider>
            }
          />
        ))}
        <Route
          path="*"
          element={
            <AuthzProvider fallback={<Splash />}>
              <SignedIn />
            </AuthzProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

function ForbiddenWiring(): null {
  const navigate = useNavigate();
  useEffect(() => {
    setForbiddenNavigator(() => navigate("/forbidden", { replace: true }));
  }, [navigate]);
  return null;
}

function Splash(): ReactElement {
  return (
    <main>
      <h1>{APP_NAME}</h1>
      <p>Checking your session…</p>
    </main>
  );
}

function SignedIn(): ReactElement {
  const { signedIn } = useAuthz();
  const scopes = useScopes();

  useEffect(() => {
    if (!signedIn) void signIn();
  }, [signedIn]);

  if (!signedIn) return <Splash />;

  const reachable = reachableScreens(scopes, signedIn);

  if (!hasScopedReach(scopes, signedIn)) return <NoAccess appName={APP_NAME} />;

  const landing = (reachable.find((s) => !s.public && s.loads !== null) ?? reachable[0]).path;

  return (
    <Routes>
      <Route element={<AppShellRoot />}>
        <Route index element={<Navigate to={landing} replace />} />
        {SCREEN_ROUTES.map((screen) => {
          if (screen.public) return null;
          const page = PAGE_BY_KEY[screen.key];
          if (screen.loads === null) {
            return <Route key={screen.key} path={screen.path} element={page} />;
          }
          return (
            <Route
              key={screen.key}
              element={<RequireOperation op={screen.loads} screen={screen.label} />}
            >
              <Route path={screen.path} element={page} />
            </Route>
          );
        })}
        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="*" element={<Navigate to={landing} replace />} />
      </Route>
    </Routes>
  );
}
