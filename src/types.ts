export interface Violation {
  id: string;
  time: string;
  workerId: string;
  type: 'No Helmet' | 'Unauthorized Access' | 'PPE Missing';
  location: string;
  status: 'Critical' | 'Warning' | 'Resolved';
}

export interface Report {
  id: string;
  name: string;
  date: string;
  type: 'Safety' | 'Insurance' | 'Compliance';
  status: 'Ready' | 'Generating';
}

export interface StatCard {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
}
