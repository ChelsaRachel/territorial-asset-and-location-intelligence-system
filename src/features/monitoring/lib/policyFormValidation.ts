export const POLICY_TAGS = [
  "infrastruktur",
  "demand",
  "regulasi",
  "alert_response",
  "kapasitas",
  "lainnya",
] as const;

export type PolicyFormTag = (typeof POLICY_TAGS)[number];

export interface PolicyFormValues {
  policy_date: string;
  title: string;
  deskripsi: string;
  tags: string[];
}

export interface PolicyFormValidation {
  errors: Partial<Record<keyof PolicyFormValues, string>>;
  warnings: string[];
  valid: boolean;
}

export function validatePolicyForm(values: PolicyFormValues, snapshotStartDate: string): PolicyFormValidation {
  const errors: PolicyFormValidation["errors"] = {};
  const warnings: string[] = [];

  if (!values.policy_date) errors.policy_date = "Tanggal kebijakan wajib diisi.";
  if (!values.title.trim()) errors.title = "Judul wajib diisi.";
  if (values.title.trim().length > 120) errors.title = "Judul maksimal 120 karakter.";
  if (!values.deskripsi.trim()) errors.deskripsi = "Deskripsi wajib diisi.";
  if (values.deskripsi.trim().length > 600) errors.deskripsi = "Deskripsi maksimal 600 karakter.";
  if (values.tags.length === 0) errors.tags = "Pilih minimal satu tag.";

  if (values.policy_date) {
    const policyDate = new Date(`${values.policy_date}T00:00:00`);
    const plusThirty = new Date();
    plusThirty.setDate(plusThirty.getDate() + 30);
    if (policyDate > plusThirty) {
      warnings.push("Tanggal kebijakan ada di masa depan — pastikan Anda mencatat rencana, bukan eksekusi.");
    }
    if (values.policy_date < snapshotStartDate) {
      warnings.push("Tanggal kebijakan lebih awal dari rentang snapshot; atribusi historis mungkin tidak lengkap.");
    }
  }

  return { errors, warnings, valid: Object.keys(errors).length === 0 };
}
