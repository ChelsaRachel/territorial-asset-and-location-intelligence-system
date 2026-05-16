import dynamic from 'next/dynamic';
import { LoadingSkeleton } from '@/components/ui';
import type { MapSelectionTarget } from './MapSelectionController';

export interface CommandCenterMapDynamicProps {
  selectedLocation: MapSelectionTarget | null;
}

export const CommandCenterMap = dynamic<CommandCenterMapDynamicProps>(
  () => import('./CommandCenterMap').then((m) => m.CommandCenterMap),
  {
    ssr: false,
    loading: () => <LoadingSkeleton shape="card" className="w-full h-full" />,
  }
);
