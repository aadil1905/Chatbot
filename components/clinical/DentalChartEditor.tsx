"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { saveDentalChartEntryAction } from "@/app/dashboard/clinical-workspace/actions";

type Entry = { toothNumber: string; condition: string; notes: string | null };
const teeth = ["18", "17", "16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26", "27", "28", "48", "47", "46", "45", "44", "43", "42", "41", "31", "32", "33", "34", "35", "36", "37", "38"];
const labels: Record<string, string> = { HEALTHY: "Healthy", CARIES: "Caries", FILLING: "Filling", CROWN: "Crown", ROOT_CANAL: "Root canal", MISSING: "Missing", IMPLANT: "Implant", WATCH: "Watch" };
const styles: Record<string, string> = { HEALTHY: "border-emerald-200 bg-emerald-50 text-emerald-800", CARIES: "border-rose-200 bg-rose-50 text-rose-800", FILLING: "border-sky-200 bg-sky-50 text-sky-800", CROWN: "border-violet-200 bg-violet-50 text-violet-800", ROOT_CANAL: "border-amber-200 bg-amber-50 text-amber-900", MISSING: "border-slate-200 bg-slate-100 text-slate-600", IMPLANT: "border-cyan-200 bg-cyan-50 text-cyan-800", WATCH: "border-orange-200 bg-orange-50 text-orange-800" };

const positions: Record<string, [number, number]> = {
  "18": [14.5, 34], "17": [17, 27], "16": [20.5, 22.3], "15": [24.5, 18.2], "14": [29, 15.8], "13": [33, 13.1], "12": [38, 10.7], "11": [45.5, 9.4],
  "21": [54.5, 9.4], "22": [62, 10.7], "23": [67, 13.1], "24": [71, 15.8], "25": [75.5, 18.2], "26": [79.5, 22.3], "27": [83, 27], "28": [85.5, 34],
  "48": [14.5, 66.2], "47": [17, 73], "46": [20.5, 77.8], "45": [24.5, 81.7], "44": [29, 84.6], "43": [33, 86.9], "42": [38, 89.2], "41": [45.5, 90.5],
  "31": [54.5, 90.5], "32": [62, 89.2], "33": [67, 86.9], "34": [71, 84.6], "35": [75.5, 81.7], "36": [79.5, 77.8], "37": [83, 73], "38": [85.5, 66.2],
};

export default function DentalChartEditor({ patientId, entries }: { patientId: number; entries: Entry[] }) {
  const [selected, setSelected] = useState("18");
  const byTooth = useMemo(() => new Map(entries.map((entry) => [entry.toothNumber, entry])), [entries]);
  const selectedEntry = byTooth.get(selected);

  return <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
    <section className="rounded-3xl border border-sky-100 bg-white/80 p-6 shadow-[0_12px_30px_rgba(53,91,138,.08)]">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold">Interactive dental chart</h2><p className="mt-1 text-sm text-muted-foreground">Click a real tooth in the arch to document its clinical condition.</p></div><div className="flex flex-wrap gap-2 text-xs">{Object.keys(labels).map((condition) => <span key={condition} className={`rounded-full border px-2 py-1 ${styles[condition]}`}>{labels[condition]}</span>)}</div></div>
      <div className="mx-auto mt-6 max-w-[650px] rounded-[2rem] bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-3 sm:p-5"><div className="relative aspect-[2/3]"><Image src="/dental/dental-arch-clinical.png" alt="Interactive adult dental arch" fill sizes="(max-width: 1024px) 90vw, 650px" className="object-contain" priority />{teeth.map((tooth) => <ToothButton key={tooth} tooth={tooth} selected={selected === tooth} condition={byTooth.get(tooth)?.condition} onSelect={setSelected} />)}<div className="pointer-events-none absolute left-1/2 top-1/2 w-44 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-indigo-100 bg-white/90 px-3 py-2 text-center text-xs font-semibold text-indigo-700 shadow-sm">Selected tooth: {selected}</div></div></div>
      <p className="mt-3 text-center text-xs text-slate-500">Colored rings show documented findings. Click any tooth to change its record.</p>
    </section>
    <aside className="rounded-3xl border border-sky-100 bg-white/80 p-6 shadow-[0_12px_30px_rgba(53,91,138,.08)]"><h2 className="text-lg font-bold">Tooth {selected}</h2><p className="mt-1 text-sm text-muted-foreground">Update the chart entry for this tooth.</p><form action={saveDentalChartEntryAction} className="mt-6 space-y-4"><input type="hidden" name="patientId" value={patientId} /><input type="hidden" name="toothNumber" value={selected} /><label className="block text-sm font-medium">Condition<select key={`${selected}-${selectedEntry?.condition || "HEALTHY"}`} name="condition" defaultValue={selectedEntry?.condition || "HEALTHY"} className="mt-2 h-11 w-full rounded-xl border bg-card px-3">{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="block text-sm font-medium">Clinical note<textarea key={`${selected}-${selectedEntry?.notes || ""}`} name="notes" defaultValue={selectedEntry?.notes || ""} rows={5} placeholder="Finding, material, advice, or planned treatment" className="mt-2 w-full rounded-xl border bg-card p-3 text-sm" /></label><button className="h-11 w-full rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90">Save tooth entry</button></form></aside>
  </div>;
}

function ToothButton({ tooth, selected, condition = "HEALTHY", onSelect }: { tooth: string; selected: boolean; condition?: string; onSelect: (tooth: string) => void }) {
  const [left, top] = positions[tooth];
  const isUpperTooth = Number(tooth) < 30;
  const color = condition === "HEALTHY" ? "ring-transparent hover:ring-indigo-400" : condition === "CARIES" ? "ring-rose-500" : condition === "FILLING" ? "ring-sky-500" : condition === "CROWN" ? "ring-violet-500" : condition === "ROOT_CANAL" ? "ring-amber-500" : condition === "IMPLANT" ? "ring-cyan-500" : condition === "WATCH" ? "ring-orange-500" : "ring-slate-400";
  return <button type="button" aria-label={`Select tooth ${tooth}${condition === "HEALTHY" ? "" : `, ${labels[condition]}`}`} title={`Tooth ${tooth}${condition === "HEALTHY" ? "" : ` - ${labels[condition]}`}`} onClick={() => onSelect(tooth)} style={{ left: `${left}%`, top: `${top}%` }} className={`group absolute z-10 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-transparent text-[10px] font-bold text-slate-700 ring-2 transition duration-200 hover:scale-125 hover:ring-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-400/50 ${color} ${selected ? "scale-125 ring-4 ring-indigo-600 shadow-[0_0_0_4px_rgba(255,255,255,.9)]" : ""}`}><span className={`pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-medium text-slate-500 ${isUpperTooth ? "-top-5" : "-bottom-5"}`}>{tooth}</span></button>;
}
