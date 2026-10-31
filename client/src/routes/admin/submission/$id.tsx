import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { getAdminSessionQueryOptions, useGetAdminSession } from "#/data/admin/session.data";
import Button from "#/components/button";
import Markdown, { CodeBlock } from "#/components/markdown";
import { sessionResult, submissionResult, submissionResultColor } from "#/lib/submissionResult";
import styles from "./submissionDetail.module.css";

export const Route = createFileRoute("/admin/submission/$id")({
  component: RouteComponent,
  staticData: { pageTitle: "Session Detail", pageKey: "submissions-list" },
  loader: async ({ params, context }) => {
    const session = await context.queryClient.query(getAdminSessionQueryOptions(params.id));
    return session;
  },
});

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function RouteComponent() {
  const { id } = Route.useParams();
  const initialData = Route.useLoaderData();
  const { data: session = initialData } = useGetAdminSession(id);

  const result = sessionResult(session);
  const { submissions } = session;

  const [selectedID, setSelectedID] = React.useState<string>();
  const [contentExpanded, setContentExpanded] = React.useState(false);

  const selected = submissions.find((submission) => submission.id === selectedID) ?? submissions[0];
  const selectedResult = selected
    ? submissionResult({ ...selected, session: { status: session.status } })
    : undefined;

  const selectSubmission = (submissionID: string) => {
    setSelectedID(submissionID);
    setContentExpanded(false);
  };

  return (
    <div className={styles.page}>
      <section className={styles.meta}>
        <h2 className={styles.title}>Lesson Session</h2>
        <Field label="ID" value={session.id} />
        <Field label="User" value={`${session.user.name} (${session.user.email})`} />
        <Field
          label="Status"
          value={
            <span className={styles.result} style={{ color: submissionResultColor[result] }}>
              {session.status} ({result})
            </span>
          }
        />
        <Field label="Rewarded" value={session.rewarded ? "Yes" : "No"} />
        <Field label="Lesson" value={session.lesson.name} />
        <Field
          label="Curriculum"
          value={`${session.lesson.unit.course.name} / ${session.lesson.unit.name}`}
        />
        <Field label="Started" value={new Date(session.createdAt).toLocaleString()} />
        <Field label="Updated" value={new Date(session.updatedAt).toLocaleString()} />
      </section>

      <div className={styles.layout}>
        <aside className={styles.submissions}>
          <h2 className={styles.submissionsTitle}>Submissions ({submissions.length})</h2>
          {submissions.length === 0 ? (
            <p>No submissions in this session.</p>
          ) : (
            submissions.map((submission) => {
              const submissionResultValue = submissionResult({
                ...submission,
                session: { status: session.status },
              });
              const isSelected = submission.id === selected?.id;

              return (
                <button
                  key={submission.id}
                  type="button"
                  onClick={() => selectSubmission(submission.id)}
                  className={
                    isSelected
                      ? `${styles.submission} ${styles.submissionSelected}`
                      : styles.submission
                  }
                >
                  <span className={styles.submissionName}>{submission.exercise.name}</span>
                  <span
                    className={styles.submissionResult}
                    style={{ color: submissionResultColor[submissionResultValue] }}
                  >
                    {submissionResultValue}
                  </span>
                </button>
              );
            })
          )}
        </aside>

        <section className={styles.detail}>
          {selected ? (
            <>
              <header className={styles.detailHeader}>
                <h2 className={styles.title}>{selected.exercise.name}</h2>
                {selectedResult && (
                  <span
                    className={styles.result}
                    style={{ color: submissionResultColor[selectedResult] }}
                  >
                    {selectedResult}
                  </span>
                )}
              </header>

              <div className={styles.subsection}>
                <div className={styles.subsectionHeader}>
                  <h3 className={styles.subsectionTitle}>Exercise Content</h3>
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={() => setContentExpanded((expanded) => !expanded)}
                  >
                    {contentExpanded ? "Hide content" : "Show content"}
                  </Button>
                </div>
                {contentExpanded && <Markdown content={selected.exercise.content} />}
              </div>

              {selected.exercise.codeExercise && (
                <div className={styles.subsection}>
                  <h3 className={styles.subsectionTitle}>
                    Submitted Code ({selected.exercise.codeExercise.language ?? "text"})
                  </h3>

                  <CodeBlock
                    code={selected.content.code}
                    language={selected.exercise.codeExercise.language}
                  />
                </div>
              )}
            </>
          ) : (
            <p>Select a submission to see its content.</p>
          )}
        </section>
      </div>
    </div>
  );
}
