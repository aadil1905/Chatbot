type Entry = { toothNumber: string; condition: string; notes: string | null };

const upperTeeth = ["18", "17", "16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26", "27", "28"];
const lowerTeeth = ["48", "47", "46", "45", "44", "43", "42", "41", "31", "32", "33", "34", "35", "36", "37", "38"];

const conditionLabels: Record<string, string> = {
  HEALTHY: "Healthy",
  CARIES: "Caries",
  FILLING: "Filling",
  CROWN: "Crown",
  ROOT_CANAL: "Root canal",
  MISSING: "Missing",
  IMPLANT: "Implant",
  WATCH: "Watch",
};

const conditionShortLabels: Record<string, string> = {
  HEALTHY: "H.",
  CARIES: "Ca.",
  FILLING: "Fi.",
  CROWN: "Cr.",
  ROOT_CANAL: "RC",
  MISSING: "M.",
  IMPLANT: "I.",
  WATCH: "W.",
};

const conditionClasses: Record<string, string> = {
  HEALTHY: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CARIES: "border-rose-200 bg-rose-50 text-rose-700",
  FILLING: "border-sky-200 bg-sky-50 text-sky-700",
  CROWN: "border-violet-200 bg-violet-50 text-violet-700",
  ROOT_CANAL: "border-amber-200 bg-amber-50 text-amber-700",
  MISSING: "border-slate-200 bg-slate-100 text-slate-500",
  IMPLANT: "border-cyan-200 bg-cyan-50 text-cyan-700",
  WATCH: "border-orange-200 bg-orange-50 text-orange-700",
};

function ToothRow({ title, teeth, entries }: { title: string; teeth: string[]; entries: Map<string, Entry> }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</p>
        <p className="text-xs text-slate-400">FDI numbering</p>
      </div>
      <div className="grid grid-cols-8 gap-2 sm:grid-cols-16">
        {teeth.map((tooth) => {
          const condition = entries.get(tooth)?.condition || "HEALTHY";
          return (
            <div
              key={tooth}
              className={`inline-flex min-h-[58px] min-w-0 flex-col items-center justify-center rounded-xl border px-1 py-2 text-center shadow-sm ${conditionClasses[condition] || conditionClasses.HEALTHY}`}
              title={`Tooth ${tooth}: ${conditionLabels[condition] || "Healthy"}`}
            >
              <span className="w-full text-center text-sm font-bold leading-none">{tooth}</span>
              <span className="mt-1 w-full text-center text-[10px] font-semibold leading-none opacity-80">
                {conditionShortLabels[condition] || "H."}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DentalChartSummary({ entries }: { entries: Entry[] }) {
  const entryMap = new Map(entries.map((entry) => [entry.toothNumber, entry]));
  const importantEntries = entries.filter((entry) => entry.condition !== "HEALTHY");

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
      <div className="mb-4 flex flex-wrap gap-2">
        {Object.entries(conditionLabels).map(([key, label]) => (
          <span key={key} className={`rounded-full border px-2.5 py-1 text-xs font-medium ${conditionClasses[key]}`}>
            {label}
          </span>
        ))}
      </div>
      <ToothRow title="Upper jaw" teeth={upperTeeth} entries={entryMap} />
      <div className="my-5 border-t border-dashed border-slate-200" />
      <ToothRow title="Lower jaw" teeth={lowerTeeth} entries={entryMap} />
      {importantEntries.length > 0 && (
        <p className="mt-4 text-xs font-medium text-slate-500">
          Marked teeth:{" "}
          {importantEntries
            .map((entry) => `Tooth ${entry.toothNumber} - ${conditionLabels[entry.condition] || entry.condition}`)
            .join(", ")}
        </p>
      )}
    </div>
  );
}
