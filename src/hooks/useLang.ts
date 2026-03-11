import { useState, useCallback } from 'react';

type Lang = 'hi' | 'en';

const translations: Record<string, Record<Lang, string>> = {
  // Nav
  members: { hi: 'सदस्य', en: 'Members' },
  meetings: { hi: 'बैठकें', en: 'Meetings' },
  settings: { hi: 'सेटिंग्स', en: 'Settings' },
  // Auth
  setPin: { hi: 'PIN सेट करें', en: 'Set PIN' },
  enterPin: { hi: 'PIN दर्ज करें', en: 'Enter PIN' },
  confirmPin: { hi: 'PIN की पुष्टि करें', en: 'Confirm PIN' },
  pinMismatch: { hi: 'PIN मेल नहीं खाते', en: 'PINs do not match' },
  pinWrong: { hi: 'गलत PIN', en: 'Wrong PIN' },
  pin4digits: { hi: 'PIN 4 अंकों का होना चाहिए', en: 'PIN must be 4 digits' },
  submit: { hi: 'जमा करें', en: 'Submit' },
  // Members
  addMember: { hi: 'सदस्य जोड़ें', en: 'Add Member' },
  editMember: { hi: 'सदस्य संपादित करें', en: 'Edit Member' },
  name: { hi: 'नाम', en: 'Name' },
  role: { hi: 'भूमिका', en: 'Role' },
  mobile: { hi: 'मोबाइल', en: 'Mobile' },
  active: { hi: 'सक्रिय', en: 'Active' },
  inactive: { hi: 'निष्क्रिय', en: 'Inactive' },
  director: { hi: 'निदेशक', en: 'Director' },
  member: { hi: 'सदस्य', en: 'Member' },
  search: { hi: 'खोजें', en: 'Search' },
  save: { hi: 'सहेजें', en: 'Save' },
  cancel: { hi: 'रद्द करें', en: 'Cancel' },
  delete: { hi: 'हटाएं', en: 'Delete' },
  edit: { hi: 'संपादित करें', en: 'Edit' },
  confirmDelete: { hi: 'क्या आप वाकई हटाना चाहते हैं?', en: 'Are you sure you want to delete?' },
  // Meetings
  addMeeting: { hi: 'बैठक जोड़ें', en: 'Add Meeting' },
  meetingType: { hi: 'बैठक प्रकार', en: 'Meeting Type' },
  annual: { hi: 'वार्षिक', en: 'Annual' },
  special: { hi: 'विशेष', en: 'Special' },
  board: { hi: 'बोर्ड', en: 'Board' },
  date: { hi: 'तारीख', en: 'Date' },
  time: { hi: 'समय', en: 'Time' },
  venue: { hi: 'स्थान', en: 'Venue' },
  notes: { hi: 'टिप्पणियां', en: 'Notes' },
  locked: { hi: 'लॉक', en: 'Locked' },
  unlocked: { hi: 'अनलॉक', en: 'Unlocked' },
  lock: { hi: 'लॉक करें', en: 'Lock' },
  unlock: { hi: 'अनलॉक करें', en: 'Unlock' },
  // Attendance
  attendance: { hi: 'उपस्थिति', en: 'Attendance' },
  selectAttendees: { hi: 'उपस्थित सदस्यों का चयन करें', en: 'Select Attendees' },
  // Resolutions
  resolutions: { hi: 'प्रस्ताव', en: 'Resolutions' },
  addResolution: { hi: 'प्रस्ताव जोड़ें', en: 'Add Resolution' },
  titleHindi: { hi: 'शीर्षक (हिंदी)', en: 'Title (Hindi)' },
  textHindi: { hi: 'पाठ (हिंदी)', en: 'Text (Hindi)' },
  titleEnglish: { hi: 'शीर्षक (अंग्रेज़ी)', en: 'Title (English)' },
  textEnglish: { hi: 'पाठ (अंग्रेज़ी)', en: 'Text (English)' },
  // Signatures
  signatures: { hi: 'हस्ताक्षर', en: 'Signatures' },
  sign: { hi: 'हस्ताक्षर करें', en: 'Sign' },
  clear: { hi: 'साफ करें', en: 'Clear' },
  // Audio
  audio: { hi: 'ऑडियो', en: 'Audio' },
  record: { hi: 'रिकॉर्ड करें', en: 'Record' },
  stop: { hi: 'रोकें', en: 'Stop' },
  play: { hi: 'चलाएं', en: 'Play' },
  // Settings
  changePin: { hi: 'PIN बदलें', en: 'Change PIN' },
  oldPin: { hi: 'पुराना PIN', en: 'Old PIN' },
  newPin: { hi: 'नया PIN', en: 'New PIN' },
  exportData: { hi: 'डेटा निर्यात करें', en: 'Export Data' },
  importData: { hi: 'डेटा आयात करें', en: 'Import Data' },
  importWarning: { hi: 'यह सभी मौजूदा डेटा को बदल देगा। क्या आप जारी रखना चाहते हैं?', en: 'This will replace all existing data. Are you sure?' },
  // PDF
  generatePdf: { hi: 'PDF बनाएं', en: 'Generate PDF' },
  // General
  back: { hi: 'वापस', en: 'Back' },
  noData: { hi: 'कोई डेटा नहीं', en: 'No data' },
  loading: { hi: 'लोड हो रहा है...', en: 'Loading...' },
  error: { hi: 'त्रुटि', en: 'Error' },
  success: { hi: 'सफलता', en: 'Success' },
  selectMembers: { hi: 'हस्ताक्षर सदस्यों का चयन करें (अधिकतम 5)', en: 'Select signature members (max 5)' },
  info: { hi: 'जानकारी', en: 'Info' },
  appVersion: { hi: 'ऐप संस्करण', en: 'App Version' },
};

const LANG_KEY = 'fpc_lang';

export function useLang() {
  const [currentLang, setCurrentLang] = useState<Lang>(
    () => (localStorage.getItem(LANG_KEY) as Lang) || 'en'
  );

  const toggleLang = useCallback(() => {
    setCurrentLang(prev => {
      const next = prev === 'hi' ? 'en' : 'hi';
      localStorage.setItem(LANG_KEY, next);
      return next;
    });
  }, []);

  const t = useCallback((key: string): string => {
    return translations[key]?.[currentLang] ?? key;
  }, [currentLang]);

  return { currentLang, toggleLang, t };
}
