import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/client";
import { Badge } from "../../components/shared/Badge";
import { Button } from "../../components/shared/Button";
import { Card } from "../../components/shared/Card";
import { DataTable } from "../../components/shared/DataTable";
import { EmptyState } from "../../components/shared/EmptyState";
import { Input } from "../../components/shared/Input";
import { Course, TeacherResultSheet } from "../../types";

const normalizeResultEntries = (entries: TeacherResultSheet["entries"] | string | null | undefined) => {
  if (Array.isArray(entries)) {
    return entries;
  }

  if (typeof entries === "string") {
    try {
      const parsed = JSON.parse(entries);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
};

export const TeacherDashboardPage = () => {
  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    api.get("/teacher/dashboard").then(({ data }) => setDashboard(data));
  }, []);

  if (!dashboard) {
    return <Card title="Loading dashboard">Preparing teacher workspace...</Card>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card title="Assigned courses">{dashboard.totals.courses}</Card>
      <Card title="Students across courses">{dashboard.totals.students}</Card>
      <Card title="Quizzes created">{dashboard.totals.quizzes}</Card>
    </div>
  );
};

export const TeacherCoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [materialType, setMaterialType] = useState<"file" | "video">("video");
  const [form, setForm] = useState({ course_id: "", title: "", videoUrl: "" });
  const [file, setFile] = useState<File | null>(null);

  const load = () => api.get("/teacher/courses").then(({ data }) => setCourses(data));
  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    const payload = new FormData();
    payload.append("course_id", form.course_id);
    payload.append("title", form.title);
    payload.append("type", materialType);
    if (materialType === "video") payload.append("videoUrl", form.videoUrl);
    if (file) payload.append("file", file);
    await api.post("/teacher/materials", payload);
    setForm({ course_id: "", title: "", videoUrl: "" });
    setFile(null);
    load();
  };

  const removeMaterial = async (materialId: number) => {
    await api.delete(`/teacher/materials/${materialId}`);
    load();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card title="Assigned courses">
        {courses.length ? (
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-semibold">{course.name}</h4>
                    <p className="text-sm text-slate-500">{course.description}</p>
                  </div>
                  <Badge value={`${course.students?.length || 0} students`} />
                </div>
                <div className="mt-4 space-y-2">
                  {course.materials?.length ? course.materials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800"
                    >
                      <div className="min-w-0 text-slate-600 dark:text-slate-300">
                        <p className="font-medium text-slate-900 dark:text-slate-100">{material.title}</p>
                        <p className="truncate">{material.type === "video" ? material.videoUrl : material.filePath}</p>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        className="border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
                        onClick={() => removeMaterial(material.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  )) : <p className="text-sm text-slate-500">No materials uploaded yet.</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No assigned courses yet." />
        )}
      </Card>
      <Card title="Upload material">
        <div className="space-y-3">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Course</span>
            <select className="input" value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}>
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </label>
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Type</span>
            <select className="input" value={materialType} onChange={(e) => setMaterialType(e.target.value as "file" | "video")}>
              <option value="video">Video link</option>
              <option value="file">PDF or document</option>
            </select>
          </label>
          {materialType === "video" ? (
            <Input label="Video URL" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} />
          ) : (
            <input type="file" className="input pt-2" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          )}
          <Button onClick={submit}>Upload material</Button>
        </div>
      </Card>
    </div>
  );
};

export const TeacherAttendancePage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState({ course_id: "", date: "" });
  const [attendanceMap, setAttendanceMap] = useState<Record<number, "present" | "absent">>({});
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    api.get("/teacher/courses").then(({ data }) => setCourses(data));
  }, []);

  useEffect(() => {
    if (!showHistory) return;

    setHistoryLoading(true);
    api
      .get("/teacher/attendance/history")
      .then(({ data }) => setHistory(data))
      .finally(() => setHistoryLoading(false));
  }, [showHistory]);

  const selectedCourse = useMemo(
    () => courses.find((course) => String(course.id) === form.course_id) || null,
    [courses, form.course_id]
  );

  const students = selectedCourse?.students || [];

  useEffect(() => {
    if (!students.length) {
      setAttendanceMap({});
      return;
    }

    setAttendanceMap(
      Object.fromEntries(students.map((student) => [student.id, "present"]))
    );
  }, [students]);

  const submit = async () => {
    if (!form.course_id || !form.date || !students.length) return;

    setSaving(true);
    try {
      await Promise.all(
        students.map((student) =>
          api.post("/teacher/attendance", {
            student_id: student.id,
            course_id: Number(form.course_id),
            date: form.date,
            status: attendanceMap[student.id] || "present"
          })
        )
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title="Take attendance" subtitle="Mark course-wise daily attendance">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Course</span>
          <select className="input" value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}>
            <option value="">Select course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </select>
        </label>
        <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
      </div>
      {form.course_id && form.date ? (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-lg font-semibold">
              {selectedCourse?.name || "Course"} student list
            </h4>
            <p className="text-sm text-slate-500">{students.length} students</p>
          </div>
          {students.length ? (
            <div className="space-y-3">
              {students.map((student) => {
                const status = attendanceMap[student.id] || "present";
                return (
                  <div
                    key={student.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{student.user.name}</p>
                      <p className="text-sm text-slate-500">{student.user.email}</p>
                    </div>
                    <div className="inline-flex rounded-full border border-slate-200 p-1 dark:border-slate-700">
                      <button
                        type="button"
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                          status === "present"
                            ? "bg-emerald-600 text-white"
                            : "text-slate-600 dark:text-slate-300"
                        }`}
                        onClick={() =>
                          setAttendanceMap((current) => ({ ...current, [student.id]: "present" }))
                        }
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                          status === "absent"
                            ? "bg-rose-600 text-white"
                            : "text-slate-600 dark:text-slate-300"
                        }`}
                        onClick={() =>
                          setAttendanceMap((current) => ({ ...current, [student.id]: "absent" }))
                        }
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState title="No students are enrolled in this course yet." />
          )}
        </div>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={submit} disabled={!form.course_id || !form.date || !students.length || saving}>
          {saving ? "Saving attendance..." : "Save attendance"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => setShowHistory((current) => !current)}>
          {showHistory ? "Hide history" : "History"}
        </Button>
      </div>
      {showHistory ? (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-lg font-semibold">Attendance history</h4>
            <p className="text-sm text-slate-500">{history.length} records</p>
          </div>
          {historyLoading ? (
            <p className="text-sm text-slate-500">Loading attendance history...</p>
          ) : history.length ? (
            <div className="space-y-3">
              {history.map((record) => (
                <div
                  key={record.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {record.student?.user?.name || "Student"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {record.course?.name || "Course"} | {record.date}
                    </p>
                  </div>
                  <Badge value={record.status} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No attendance history available yet." />
          )}
        </div>
      ) : null}
    </Card>
  );
};

export const TeacherQuizzesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState({
    course_id: "",
    title: "",
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: ""
  });

  useEffect(() => {
    api.get("/teacher/courses").then(({ data }) => setCourses(data));
  }, []);

  const submit = async () => {
    await api.post("/teacher/quizzes", {
      course_id: Number(form.course_id),
      title: form.title,
      questions: [
        {
          question: form.question,
          options: [form.optionA, form.optionB, form.optionC, form.optionD],
          correctAnswer: form.correctAnswer
        }
      ]
    });
    setForm({
      course_id: "",
      title: "",
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: ""
    });
  };

  return (
    <Card title="Create quiz" subtitle="Build MCQ-based assessments">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Course</span>
          <select className="input" value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}>
            <option value="">Select course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </select>
        </label>
        <Input label="Quiz title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <div className="mt-4 grid gap-4">
        <Input label="Question" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Option A" value={form.optionA} onChange={(e) => setForm({ ...form, optionA: e.target.value })} />
          <Input label="Option B" value={form.optionB} onChange={(e) => setForm({ ...form, optionB: e.target.value })} />
          <Input label="Option C" value={form.optionC} onChange={(e) => setForm({ ...form, optionC: e.target.value })} />
          <Input label="Option D" value={form.optionD} onChange={(e) => setForm({ ...form, optionD: e.target.value })} />
        </div>
        <Input label="Correct answer" value={form.correctAnswer} onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })} />
      </div>
      <div className="mt-4">
        <Button onClick={submit}>Publish quiz</Button>
      </div>
    </Card>
  );
};

export const TeacherResultsPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [resultSheets, setResultSheets] = useState<TeacherResultSheet[]>([]);
  const [expandedResultId, setExpandedResultId] = useState<number | null>(null);
  const [resultForm, setResultForm] = useState({
    course_id: "",
    student_id: "",
    title: ""
  });
  const [resultRows, setResultRows] = useState(
    Array.from({ length: 7 }, () => ({ subject: "", totalMarks: "", obtainedMarks: "" }))
  );

  useEffect(() => {
    api.get("/teacher/courses").then(({ data }) => setCourses(data));
    api.get("/teacher/result-sheets").then(({ data }) => setResultSheets(data));
  }, []);

  const resultStudents = useMemo(
    () => courses.find((course) => String(course.id) === resultForm.course_id)?.students || [],
    [courses, resultForm.course_id]
  );

  const totalMarksSum = useMemo(
    () => resultRows.reduce((sum, row) => sum + (Number(row.totalMarks) || 0), 0),
    [resultRows]
  );

  const obtainedMarksSum = useMemo(
    () => resultRows.reduce((sum, row) => sum + (Number(row.obtainedMarks) || 0), 0),
    [resultRows]
  );

  const updateResultRow = (index: number, field: "subject" | "totalMarks" | "obtainedMarks", value: string) => {
    setResultRows((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row))
    );
  };

  const submitResultSheet = async () => {
    const rows = resultRows.map((row) => ({
      subject: row.subject,
      totalMarks: Number(row.totalMarks) || 0,
      obtainedMarks: Number(row.obtainedMarks) || 0
    }));

    const { data } = await api.post<TeacherResultSheet>("/teacher/result-sheets", {
      course_id: Number(resultForm.course_id),
      student_id: Number(resultForm.student_id),
      title: resultForm.title,
      rows
    });

    setResultSheets((current) => [data, ...current]);
    setResultForm({ course_id: "", student_id: "", title: "" });
    setResultRows(Array.from({ length: 7 }, () => ({ subject: "", totalMarks: "", obtainedMarks: "" })));
  };

  return (
    <div className="space-y-6">
      <Card title="Result" subtitle="Enter subject-wise marks for 7 rows and save totals automatically">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Course</span>
            <select
              className="input"
              value={resultForm.course_id}
              onChange={(e) => setResultForm({ ...resultForm, course_id: e.target.value, student_id: "" })}
            >
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Student</span>
            <select
              className="input"
              value={resultForm.student_id}
              onChange={(e) => setResultForm({ ...resultForm, student_id: e.target.value })}
            >
              <option value="">Select student</option>
              {resultStudents.map((student) => (
                <option key={student.id} value={student.id}>{student.user.name}</option>
              ))}
            </select>
          </label>
          <Input label="Result title" value={resultForm.title} onChange={(e) => setResultForm({ ...resultForm, title: e.target.value })} />
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-3">
            <thead>
              <tr className="text-left text-sm text-slate-500">
                <th className="px-2">Subject</th>
                <th className="px-2">Total marks</th>
                <th className="px-2">Obtained marks</th>
              </tr>
            </thead>
            <tbody>
              {resultRows.map((row, index) => (
                <tr key={index}>
                  <td className="px-2">
                    <input
                      className="input"
                      value={row.subject}
                      onChange={(e) => updateResultRow(index, "subject", e.target.value)}
                    />
                  </td>
                  <td className="px-2">
                    <input
                      className="input"
                      type="number"
                      value={row.totalMarks}
                      onChange={(e) => updateResultRow(index, "totalMarks", e.target.value)}
                    />
                  </td>
                  <td className="px-2">
                    <input
                      className="input"
                      type="number"
                      value={row.obtainedMarks}
                      onChange={(e) => updateResultRow(index, "obtainedMarks", e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input label="Total Marks" type="number" value={String(totalMarksSum)} readOnly />
          <Input label="Obtained Marks" type="number" value={String(obtainedMarksSum)} readOnly />
        </div>

        <div className="mt-4">
          <Button onClick={submitResultSheet} disabled={!resultForm.course_id || !resultForm.student_id || !resultForm.title}>
            Save result
          </Button>
        </div>
      </Card>

      <Card title="Saved results" subtitle="Recently stored result sheets">
        {resultSheets.length ? (
          <div className="space-y-3">
            {resultSheets.map((sheet) => (
              <button
                key={sheet.id}
                type="button"
                onClick={() => setExpandedResultId((current) => (current === sheet.id ? null : sheet.id))}
                className="w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:border-brand-300 dark:border-slate-800 dark:hover:border-brand-700"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h4 className="font-semibold">{sheet.title}</h4>
                    <p className="text-sm text-slate-500">
                      {sheet.course?.name || "Course"} | {sheet.student?.user?.name || "Student"}
                    </p>
                  </div>
                  <div className="text-sm font-medium text-brand-700 dark:text-brand-300">
                    {sheet.obtainedMarks} / {sheet.totalMarks}
                  </div>
                </div>
                {expandedResultId === sheet.id ? (
                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-y-2">
                      <thead>
                        <tr className="text-left text-sm text-slate-500">
                          <th className="pr-4">Subject</th>
                          <th className="pr-4">Total marks</th>
                          <th>Obtained marks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {normalizeResultEntries(sheet.entries).map((entry, index) => (
                          <tr key={`${sheet.id}-${index}`} className="text-sm text-slate-700 dark:text-slate-200">
                            <td className="pr-4">{entry.subject || "-"}</td>
                            <td className="pr-4">{entry.totalMarks}</td>
                            <td>{entry.obtainedMarks}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </button>
            ))}
          </div>
        ) : (
          <EmptyState title="No saved results yet." />
        )}
      </Card>
    </div>
  );
};

export const TeacherStudentsPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    api.get("/teacher/courses").then(({ data }) => setCourses(data));
  }, []);

  const rows = courses.flatMap((course) =>
    (course.students || []).map((student) => ({
      course: course.name,
      name: student.user.name,
      email: student.user.email,
      attendance: student.attendance,
      performance: student.performance
    }))
  );

  return (
    <Card title="Students by course">
      {rows.length ? (
        <DataTable
          data={rows}
          columns={[
            { header: "Course", render: (row) => row.course },
            { header: "Student", render: (row) => row.name },
            { header: "Email", render: (row) => row.email },
            { header: "Attendance", render: (row) => `${row.attendance}%` },
            { header: "Performance", render: (row) => `${row.performance}%` }
          ]}
        />
      ) : (
        <EmptyState title="No enrolled students yet." />
      )}
    </Card>
  );
};
