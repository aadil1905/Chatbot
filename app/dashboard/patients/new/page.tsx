import PatientForm from "@/components/patients/PatientForm";
import PageIntro from "@/components/dashboard/PageIntro";

export default function NewPatientPage() {
  return <div className="mx-auto max-w-5xl space-y-6"><PageIntro eyebrow="Patients" title="Add patient" description="Create a patient profile for your clinic." /><PatientForm /></div>;
}
