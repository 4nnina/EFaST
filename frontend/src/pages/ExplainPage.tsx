import { useEffect, useState } from "react";
import AdminAuth from "../services/AdminAuth";
import Loading from "../components/Loading";
import { askExplanation } from "../services/ExplainAPI";
import type { Report } from "../types/ExplainTypes"

const chosenPrompt: string = "prompt-v4"

// Inline parser for markdown strings
function renderInlineMarkdown(text: string) {
  return text.split(/(\*\*.*?\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

// Parser from JSON to Report react-like for LLM answer
function renderReport(report: Report) {
  return (
    <article className="space-y-12">
      {/* HEADER */}
      <header className="border-b pb-6">
        <h1 className="text-3xl font-bold">{report.report_title}</h1>
        <p className="mt-4 text-lg text-gray-600">{report.summary}</p>
      </header>

      {/* SECTIONS */}
      {report.sections.map((section) => (
        <section key={section.id} className="space-y-6">
          <h2 className="text-2xl font-semibold">{section.title}</h2>

          {section.content_blocks.map((block, idx) => {
            switch (block.type) {
              case "paragraph":
                return (
                  <p key={idx} className="leading-relaxed">
                    {renderInlineMarkdown(block.text)}
                  </p>
                );

              case "bullet_list":
                return (
                  <ul key={idx} className="list-disc pl-6 space-y-2">
                    {block.items.map((item, i) => (
                      <li key={i}>{renderInlineMarkdown(item)}</li>
                    ))}
                  </ul>
                );

              case "highlight_box":
                return (
                  <div
                    key={idx}
                    className={`rounded-lg border p-5 shadow-sm ${
                      block.severity === "warning"
                        ? "border-yellow-400 bg-yellow-50"
                        : block.severity === "error"
                        ? "border-red-400 bg-red-50"
                        : "border-blue-400 bg-blue-50"
                    }`}
                  >
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                      {block.severity}
                    </span>

                    <h3 className="mt-2 text-lg font-bold">
                      {renderInlineMarkdown(block.title)}
                    </h3>

                    <p className="mt-1">
                      {renderInlineMarkdown(block.text)}
                    </p>
                  </div>
                );

              default:
                return null;
            }
          })}
        </section>
      ))}
    </article>
  );
}


function ExplainPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [iteration, setIteration] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await askExplanation(chosenPrompt);

        if (res.issue) {
          throw new Error(res.issue);
        }

        if (typeof res.iteration === "number") {
          setIteration(res.iteration);
        }

        let parsed: Report;

        if (typeof res.response === "string") {
          parsed = JSON.parse(res.response);
        } else {
          parsed = res.response as Report;
        }

        setReport(parsed);
        
      } catch (e) {
        console.error(e);
        setError("Errore nel caricamento o parsing del report.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <AdminAuth>
      <div className="flex flex-col items-center gap-3">
        {/* TITLE */}
        <div className="w-screen bg-gradient-to-r from-purple-500 via-blue-500 to-blue-300 p-8 text-center shadow-lg mb-2">
          <h1 className="text-4xl font-extrabold text-white">
            AI explanation
          </h1>

          {/* DISCLAIMER */}
          {iteration !== null && (
            <div className="mt-4 text-sm text-gray-200 italic">
              AI explanation about fairness data for iteration{" "}
              <span className="font-semibold">{iteration}</span>
            </div>
          )}
        </div>

        {loading ? (
          <Loading />
        ) : error ? (
          <div className="prose max-w-none text-red-600">{error}</div>
        ) : report ? (
          <div className="prose max-w-none p-8">
            {renderReport(report)}
          </div>
        ) : (
          <div className="prose max-w-none">
            No data available.
          </div>
        )}
      </div>
    </AdminAuth>
  );
}

export default ExplainPage;
