export type Role = "admin" | "teacher" | "student";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  profilePicture?: string;
  profile?: Record<string, unknown>;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface Course {
  id: number;
  name: string;
  description?: string;
  teacher_id?: number | null;
  teacher?: {
    id: number;
    user?: {
      name: string;
      email: string;
    };
  };
  materials?: Material[];
  students?: Student[];
}

export interface Material {
  id: number;
  title: string;
  type: "file" | "video";
  filePath?: string;
  videoUrl?: string;
}

export interface Teacher {
  id: number;
  fatherName?: string;
  specialization: string;
  qualification?: string;
  contactNumber?: string;
  courseId?: number | null;
  createdAt?: string;
  selectedCourse?: Course;
  user: AuthUser;
}

export interface Student {
  id: number;
  fatherName?: string;
  motherName?: string;
  dob?: string;
  address?: string;
  contactNumber?: string;
  gender?: "male" | "female" | "other";
  courseId?: number | null;
  attendance: number;
  performance: number;
  createdAt?: string;
  primaryCourse?: Course;
  user: AuthUser;
}

export interface QuizQuestion {
  id?: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Quiz {
  id: number;
  title: string;
  course_id: number;
  questions: QuizQuestion[];
}

export interface Payment {
  id: number;
  amount: number;
  status: "pending" | "paid" | "failed";
  reference?: string;
  createdAt?: string;
  student?: Student;
}

export interface TeacherPayment {
  id: number;
  amount: number;
  status: "pending" | "paid" | "failed";
  reference?: string;
  createdAt?: string;
  teacher?: Teacher;
}

export interface TeacherResultSheet {
  id: number;
  title: string;
  totalMarks: number;
  obtainedMarks: number;
  createdAt?: string;
  course?: {
    id: number;
    name: string;
  };
  student?: Student;
  entries: Array<{
    subject: string;
    totalMarks: number;
    obtainedMarks: number;
  }>;
}

export interface TeacherDetail extends Teacher {
  salaryPayments?: TeacherPayment[];
  assignedCourses?: Array<{
    id: number;
    name: string;
    description?: string;
    createdAt?: string;
  }>;
}

export interface StudentDetail extends Student {
  payments?: Payment[];
  results?: Array<{
    id: number;
    score: number;
    createdAt?: string;
    quiz?: {
      id: number;
      title: string;
      course?: {
        id: number;
        name: string;
      };
    };
  }>;
  attendanceRecords?: Array<{
    id: number;
    date: string;
    status: "present" | "absent" | "late";
    course?: {
      id: number;
      name: string;
    };
  }>;
  enrollments?: Array<{
    id: number;
    createdAt?: string;
    fee?: number;
    discount?: number;
    finalAmount?: number;
    course?: {
      id: number;
      name: string;
      description?: string;
    };
  }>;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  audience: "all" | "teacher" | "student";
  createdAt: string;
}

export interface ActivityLogItem {
  id: number;
  action: string;
  entityType: "student" | "teacher";
  entityName: string;
  entityEmail: string;
  performedBy: string;
  performedByRole: string;
  description: string;
  createdAt: string;
}
