import { DashboardShell } from '@/components/DashboardShell';
import { CommandsPage } from '@/components/CommandsPage';

export default function CommandsRoute() {
  return (
    <DashboardShell>
      <CommandsPage />
    </DashboardShell>
  );
}
