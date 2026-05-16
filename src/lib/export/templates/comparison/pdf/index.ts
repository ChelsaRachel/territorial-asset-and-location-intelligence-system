import React from "react";
import { pdf, type DocumentProps } from "@react-pdf/renderer";
import type { ComparisonReportData } from "@/lib/export/types";
import { ComparisonReport } from "./ComparisonReport";

export async function generateComparisonPdf(data: ComparisonReportData): Promise<Blob> {
  const element = React.createElement(ComparisonReport, { data }) as unknown as React.ReactElement<DocumentProps>;
  return pdf(element).toBlob();
}
