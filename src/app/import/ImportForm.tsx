"use client";

import Papa from "papaparse";
import Link from "next/link";
import { useState, useTransition } from "react";
import { checkRows, CSV_COLUMNS, type CheckedRow, type CsvRow } from "@/lib/csv";
import { formatMoney } from "@/lib/sessions";
import { resolveNet } from "@/lib/validation";
import { importSessions, type ImportResult } from "./actions";

export function ImportForm() {
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [checked, setChecked] = useState<CheckedRow[]>([]);
  const [fileError, setFileError] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [pending, startTransition] = useTransition();

  function onFile(file: File | undefined) {
    setResult(null);
    setFileError("");
    if (!file) return;
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase().replace(/[\s-]+/g, "_"),
      complete: (out) => {
        const missing = ["date", "venue", "start", "end"].filter((c) => !out.meta.fields?.includes(c));
        if (missing.length) {
          setRows([]);
          setChecked([]);
          setFileError(`The file is missing these columns: ${missing.join(", ")}.`);
          return;
        }
        setRows(out.data);
        setChecked(checkRows(out.data));
      },
      error: () => setFileError("Couldn't read that file. Save it as CSV (comma-separated) and try again."),
    });
  }

  const good = checked.filter((r) => r.errors.length === 0);
  const bad = checked.filter((r) => r.errors.length > 0);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-6 text-sm">
        <p>
          One row per session. Columns: <code className="text-felt-bright">{CSV_COLUMNS.join(", ")}</code>. Only date,
          venue, start and end are required, plus either <code>net</code> or both <code>buy_in</code> and{" "}
          <code>cash_out</code>. Times can be <code>14:30</code> or <code>2:30pm</code>.
        </p>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => onFile(e.target.files?.[0])}
          className="mt-4 block text-sm file:mr-3 file:rounded-md file:border-0 file:bg-felt-bright file:px-3 file:py-2 file:text-white"
        />
        {fileError && <p className="mt-3 text-loss">{fileError}</p>}
      </div>

      {checked.length > 0 && !result && (
        <div className="rounded-xl border border-border bg-card p-6 text-sm">
          <p>
            <strong>{good.length}</strong> of {checked.length} rows are ready to import
            {good.length > 0 && (
              <>
                {" "}
                · total net {formatMoney(good.reduce((sum, r) => sum + (resolveNet(r.input) ?? 0), 0))}
              </>
            )}
            .
          </p>
          {bad.length > 0 && (
            <ul className="mt-3 space-y-1 text-loss">
              {bad.slice(0, 10).map((r) => (
                <li key={r.line}>
                  Line {r.line}: {r.errors.join(" ")}
                </li>
              ))}
              {bad.length > 10 && <li>…and {bad.length - 10} more rows with problems.</li>}
            </ul>
          )}
          <button
            disabled={pending || good.length === 0}
            onClick={() => startTransition(async () => setResult(await importSessions(rows)))}
            className="mt-4 rounded-md bg-felt-bright px-4 py-2 font-medium text-white hover:bg-felt disabled:opacity-60"
          >
            {pending ? "Importing…" : `Import ${good.length} sessions`}
          </button>
        </div>
      )}

      {result && (
        <div role="status" className="rounded-xl border border-border bg-card p-6 text-sm">
          <p>
            Imported <strong>{result.imported}</strong> sessions.
            {result.skippedDuplicates > 0 && ` Skipped ${result.skippedDuplicates} already in your log.`}
            {result.rejected.length > 0 && ` ${result.rejected.length} rows had problems and were left out.`}
          </p>
          <Link href="/" className="mt-3 inline-block text-felt-bright hover:underline">
            See your dashboard →
          </Link>
        </div>
      )}
    </div>
  );
}
