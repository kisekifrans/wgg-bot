import { DashboardShell } from '@/components/DashboardShell';
import { PanelsPage } from '@/components/PanelsPage';

export default function DashboardPage() {
  return (
    <DashboardShell>
      <PanelsPage />
    </DashboardShell>
  );
}
