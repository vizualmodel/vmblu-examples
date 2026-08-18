import type { FeatureCollection, Geometry } from "geojson";

export type OperationalFeatureKind = "flood" | "closure" | "unit" | "evacuation";

export type OperationalFeatureProperties = {
  kind: OperationalFeatureKind;
  title: string;
  detail: string;
  status: string;
  source: string;
};

export type SelectedOperationalFeature = OperationalFeatureProperties & {
  featureId: string;
};

export type OperationalTask = {
  taskId: string;
  title: string;
  status: string;
  owner: string;
};

export type AuditRecord = {
  auditId: string;
  action: string;
  actorId: string;
  reason: string;
  recordedAt: string;
};

export type OperationalSpatialFeatures = FeatureCollection<
  Geometry,
  OperationalFeatureProperties
>;

export type SituationSummary = {
  headline: string;
  severity: string;
  phase: string;
  observedAt: string;
  activeUnitCount: number;
  closedRouteCount: number;
  proposedZoneCount: number;
  approvedZoneCount: number;
};

export type OperationalPicture = {
  incidentTitle: string;
  situation: SituationSummary;
  tasks: OperationalTask[];
  auditTrail: AuditRecord[];
  spatialFeatures: OperationalSpatialFeatures;
};

export type CommandCentreProjection = {
  incidentId: string;
  version?: string;
  sequence?: string;
  source: "initial" | "live" | "resynchronized" | "degraded";
  picture: OperationalPicture;
  degradation?: unknown;
};

export const emptyOperationalSpatialFeatures: OperationalSpatialFeatures = {
  type: "FeatureCollection",
  features: [],
};
