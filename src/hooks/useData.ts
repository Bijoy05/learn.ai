import { mockCourses, mockStudent, mockNotifications, mockSchedule, mockNotes, mockMessages, mockReportData } from "@/lib/mockData";

export const useCourses = () => ({ courses: mockCourses, getCourse: (id: string) => mockCourses.find((c) => c.id === id) });
export const useStudent = () => ({ student: mockStudent });
export const useNotifications = () => ({ notifications: mockNotifications, unreadCount: mockNotifications.filter((n) => !n.read).length });
export const useSchedule = () => ({ schedule: mockSchedule });
export const useNotes = () => ({ notes: mockNotes });
export const useMessages = (sessionId: string) => ({ messages: mockMessages[sessionId] || [] });
export const useReportData = () => ({ data: mockReportData });
