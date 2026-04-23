import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/client";
import { AnalyticsBarChart } from "../../components/charts/AnalyticsBarChart";
import { AnalyticsDoughnutChart } from "../../components/charts/AnalyticsDoughnutChart";
import { Badge } from "../../components/shared/Badge";
import { Button } from "../../components/shared/Button";
import { Card } from "../../components/shared/Card";
import { DataTable } from "../../components/shared/DataTable";
import { EmptyState } from "../../components/shared/EmptyState";
import { Input } from "../../components/shared/Input";
import { ActivityLogItem, Course, NotificationItem, Payment, Student, StudentDetail, Teacher, TeacherDetail, TeacherPayment } from "../../types";

const SummaryGrid = ({ items }: { items: { label: string; value: string | number }[] }) => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    {items.map((item) => (
      <Card key={item.label}>
        <p className="text-sm text-slate-500">{item.label}</p>
        <p className="mt-3 text-3xl font-semibold">{item.value}</p>
      </Card>
    ))}
  </div>
);

export const AdminDashboardPage = () => {
  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    api.get("/admin/dashboard").then(({ data }) => setDashboard(data));
  }, []);

  if (!dashboard) {
    return <Card title="Loading dashboard">Preparing analytics...</Card>;
  }

  return (
    <div className="space-y-6">
      <SummaryGrid
        items={[
          { label: "Students", value: dashboard.totals.students },
          { label: "Teachers", value: dashboard.totals.teachers },
          { label: "Courses", value: dashboard.totals.courses },
          { label: "Revenue", value: `Rs ${dashboard.totals.totalRevenue}` }
        ]}
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Institution overview" subtitle="Core platform growth metrics">
          <AnalyticsBarChart
            labels={["Students", "Teachers", "Courses", "Enrollments"]}
            data={[
              dashboard.totals.students,
              dashboard.totals.teachers,
              dashboard.totals.courses,
              dashboard.totals.enrollments
            ]}
            label="Overview"
          />
        </Card>
        <Card title="Payments status" subtitle="Track fee collection at a glance">
          <div className="mx-auto max-w-xs">
            <AnalyticsDoughnutChart
              labels={["Pending", "Paid", "Failed"]}
              data={[
                dashboard.paymentsByStatus.pending,
                dashboard.paymentsByStatus.paid,
                dashboard.paymentsByStatus.failed
              ]}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

const useSearch = <T,>(items: T[], selector: (item: T) => string) => {
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () => items.filter((item) => selector(item).toLowerCase().includes(search.toLowerCase())),
    [items, search, selector]
  );
  return { search, setSearch, filtered };
};

export const AdminTeachersPage = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherDetail | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", specialization: "" });

  const load = () => api.get("/admin/teachers").then(({ data }) => setTeachers(data));
  useEffect(() => {
    load();
  }, []);
  const { search, setSearch, filtered } = useSearch(teachers, (item) => `${item.user.name} ${item.specialization}`);

  const submit = async () => {
    await api.post("/admin/teachers", form);
    setForm({ name: "", email: "", password: "", specialization: "" });
    load();
  };

  const removeTeacher = async (teacherId: number) => {
    await api.delete(`/admin/teachers/${teacherId}`);
    if (selectedTeacher?.id === teacherId) {
      setSelectedTeacher(null);
    }
    load();
  };

  const showTeacherDetails = async (teacherId: number) => {
    const { data } = await api.get<TeacherDetail>(`/admin/teachers/${teacherId}`);
    setSelectedTeacher(data);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card title="Teachers" subtitle="Search, review, and manage faculty accounts">
          <div className="mb-4">
            <Input label="Search teachers" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {filtered.length ? (
            <DataTable
              data={filtered}
              columns={[
                {
                  header: "Name",
                  render: (teacher) => (
                    <button
                      type="button"
                      className="font-semibold text-brand-700 hover:underline dark:text-brand-300"
                      onClick={() => showTeacherDetails(teacher.id)}
                    >
                      {teacher.user.name}
                    </button>
                  )
                },
                { header: "Email", render: (teacher) => teacher.user.email },
                { header: "Specialization", render: (teacher) => teacher.specialization },
                {
                  header: "Action",
                  render: (teacher) => (
                    <Button
                      type="button"
                      variant="secondary"
                      className="border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
                      onClick={() => removeTeacher(teacher.id)}
                    >
                      Delete
                    </Button>
                  )
                }
              ]}
            />
          ) : (
            <EmptyState title="No teachers found." />
          )}
        </Card>
        <Card title="Add teacher">
          <div className="space-y-3">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <Input label="Specialization" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
            <Button onClick={submit}>Create teacher</Button>
          </div>
        </Card>
      </div>
      {selectedTeacher ? (
        <div className="grid gap-6 xl:grid-cols-3">
          <Card title="Teacher profile" subtitle="Registration and personal details">
            <div className="space-y-3 text-sm">
              <p><span className="font-semibold">Name:</span> {selectedTeacher.user.name}</p>
              <p><span className="font-semibold">Email:</span> {selectedTeacher.user.email}</p>
              <p><span className="font-semibold">Father name:</span> {selectedTeacher.fatherName || "-"}</p>
              <p><span className="font-semibold">Qualification:</span> {selectedTeacher.qualification || "-"}</p>
              <p><span className="font-semibold">Contact number:</span> {selectedTeacher.contactNumber || "-"}</p>
              <p><span className="font-semibold">Registration date:</span> {selectedTeacher.createdAt ? new Date(selectedTeacher.createdAt).toLocaleDateString() : "-"}</p>
              <p><span className="font-semibold">Selected course:</span> {selectedTeacher.selectedCourse?.name || "-"}</p>
              <p><span className="font-semibold">Specialization:</span> {selectedTeacher.specialization || "-"}</p>
            </div>
          </Card>
          <Card title="Teaching assignment" subtitle="Course assignment history">
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="mb-2 font-semibold">Assigned courses</h4>
                {selectedTeacher.assignedCourses?.length ? (
                  <div className="space-y-2">
                    {selectedTeacher.assignedCourses.map((course) => (
                      <div key={course.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                        <p className="font-medium">{course.name}</p>
                        <p className="text-slate-500">{course.description || "No course description"}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No teaching assignments available." />
                )}
              </div>
            </div>
          </Card>
          <Card title="Salary history" subtitle="Teacher payment records">
            {selectedTeacher.salaryPayments?.length ? (
              <div className="space-y-2 text-sm">
                {selectedTeacher.salaryPayments.map((payment) => (
                  <div key={payment.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">Rs {payment.amount}</p>
                      <Badge value={payment.status} />
                    </div>
                    <p className="mt-1 text-slate-500">
                      {payment.createdAt
                        ? new Date(payment.createdAt).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short"
                          })
                        : "Date unavailable"}
                    </p>
                    <p className="mt-1 text-slate-500">{payment.reference || "No salary reference"}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No salary history available." />
            )}
          </Card>
        </div>
      ) : null}
    </div>
  );
};

export const AdminStudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const load = () => api.get("/admin/students").then(({ data }) => setStudents(data));
  useEffect(() => {
    load();
  }, []);
  const { search, setSearch, filtered } = useSearch(students, (item) => `${item.user.name} ${item.user.email}`);

  const submit = async () => {
    await api.post("/admin/students", form);
    setForm({ name: "", email: "", password: "" });
    load();
  };

  const removeStudent = async (studentId: number) => {
    await api.delete(`/admin/students/${studentId}`);
    if (selectedStudent?.id === studentId) {
      setSelectedStudent(null);
    }
    load();
  };

  const showStudentDetails = async (studentId: number) => {
    const { data } = await api.get<StudentDetail>(`/admin/students/${studentId}`);
    setSelectedStudent(data);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card title="Students" subtitle="Manage admissions, attendance, and performance profiles">
          <div className="mb-4">
            <Input label="Search students" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {filtered.length ? (
            <DataTable
              data={filtered}
              columns={[
                {
                  header: "Name",
                  render: (student) => (
                    <button
                      type="button"
                      className="font-semibold text-brand-700 hover:underline dark:text-brand-300"
                      onClick={() => showStudentDetails(student.id)}
                    >
                      {student.user.name}
                    </button>
                  )
                },
                { header: "Email", render: (student) => student.user.email },
                { header: "Attendance", render: (student) => `${student.attendance}%` },
                { header: "Performance", render: (student) => `${student.performance}%` },
                {
                  header: "Action",
                  render: (student) => (
                    <Button
                      type="button"
                      variant="secondary"
                      className="border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
                      onClick={() => removeStudent(student.id)}
                    >
                      Delete
                    </Button>
                  )
                }
              ]}
            />
          ) : (
            <EmptyState title="No students found." />
          )}
        </Card>
        <Card title="Add student">
          <div className="space-y-3">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <Button onClick={submit}>Create student</Button>
          </div>
        </Card>
      </div>
      {selectedStudent ? (
        <div className="grid gap-6 xl:grid-cols-3">
          <Card title="Student profile" subtitle="Registration and personal details">
            <div className="space-y-3 text-sm">
              <p><span className="font-semibold">Name:</span> {selectedStudent.user.name}</p>
              <p><span className="font-semibold">Email:</span> {selectedStudent.user.email}</p>
              <p><span className="font-semibold">Father name:</span> {selectedStudent.fatherName || "-"}</p>
              <p><span className="font-semibold">Mother name:</span> {selectedStudent.motherName || "-"}</p>
              <p><span className="font-semibold">DOB:</span> {selectedStudent.dob || "-"}</p>
              <p><span className="font-semibold">Gender:</span> {selectedStudent.gender || "-"}</p>
              <p><span className="font-semibold">Address:</span> {selectedStudent.address || "-"}</p>
              <p><span className="font-semibold">Contact number:</span> {selectedStudent.contactNumber || "-"}</p>
              <p><span className="font-semibold">Registration date:</span> {selectedStudent.createdAt ? new Date(selectedStudent.createdAt).toLocaleDateString() : "-"}</p>
              <p><span className="font-semibold">Course enrolled:</span> {selectedStudent.primaryCourse?.name || "-"}</p>
            </div>
          </Card>
          <Card title="Admission and payments" subtitle="Enrollment and fee history">
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="mb-2 font-semibold">Admission history</h4>
                {selectedStudent.enrollments?.length ? (
                  <div className="space-y-2">
                    {selectedStudent.enrollments.map((enrollment) => (
                      <div key={enrollment.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                        <p className="font-medium">{enrollment.course?.name || "Course"}</p>
                        <p className="text-slate-500">
                          {enrollment.createdAt ? new Date(enrollment.createdAt).toLocaleDateString() : "Admission date unavailable"}
                        </p>
                        <p className="mt-1 text-slate-500">Fee: Rs {enrollment.fee ?? 0}</p>
                        <p className="text-slate-500">Discount: {enrollment.discount ?? 0}%</p>
                        <p className="font-semibold text-brand-700 dark:text-brand-300">Final amount: Rs {enrollment.finalAmount ?? 0}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No admission history available." />
                )}
              </div>
              <div>
                <h4 className="mb-2 font-semibold">Payment history</h4>
                {selectedStudent.payments?.length ? (
                  <div className="space-y-2">
                    {selectedStudent.payments.map((payment) => (
                      <div key={payment.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium">Rs {payment.amount}</p>
                          <Badge value={payment.status} />
                        </div>
                        <p className="mt-1 text-slate-500">
                          {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : "Date unavailable"}
                        </p>
                        <p className="mt-1 text-slate-500">{payment.reference || "No payment reference"}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No payment history available." />
                )}
              </div>
            </div>
          </Card>
          <Card title="Result and attendance" subtitle="Academic progress history">
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="mb-2 font-semibold">Result history</h4>
                {selectedStudent.results?.length ? (
                  <div className="space-y-2">
                    {selectedStudent.results.map((result) => (
                      <div key={result.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                        <p className="font-medium">{result.quiz?.title || "Quiz"}</p>
                        <p className="text-slate-500">{result.quiz?.course?.name || "-"}</p>
                        <p className="mt-1 font-semibold text-brand-700 dark:text-brand-300">{result.score}%</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No result history available." />
                )}
              </div>
              <div>
                <h4 className="mb-2 font-semibold">Attendance history</h4>
                {selectedStudent.attendanceRecords?.length ? (
                  <div className="space-y-2">
                    {selectedStudent.attendanceRecords.map((record) => (
                      <div key={record.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium">{record.course?.name || "Course"}</p>
                          <Badge value={record.status} />
                        </div>
                        <p className="mt-1 text-slate-500">{record.date}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No attendance history available." />
                )}
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
};

export const AdminCoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [form, setForm] = useState({ name: "", description: "", teacher_id: "" });
  const [enrollment, setEnrollment] = useState({ student_id: "", course_id: "", fee: "", discount: "" });

  const finalAmount = useMemo(() => {
    const fee = Number(enrollment.fee) || 0;
    const discount = Math.min(100, Math.max(0, Number(enrollment.discount) || 0));
    return Math.max(0, fee - (fee * discount) / 100);
  }, [enrollment.discount, enrollment.fee]);

  const load = () => {
    api.get("/admin/courses").then(({ data }) => setCourses(data));
    api.get("/admin/teachers").then(({ data }) => setTeachers(data));
    api.get("/admin/students").then(({ data }) => setStudents(data));
  };

  useEffect(() => {
    load();
  }, []);

  const createCourse = async () => {
    await api.post("/admin/courses", { ...form, teacher_id: form.teacher_id || null });
    setForm({ name: "", description: "", teacher_id: "" });
    setSelectedCourseId("");
    load();
  };

  const editCourse = async () => {
    if (!selectedCourseId) return;
    await api.put(`/admin/courses/${selectedCourseId}`, {
      ...form,
      teacher_id: form.teacher_id || null
    });
    setForm({ name: "", description: "", teacher_id: "" });
    setSelectedCourseId("");
    load();
  };

  const deleteCourse = async () => {
    if (!selectedCourseId) return;
    await api.delete(`/admin/courses/${selectedCourseId}`);
    setForm({ name: "", description: "", teacher_id: "" });
    setSelectedCourseId("");
    load();
  };

  const selectCourseForEdit = (courseId: string) => {
    setSelectedCourseId(courseId);
    const selected = courses.find((course) => String(course.id) === courseId);
    if (!selected) {
      setForm({ name: "", description: "", teacher_id: "" });
      return;
    }

    setForm({
      name: selected.name || "",
      description: selected.description || "",
      teacher_id: selected.teacher_id ? String(selected.teacher_id) : ""
    });
  };

  const assignStudent = async () => {
    await api.post("/admin/enrollments", {
      student_id: enrollment.student_id,
      course_id: enrollment.course_id,
      fee: Number(enrollment.fee) || 0,
      discount: Number(enrollment.discount) || 0,
      finalAmount
    });
    setEnrollment({ student_id: "", course_id: "", fee: "", discount: "" });
  };

  return (
    <div className="space-y-6">
      <Card title="Courses" subtitle="Create courses and assign teachers">
        {courses.length ? (
          <DataTable
            data={courses}
            columns={[
              { header: "Course", render: (course) => course.name },
              { header: "Description", render: (course) => course.description || "-" },
              { header: "Teacher", render: (course) => course.teacher?.user?.name || "Unassigned" }
            ]}
          />
        ) : (
          <EmptyState title="No courses created yet." />
        )}
      </Card>
        <div className="grid gap-6 xl:grid-cols-2">
          <Card title="Create course">
            <div className="space-y-3">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Select course</span>
                <select className="input" value={selectedCourseId} onChange={(e) => selectCourseForEdit(e.target.value)}>
                  <option value="">New course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </label>
              <Input label="Course name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Assign teacher</span>
              <select className="input" value={form.teacher_id} onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}>
                <option value="">Select teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.user.name}
                  </option>
                  ))}
                </select>
              </label>
              <div className="flex flex-wrap gap-3">
                <Button onClick={createCourse}>Save course</Button>
                <Button type="button" variant="secondary" onClick={deleteCourse} disabled={!selectedCourseId}>
                  Delete
                </Button>
                <Button type="button" variant="secondary" onClick={editCourse} disabled={!selectedCourseId}>
                  Edit
                </Button>
              </div>
            </div>
          </Card>
        <Card title="Enroll student">
          <div className="space-y-3">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Student</span>
              <select className="input" value={enrollment.student_id} onChange={(e) => setEnrollment({ ...enrollment, student_id: e.target.value })}>
                <option value="">Select student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.user.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Course</span>
              <select className="input" value={enrollment.course_id} onChange={(e) => setEnrollment({ ...enrollment, course_id: e.target.value })}>
                <option value="">Select course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </label>
            <Input
              label="Fee"
              type="number"
              value={enrollment.fee}
              onChange={(e) => setEnrollment({ ...enrollment, fee: e.target.value })}
            />
            <Input
              label="Discount (%)"
              type="number"
              value={enrollment.discount}
              onChange={(e) => setEnrollment({ ...enrollment, discount: e.target.value })}
            />
            <Input label="Final amount" type="number" value={String(finalAmount)} readOnly />
            <Button onClick={assignStudent}>Assign enrollment</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export const AdminReportsPage = () => {
  const [report, setReport] = useState<{ attendance: any[]; results: any[] }>({ attendance: [], results: [] });

  useEffect(() => {
    api.get("/admin/reports").then(({ data }) => setReport(data));
  }, []);

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card title="Attendance reports">
        {report.attendance.length ? (
          <DataTable
            data={report.attendance}
            columns={[
              { header: "Date", render: (row) => row.date },
              { header: "Student ID", render: (row) => row.student_id },
              { header: "Course ID", render: (row) => row.course_id },
              { header: "Status", render: (row) => <Badge value={row.status} /> }
            ]}
          />
        ) : (
          <EmptyState title="No attendance records yet." />
        )}
      </Card>
      <Card title="Performance reports">
        {report.results.length ? (
          <DataTable
            data={report.results}
            columns={[
              { header: "Student ID", render: (row) => row.student_id },
              { header: "Quiz ID", render: (row) => row.quiz_id },
              { header: "Score", render: (row) => `${row.score}%` }
            ]}
          />
        ) : (
          <EmptyState title="No result records yet." />
        )}
      </Card>
    </div>
  );
};

export const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [teacherPayments, setTeacherPayments] = useState<TeacherPayment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [form, setForm] = useState({ student_id: "", amount: "", status: "pending", reference: "" });
  const [teacherForm, setTeacherForm] = useState({ teacher_id: "", amount: "", status: "pending", reference: "" });

  const load = () => {
    api.get("/admin/payments").then(({ data }) => {
      setPayments(data.studentPayments || []);
      setTeacherPayments(data.teacherPayments || []);
    });
    api.get("/admin/students").then(({ data }) => setStudents(data));
    api.get("/admin/teachers").then(({ data }) => setTeachers(data));
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    await api.post("/admin/payments", {
      student_id: form.student_id,
      amount: Number(form.amount),
      status: form.status,
      reference: form.reference
    });
    setForm({ student_id: "", amount: "", status: "pending", reference: "" });
    load();
  };

  const submitTeacherPayment = async () => {
    await api.post("/admin/teacher-payments", {
      teacher_id: teacherForm.teacher_id,
      amount: Number(teacherForm.amount),
      status: teacherForm.status,
      reference: teacherForm.reference
    });
    setTeacherForm({ teacher_id: "", amount: "", status: "pending", reference: "" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card title="Student fee payments">
          {payments.length ? (
            <DataTable
              data={payments}
              columns={[
                { header: "Student", render: (payment) => payment.student?.user?.name || "-" },
                { header: "Amount", render: (payment) => `Rs ${payment.amount}` },
                { header: "Status", render: (payment) => <Badge value={payment.status} /> },
                { header: "Reference", render: (payment) => payment.reference || "Razorpay-ready" },
                {
                  header: "Date & Time",
                  render: (payment) =>
                    payment.createdAt
                      ? new Date(payment.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short"
                        })
                      : "-"
                }
              ]}
            />
          ) : (
            <EmptyState title="No student payment entries yet." />
          )}
        </Card>
        <Card title="Record student payment">
          <div className="space-y-3">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Student</span>
              <select className="input" value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })}>
                <option value="">Select student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.user.name}
                  </option>
                ))}
              </select>
            </label>
            <Input label="Amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            <Input label="Reference" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Status</span>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
              </select>
            </label>
            <Button onClick={submit}>Save payment</Button>
            <p className="text-xs text-slate-500">Razorpay integration can use the stored `reference` field to persist payment IDs.</p>
          </div>
        </Card>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card title="Teacher salary payments">
          {teacherPayments.length ? (
            <DataTable
              data={teacherPayments}
              columns={[
                { header: "Teacher", render: (payment) => payment.teacher?.user?.name || "-" },
                { header: "Amount", render: (payment) => `Rs ${payment.amount}` },
                { header: "Status", render: (payment) => <Badge value={payment.status} /> },
                { header: "Reference", render: (payment) => payment.reference || "Salary payout" },
                {
                  header: "Date & Time",
                  render: (payment) =>
                    payment.createdAt
                      ? new Date(payment.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short"
                        })
                      : "-"
                }
              ]}
            />
          ) : (
            <EmptyState title="No teacher salary entries yet." />
          )}
        </Card>
        <Card title="Record teacher salary">
          <div className="space-y-3">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Teacher</span>
              <select className="input" value={teacherForm.teacher_id} onChange={(e) => setTeacherForm({ ...teacherForm, teacher_id: e.target.value })}>
                <option value="">Select teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.user.name}
                  </option>
                ))}
              </select>
            </label>
            <Input label="Salary amount" type="number" value={teacherForm.amount} onChange={(e) => setTeacherForm({ ...teacherForm, amount: e.target.value })} />
            <Input label="Reference" value={teacherForm.reference} onChange={(e) => setTeacherForm({ ...teacherForm, reference: e.target.value })} />
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Status</span>
              <select className="input" value={teacherForm.status} onChange={(e) => setTeacherForm({ ...teacherForm, status: e.target.value })}>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
              </select>
            </label>
            <Button onClick={submitTeacherPayment}>Save salary</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export const AdminNotificationsPage = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [form, setForm] = useState({ title: "", message: "", audience: "all" });

  const load = () => api.get("/admin/notifications").then(({ data }) => setNotifications(data));
  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    await api.post("/admin/notifications", form);
    setForm({ title: "", message: "", audience: "all" });
    load();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card title="Notifications">
        {notifications.length ? (
          <div className="space-y-3">
            {notifications.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-semibold">{item.title}</h4>
                  <Badge value={item.audience} />
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No notifications sent yet." />
        )}
      </Card>
      <Card title="Send notification">
        <div className="space-y-3">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Audience</span>
            <select className="input" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
              <option value="all">All</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
          </label>
          <Button onClick={submit}>Publish notification</Button>
        </div>
      </Card>
    </div>
  );
};

export const AdminHistoryPage = () => {
  const [history, setHistory] = useState<ActivityLogItem[]>([]);

  useEffect(() => {
    api.get("/admin/history").then(({ data }) => setHistory(data));
  }, []);

  return (
    <Card
      title="History"
      subtitle="Registration and deletion timeline for students and teachers"
    >
      {history.length ? (
        <div className="space-y-3">
          {history.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h4 className="font-semibold capitalize">
                    {item.entityType} {item.action}: {item.entityName}
                  </h4>
                  <p className="text-sm text-slate-500">{item.entityEmail}</p>
                </div>
                <Badge value={item.action} />
              </div>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
              <p className="mt-2 text-xs text-slate-500">
                By {item.performedBy} ({item.performedByRole}) on{" "}
                {new Date(item.createdAt).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short"
                })}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No history entries yet." />
      )}
    </Card>
  );
};
