import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { Badge } from "../../components/shared/Badge";
import { Button } from "../../components/shared/Button";
import { Card } from "../../components/shared/Card";
import { DataTable } from "../../components/shared/DataTable";
import { EmptyState } from "../../components/shared/EmptyState";
import { Course, Payment, Quiz, TeacherResultSheet } from "../../types";

const getBackendBaseUrl = () =>
  (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

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

const getPercentage = (obtainedMarks: number, totalMarks: number) => {
  if (!totalMarks) {
    return "0.00";
  }

  return ((Number(obtainedMarks) / Number(totalMarks)) * 100).toFixed(2);
};

export const StudentDashboardPage = () => {
  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    api.get("/student/dashboard").then(({ data }) => setDashboard(data));
  }, []);

  if (!dashboard) {
    return <Card title="Loading dashboard">Preparing student workspace...</Card>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card title="Enrolled courses">{dashboard.student.courses.length}</Card>
        <Card title="Attendance">{dashboard.analytics.attendance}%</Card>
        <Card title="Performance">{dashboard.analytics.performance}%</Card>
      </div>
      <Card title="Recent notifications">
        {dashboard.notifications.length ? (
          <div className="space-y-3">
            {dashboard.notifications.map((item: any) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{item.title}</h4>
                  <Badge value={item.audience} />
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No notifications yet." />
        )}
      </Card>
    </div>
  );
};

export const StudentCoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState("");

  useEffect(() => {
    api.get("/student/courses").then(({ data }) => setCourses(data));
    api.get("/student/quizzes").then(({ data }) => setQuizzes(data));
  }, []);

  const submitQuiz = async () => {
    if (!selectedQuiz) return;
    const { data } = await api.post("/student/quizzes/submit", { quiz_id: selectedQuiz.id, answers });
    setResult(`Score: ${data.score}%`);
  };

  const resolveMaterialUrl = (path?: string | null) => {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    return `${getBackendBaseUrl()}${path}`;
  };

  return (
    <div className="space-y-6">
      <Card title="Enrolled courses">
        {courses.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {courses.map((course) => (
              <div key={course.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <h4 className="font-semibold">{course.name}</h4>
                <p className="mt-2 text-sm text-slate-500">{course.description}</p>
                <div className="mt-4 space-y-2">
                  {course.materials?.length ? course.materials.map((material) => (
                    <div key={material.id} className="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800">
                      <p className="font-medium text-slate-900 dark:text-slate-100">{material.title}</p>
                      {material.type === "video" ? (
                        material.videoUrl ? (
                          <a
                            href={resolveMaterialUrl(material.videoUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex text-brand-700 hover:underline dark:text-brand-300"
                          >
                            Open video link
                          </a>
                        ) : (
                          <p className="mt-2 text-slate-500">Video link unavailable.</p>
                        )
                      ) : material.filePath ? (
                        <a
                          href={resolveMaterialUrl(material.filePath)}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex text-brand-700 hover:underline dark:text-brand-300"
                        >
                          Open file
                        </a>
                      ) : (
                        <p className="mt-2 text-slate-500">File unavailable.</p>
                      )}
                    </div>
                  )) : <p className="text-sm text-slate-500">No materials yet.</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="You are not enrolled in any course yet." />
        )}
      </Card>
      <Card title="Attempt quiz">
        <div className="mb-4">
          <select
            className="input"
            value={selectedQuiz?.id || ""}
            onChange={(e) => setSelectedQuiz(quizzes.find((quiz) => quiz.id === Number(e.target.value)) || null)}
          >
            <option value="">Select quiz</option>
            {quizzes.map((quiz) => (
              <option key={quiz.id} value={quiz.id}>{quiz.title}</option>
            ))}
          </select>
        </div>
        {selectedQuiz ? (
          <div className="space-y-4">
            {selectedQuiz.questions.map((question, index) => (
              <div key={question.id || index} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <p className="font-medium">{question.question}</p>
                <div className="mt-3 grid gap-2">
                  {question.options.map((option) => (
                    <label key={option} className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        onChange={() => setAnswers((current) => ({ ...current, [question.id || index]: option }))}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <Button onClick={submitQuiz}>Submit quiz</Button>
            {result ? <p className="text-sm font-medium text-brand-700 dark:text-brand-300">{result}</p> : null}
          </div>
        ) : (
          <EmptyState title="Select a quiz to begin." />
        )}
      </Card>
    </div>
  );
};

export const StudentAttendancePage = () => {
  const [attendance, setAttendance] = useState<any[]>([]);

  useEffect(() => {
    api.get("/student/attendance").then(({ data }) => setAttendance(data));
  }, []);

  return (
    <Card title="Attendance tracking">
      {attendance.length ? (
        <DataTable
          data={attendance}
          columns={[
            { header: "Date", render: (row) => row.date },
            { header: "Course", render: (row) => row.course?.name || "-" },
            { header: "Status", render: (row) => <Badge value={row.status} /> }
          ]}
        />
      ) : (
        <EmptyState title="No attendance records available." />
      )}
    </Card>
  );
};

export const StudentResultsPage = () => {
  const [results, setResults] = useState<{ quizResults: any[]; resultSheets: TeacherResultSheet[] }>({
    quizResults: [],
    resultSheets: []
  });

  useEffect(() => {
    api.get("/student/results").then(({ data }) => setResults(data));
  }, []);

  return (
    <div className="space-y-6">
      <Card title="Teacher uploaded results">
        {results.resultSheets.length ? (
          <div className="space-y-4">
            {results.resultSheets.map((sheet) => (
              <div key={sheet.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h4 className="font-semibold">{sheet.title}</h4>
                    <p className="text-sm text-slate-500">{sheet.course?.name || "-"}</p>
                  </div>
                  <div className="text-right text-sm font-medium text-brand-700 dark:text-brand-300">
                    <p>{sheet.obtainedMarks} / {sheet.totalMarks}</p>
                    <p>{getPercentage(sheet.obtainedMarks, sheet.totalMarks)}%</p>
                  </div>
                </div>
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
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No teacher-uploaded results yet." />
        )}
      </Card>
      <Card title="Quiz performance analytics">
        {results.quizResults.length ? (
          <DataTable
            data={results.quizResults}
            columns={[
              { header: "Quiz", render: (row) => row.quiz?.title || "-" },
              { header: "Score", render: (row) => `${row.score}%` }
            ]}
          />
        ) : (
          <EmptyState title="No quiz results yet." />
        )}
      </Card>
    </div>
  );
};

export const StudentPaymentsPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    api.get("/student/payments").then(({ data }) => setPayments(data));
  }, []);

  return (
    <Card title="Fee status and payment history">
      {payments.length ? (
        <DataTable
          data={payments}
          columns={[
            { header: "Amount", render: (row) => `Rs ${row.amount}` },
            { header: "Status", render: (row) => <Badge value={row.status} /> },
            { header: "Reference", render: (row) => row.reference || "Pending Razorpay capture" }
          ]}
        />
      ) : (
        <EmptyState title="No payments recorded yet." />
      )}
    </Card>
  );
};
