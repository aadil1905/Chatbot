"use client";

import Image from "next/image";
import { ScanLine, Sparkles, Stethoscope } from "lucide-react";
import { useState, type ReactNode } from "react";

type Condition = "HEALTHY" | "CARIES" | "FILLING" | "CROWN" | "MISSING";
type ToothData = { number: string; x: number; y: number; kind: "incisor" | "canine" | "premolar" | "molar"; condition?: Condition };

const upper = ["18", "17", "16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26", "27", "28"];
const lower = ["48", "47", "46", "45", "44", "43", "42", "41", "31", "32", "33", "34", "35", "36", "37", "38"];

// These coordinates are measured from the real 1024 x 1024 odontogram asset.
// Keeping the chart square makes its labels and hit areas remain aligned at every size.
const positions = [
  [22, 43], [23, 35], [26, 28], [30, 22], [34, 17], [39, 13], [45, 10], [48.5, 9],
  [51.5, 9], [55, 10], [61, 13], [66, 17], [70, 22], [74, 28], [77, 35], [78, 43],
  [22, 57], [24, 65], [27, 72], [32, 78], [37, 84], [42, 88], [46, 90], [48.5, 91],
  [51.5, 91], [54, 90], [58, 88], [63, 84], [68, 78], [73, 72], [76, 65], [78, 57],
] as const;

function toothKind(number: string): ToothData["kind"] {
  const last = Number(number[1]);
  if (last <= 2) return "incisor";
  if (last === 3) return "canine";
  if (last <= 5) return "premolar";
  return "molar";
}

function demoCondition(number: string): Condition | undefined {
  if (number === "14") return "CROWN";
  if (number === "25") return "CARIES";
  if (number === "36") return "FILLING";
  if (number === "16" || number === "47") return "MISSING";
  return undefined;
}

const teeth: ToothData[] = [...upper, ...lower].map((number, index) => ({
  number,
  x: positions[index][0],
  y: positions[index][1],
  kind: toothKind(number),
  condition: demoCondition(number),
}));

const conditionLabel: Record<Condition, string> = {
  HEALTHY: "Healthy",
  CARIES: "Caries",
  FILLING: "Filled",
  CROWN: "Crown",
  MISSING: "Missing",
};

export default function DentalOdontogram() {
  const [selected, setSelected] = useState("14");
  const [viewMode, setViewMode] = useState<"chart" | "scan" | "notes">("chart");
  const selectedTooth = teeth.find((tooth) => tooth.number === selected)!;

  return (
    <section className="rounded-[1.6rem] border border-[#E8EAF0] bg-white p-5 shadow-[0_10px_28px_rgba(41,58,101,.055)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#171821]">Dental Chart</h2>
          <p className="mt-1 text-xs text-[#737888]">Select a tooth to view details</p>
        </div>
        <div className="flex gap-2">
          <ChartModeButton label="Dental chart" active={viewMode === "chart"} onClick={() => setViewMode("chart")}><Sparkles className="size-4" /></ChartModeButton>
          <ChartModeButton label="Clinical scan" active={viewMode === "scan"} onClick={() => setViewMode("scan")}><ScanLine className="size-4" /></ChartModeButton>
          <ChartModeButton label="Clinical notes" active={viewMode === "notes"} onClick={() => setViewMode("notes")}><Stethoscope className="size-4" /></ChartModeButton>
        </div>
      </div>

      <div className="relative mx-auto mt-2 aspect-square w-full max-w-[620px]">
        <Image src="/dental/dental-arch-dashboard.png" alt="Interactive adult dental chart" fill sizes="(max-width: 1024px) 90vw, 620px" className="object-contain" priority />
        {teeth.map((tooth) => <DashboardTooth key={tooth.number} tooth={tooth} selected={selected === tooth.number} onSelect={setSelected} />)}
        <div className="pointer-events-none absolute left-1/2 top-1/2 grid h-28 w-40 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/35 text-center text-xs font-medium leading-5 text-[#737888]">
          <span>Select a tooth<br />to view details</span>
        </div>
      </div>

      <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-2 rounded-xl bg-[#FAFBFF] px-3 py-2 text-[11px] text-[#596077]">
        <Legend color="#F0475A" label="Caries" /><Legend color="#279DDB" label="Filled" /><Legend color="#8A65F2" label="Crown" /><Legend color="#B8C0CE" label="Missing" />
      </div>
      <div className="mt-3 rounded-xl border border-[#EEEAFD] bg-[#FBFAFF] px-3 py-2 text-center text-xs text-[#595171]">
        {viewMode === "chart" ? <>Selected: <b>Tooth {selected}</b> — {selectedTooth.condition ? conditionLabel[selectedTooth.condition] : "Healthy"}</> : viewMode === "scan" ? <>Clinical scan ready for <b>Tooth {selected}</b>.</> : <>Clinical note for <b>Tooth {selected}</b>: {selectedTooth.condition ? conditionLabel[selectedTooth.condition] : "No finding recorded"}.</>}
      </div>
    </section>
  );
}

function DashboardTooth({ tooth, selected, onSelect }: { tooth: ToothData; selected: boolean; onSelect: (tooth: string) => void }) {
  const upperTooth = Number(tooth.number) < 30;
  const size = tooth.kind === "molar" ? "11%" : tooth.kind === "premolar" ? "9%" : tooth.kind === "canine" ? "8%" : "7%";

  return (
    <button
      type="button"
      aria-label={`Select tooth ${tooth.number}${tooth.condition ? `, ${conditionLabel[tooth.condition]}` : ""}`}
      title={`Tooth ${tooth.number}${tooth.condition ? ` — ${conditionLabel[tooth.condition]}` : ""}`}
      onClick={() => onSelect(tooth.number)}
      style={{ left: `${tooth.x}%`, top: `${tooth.y}%`, width: size, height: size }}
      className={`group absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-transparent transition duration-200 hover:scale-110 hover:border-[#6547E8]/60 focus:outline-none focus:ring-4 focus:ring-[#6547E8]/30 ${selected ? "scale-110 border-[#6547E8] bg-white/10 shadow-[0_0_0_3px_rgba(255,255,255,.82)]" : ""}`}
    >
      <span className={`pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-[#596077] ${upperTooth ? "-top-5" : "-bottom-5"}`}>{tooth.number}</span>
    </button>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-full" style={{ backgroundColor: color }} />{label}</span>;
}

function ChartModeButton({ active, label, onClick, children }: { active: boolean; label: string; onClick: () => void; children: ReactNode }) {
  return <button type="button" aria-label={label} aria-pressed={active} onClick={onClick} className={`grid size-8 place-items-center rounded-lg border transition duration-200 ${active ? "border-[#6547E8] bg-[#6547E8] text-white shadow-sm" : "border-[#E8EAF0] text-[#737888] hover:bg-slate-50"}`}>{children}</button>;
}
