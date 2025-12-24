"use client";

import { renderTimelineSnapshot } from "@/template/component/molecules/timeline-snapshot.template";
import { TimelineSnapshot as TimelineSnapshotType } from "@/interfaces/dashboard.interface";

export interface TimelineSnapshotProps {
  data: TimelineSnapshotType;
  className?: string;
}

export function TimelineSnapshot(props: TimelineSnapshotProps) {
  return renderTimelineSnapshot(props);
}

