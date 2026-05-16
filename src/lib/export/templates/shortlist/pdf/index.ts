import React from "react";
import { pdf, type DocumentProps } from "@react-pdf/renderer";
import type { ShortlistReportData } from "@/lib/export/types";
import { ShortlistReport } from "./ShortlistReport";

export async function generateShortlistPdf(data: ShortlistReportData): Promise<Blob> {
  const element = React.createElement(ShortlistReport, { data }) as unknown as React.ReactElement<DocumentProps>;
  return pdf(element).toBlob();
}
