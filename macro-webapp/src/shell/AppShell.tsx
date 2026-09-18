// The signed-in app chrome, per the Oxygen sample's AppLayout
// (oxygen-ui-design-system/references/app-structure.md): Header in
// AppShell.Navbar, Sidebar in AppShell.Sidebar, the routed page in
// AppShell.Main, Footer in AppShell.Footer.
//
// ONE rail for both roles (Client and Coach): each item is wrapped in <Can>,
// so a Client sees Today/History/Goal/Coach access, a Coach sees Clients, and
// anybody holding both would see the union — there is no per-role branching
// here, only the operation each item's screen loads.
import { AppShell, Header, Sidebar, Footer, UserMenu } from "@wso2/oxygen-ui";
import {
  LayoutDashboard,
  History as HistoryIcon,
  Target,
  UserCheck,
  Users,
  LogOut,
} from "@wso2/oxygen-ui-icons-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import type { JSX, ReactNode } from "react";
import { APP_NAME } from "../appName";
import { Can, useAuthz, useHeldRoles } from "../authz/gates";
import { signOut } from "../authz/session";
import { SCREEN_ROUTES } from "../authz/screens";

const RAIL_ICONS: Record<string, ReactNode> = {
  today: <LayoutDashboard size={18} />,
  history: <HistoryIcon size={18} />,
  goal: <Target size={18} />,
  "coach-access": <UserCheck size={18} />,
  "clients-list": <Users size={18} />,
};

function RailItem({ screenKey, path, label }: { screenKey: string; path: string; label: string }): JSX.Element {
  return (
    <Sidebar.Item id={screenKey} link={<Link to={path} />}>
      <Sidebar.ItemIcon>{RAIL_ICONS[screenKey]}</Sidebar.ItemIcon>
      <Sidebar.ItemLabel>{label}</Sidebar.ItemLabel>
    </Sidebar.Item>
  );
}

export function AppShellRoot(): JSX.Element {
  const { pathname } = useLocation();
  const { username } = useAuthz();
  const roles = useHeldRoles();
  const railScreens = SCREEN_ROUTES.filter((screen) => screen.inRail);
  const active = railScreens.find((screen) => pathname.startsWith(screen.path))?.key;

  return (
    <AppShell>
      <AppShell.Navbar>
        <Header minimal>
          <Header.Toggle />
          <Header.Brand>
            <Header.BrandTitle>{APP_NAME}</Header.BrandTitle>
          </Header.Brand>
          <Header.Spacer />
          <Header.Actions>
            <UserMenu>
              <UserMenu.Trigger name={username || "Signed in"} />
              <UserMenu.Header
                name={username || "Signed in"}
                email=""
                role={roles.join(", ") || undefined}
              />
              <UserMenu.Divider />
              <UserMenu.Logout onClick={() => void signOut()} icon={<LogOut size={16} />} />
            </UserMenu>
          </Header.Actions>
        </Header>
      </AppShell.Navbar>

      <AppShell.Sidebar>
        <Sidebar activeItem={active}>
          <Sidebar.Nav>
            <Sidebar.Category>
              {railScreens.map((screen) =>
                screen.loads === null ? (
                  <RailItem key={screen.key} screenKey={screen.key} path={screen.path} label={screen.label} />
                ) : (
                  <Can key={screen.key} op={screen.loads}>
                    <RailItem screenKey={screen.key} path={screen.path} label={screen.label} />
                  </Can>
                ),
              )}
            </Sidebar.Category>
          </Sidebar.Nav>
        </Sidebar>
      </AppShell.Sidebar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>

      <AppShell.Footer>
        <Footer>
          <Footer.Copyright>© WSO2 LLC</Footer.Copyright>
        </Footer>
      </AppShell.Footer>
    </AppShell>
  );
}
