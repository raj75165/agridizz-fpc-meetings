import Dexie, { type Table } from 'dexie';

export interface Member {
  id?: number;
  name: string;
  role: 'Director' | 'Member';
  active: boolean;
  mobile?: string;
  createdAt: number;
}

export interface Meeting {
  id?: number;
  type: 'Annual' | 'Special' | 'Board';
  date: string;
  time: string;
  venue: string;
  notes?: string;
  attendeeIds: number[];
  signatureMemberIds: number[];
  locked: boolean;
  lockedAt?: number;
  createdAt: number;
}

export interface Resolution {
  id?: number;
  meetingId: number;
  order: number;
  titleHindi: string;
  textHindi: string;
  titleEnglish: string;
  textEnglish: string;
  createdAt: number;
}

export interface Signature {
  id?: number;
  meetingId: number;
  memberId: number;
  dataUrl: string;
  signedAt: number;
}

export interface AudioRecording {
  id?: number;
  meetingId: number;
  blob: Blob;
  recordedAt: number;
  durationMs?: number;
}

export class AppDB extends Dexie {
  members!: Table<Member>;
  meetings!: Table<Meeting>;
  resolutions!: Table<Resolution>;
  signatures!: Table<Signature>;
  audioRecordings!: Table<AudioRecording>;

  constructor() {
    super('agridizzFPC');
    this.version(1).stores({
      members: '++id, name, role, active',
      meetings: '++id, date, locked',
      resolutions: '++id, meetingId, order',
      signatures: '++id, meetingId, memberId',
      audioRecordings: '++id, meetingId',
    });
  }
}

export const db = new AppDB();
