import React from "react";
import { pdf, type DocumentProps } from "@react-pdf/renderer";
import type { AccountabilityReportData } from "@/lib/export/types";
import { AccountabilityReport } from "./AccountabilityReport";

export async function generateAccountabilityPdf(data: AccountabilityReportData): Promise<Blob> {
  const element = React.createElement(AccountabilityReport, { data }) as unknown as React.ReactElement<DocumentProps>;
  return pdf(element).toBlob();
}
