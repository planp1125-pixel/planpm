import type { Timestamp } from 'firebase/firestore';

export type InstrumentStatus = 'Operational' | 'Needs Maintenance' | 'Out of Service' | 'Archived';

export type MaintenanceEvent = {
  id: string;
  date: string; // Keep as string for form, convert to Timestamp for Firestore
  type: 'Scheduled' | 'Unscheduled' | 'Emergency';
  description: string;
  notes?: string;
  completed: boolean;
  files?: string[];
};

// This represents the data structure in Firestore
export type Instrument = {
  id: string; // Document ID
  name: string;
  model: string;
  serialNumber: string;
  location: string;
  status: InstrumentStatus;
  installationDate: Timestamp;
  lastMaintenanceDate: Timestamp;
  nextMaintenanceDate: Timestamp;
  imageId: string;
  // Subcollections would be handled separately
};

// This is used for creating a new instrument, dates are strings from the form
export type NewInstrument = Omit<Instrument, 'id' | 'lastMaintenanceDate' | 'nextMaintenanceDate' | 'installationDate'> & {
  installationDate: string;
};
