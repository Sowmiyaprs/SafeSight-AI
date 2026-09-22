import { Violation, Report } from './types';

export const VIOLATIONS: Violation[] = [
  { id: 'V-101', time: '2026-03-07 09:12:45', workerId: 'W-442', type: 'No Helmet', location: 'Zone A - North Wing', status: 'Critical' },
  { id: 'V-102', time: '2026-03-07 10:05:12', workerId: 'W-129', type: 'No Helmet', location: 'Zone C - Loading Dock', status: 'Warning' },
  { id: 'V-103', time: '2026-03-07 11:30:00', workerId: 'W-883', type: 'PPE Missing', location: 'Zone B - Scaffolding', status: 'Resolved' },
  { id: 'V-104', time: '2026-03-07 13:45:22', workerId: 'W-221', type: 'No Helmet', location: 'Zone A - Entrance', status: 'Critical' },
  { id: 'V-105', time: '2026-03-07 14:20:10', workerId: 'W-556', type: 'Unauthorized Access', location: 'Zone D - Storage', status: 'Warning' },
];

export const REPORTS: Report[] = [
  { id: 'R-001', name: 'Weekly Safety Audit - Week 9', date: '2026-03-01', type: 'Safety', status: 'Ready' },
  { id: 'R-002', name: 'Monthly Insurance Compliance', date: '2026-02-28', type: 'Insurance', status: 'Ready' },
  { id: 'R-003', name: 'Zone A Incident Summary', date: '2026-03-05', type: 'Compliance', status: 'Ready' },
  { id: 'R-004', name: 'Daily Compliance Log - Mar 06', date: '2026-03-06', type: 'Safety', status: 'Ready' },
];

export const COMPLIANCE_TREND = [
  { time: '08:00', compliance: 92 },
  { time: '09:00', compliance: 88 },
  { time: '10:00', compliance: 95 },
  { time: '11:00', compliance: 91 },
  { time: '12:00', compliance: 85 },
  { time: '13:00', compliance: 94 },
  { time: '14:00', compliance: 97 },
  { time: '15:00', compliance: 93 },
];
