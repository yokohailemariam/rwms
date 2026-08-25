export interface EmergencyReportedPayload {
  incidentId: string;
  tenantId: string;
  factoryId: string;
  reporterId: string;
  incidentType: string;
  severity: string;
  title: string;
  location: string;
}

export interface EmergencyResolvedPayload {
  incidentId: string;
  tenantId: string;
  factoryId: string;
  resolvedById: string;
  resolvedAt: string;
}

export const EMERGENCY_EVENT_TYPES = {
  INCIDENT_REPORTED: 'emergency.incident-reported.v1',
  INCIDENT_ACKNOWLEDGED: 'emergency.incident-acknowledged.v1',
  INCIDENT_RESOLVED: 'emergency.incident-resolved.v1',
} as const;
