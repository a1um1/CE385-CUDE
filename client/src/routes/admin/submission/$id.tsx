import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  getAdminSessionQueryOptions,
  useGetAdminSession,
} from "#/data/admin/session.data";
import Button from "#/components/button";
import Markdown from "#/components/markdown";
import {
  sessionResult,
  submissionResult,
  submissionResultColor,
} from "#/lib/submissionResult";

export const Route = createFileRoute("/admin/submission/$id")({
  component: RouteComponent,
  staticData: { pageTitle: "Session Detail", pageKey: "submissions-list" },
  loader: async ({ params, context }) => {
    const session = await context.queryClient.query(
      getAdminSessionQueryOptions(params.id),
    );
    return session;
  },
});

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <span style={{ fontWeight: 600, minWidth: "7rem" }}>{label}</span>
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

  const selected =
    submissions.find((submission) => submission.id === selectedID) ??
    submissions[0];
  const selectedResult = selected
    ? submissionResult({ ...selected, session: { status: session.status } })
    : undefined;

  const selectSubmission = (submissionID: string) => {
    setSelectedID(submissionID);
    setContentExpanded(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <section
        style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
      >
        <h2 style={{ fontWeight: 700 }}>Lesson Session</h2>
        <Field label="ID" value={session.id} />
        <Field
          label="User"
          value={`${session.user.name} (${session.user.email})`}
        />
        <Field
          label="Status"
          value={
            <span
              style={{ color: submissionResultColor[result], fontWeight: 600 }}
            >
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
        <Field
          label="Started"
          value={new Date(session.createdAt).toLocaleString()}
        />
        <Field
          label="Updated"
          value={new Date(session.updatedAt).toLocaleString()}
        />
      </section>

      <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
        <aside
          style={{
            width: "20rem",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <h2 style={{ fontWeight: 700 }}>
            Submissions ({submissions.length})
          </h2>
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
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: "1rem",
                    width: "100%",
                    textAlign: "left",
                    padding: "0.75rem",
                    cursor: "pointer",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--color-border)",
                    borderLeft: isSelected
                      ? "4px solid var(--color-primary)"
                      : "1px solid var(--color-border)",
                    background: isSelected
                      ? "var(--color-surface)"
                      : "transparent",
                    color: "inherit",
                    font: "inherit",
                  }}
                >
                  <span style={{ fontWeight: 600 }}>
                    {submission.exercise.name}
                  </span>
                  <span
                    style={{
                      color: submissionResultColor[submissionResultValue],
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {submissionResultValue}
                  </span>
                </button>
              );
            })
          )}
        </aside>

        <section
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {selected ? (
            <>
              <header
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: "1rem",
                }}
              >
                <h2 style={{ fontWeight: 700 }}>{selected.exercise.name}</h2>
                {selectedResult && (
                  <span
                    style={{
                      color: submissionResultColor[selectedResult],
                      fontWeight: 600,
                    }}
                  >
                    {selectedResult}
                  </span>
                )}
              </header>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <h3 style={{ fontWeight: 600 }}>Exercise Content</h3>
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={() => setContentExpanded((expanded) => !expanded)}
                  >
                    {contentExpanded ? "Hide content" : "Show content"}
                  </Button>
                </div>
                {contentExpanded && (
                  <Markdown content={selected.exercise.content} />
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <h3 style={{ fontWeight: 600 }}>
                  Submitted Code (
                  {selected.exercise.codeExercise?.language ?? "text"})
                </h3>

                <Markdown
                  content={`
\`\`\`${selected.exercise.codeExercise?.language}
${selected.content.code}\`\`\``}
                />
              </div>
            </>
          ) : (
            <p>Select a submission to see its content.</p>
          )}
        </section>
      </div>
    </div>
  );
}
