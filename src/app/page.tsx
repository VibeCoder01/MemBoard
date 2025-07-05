import { DisplayBoard } from '@/components/display-board';
import { ViewFooter } from '@/components/view-footer';
import { ViewHeader } from '@/components/view-header';

export default function Home() {
  return (
    <main className="flex h-screen w-full flex-col bg-background">
      <ViewHeader />
      <div className="flex-1 overflow-hidden">
        <DisplayBoard />
      </div>
      <ViewFooter />
    </main>
  );
}
