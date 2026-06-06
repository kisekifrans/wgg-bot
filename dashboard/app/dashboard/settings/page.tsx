import { DashboardShell } from '@/components/DashboardShell';
import { SettingsPage } from '@/components/SettingsPage';

export default function SettingsRoute() {
  return (
    <DashboardShell>
      <SettingsPage />
    </DashboardShell>
  );
}
