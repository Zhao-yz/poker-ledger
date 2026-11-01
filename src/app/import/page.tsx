import { ImportForm } from "./ImportForm";

export default function ImportPage() {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Import sessions from CSV</h1>
        <p className="mt-1 text-sm text-muted">
          Check the preview before importing. Sessions you already logged (same date, venue and start time) are skipped.
        </p>
      </div>
      <ImportForm />
    </section>
  );
}
