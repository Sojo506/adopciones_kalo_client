import axiosInstance from "./axiosConfig";
import { dedupeRequest } from "./requestCache";

const unwrapResponse = (response) => response.data?.data ?? response.data ?? null;
let adminDashboardSummaryCache = null;

const extractFilename = (contentDispositionHeader, reportType) => {
  if (!contentDispositionHeader) {
    return `reporte-${reportType}.pdf`;
  }

  const utf8Match = contentDispositionHeader.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const basicMatch = contentDispositionHeader.match(/filename="([^"]+)"/i);
  if (basicMatch?.[1]) {
    return basicMatch[1];
  }

  return `reporte-${reportType}.pdf`;
};

export const clearAdminReportsCache = () => {
  adminDashboardSummaryCache = null;
};

export const getAdminDashboardSummary = async ({ force = false } = {}) => {
  if (!force && adminDashboardSummaryCache) {
    return adminDashboardSummaryCache;
  }

  return dedupeRequest("admin-reports:summary", async () => {
    const response = await axiosInstance.get("/reports/summary");
    adminDashboardSummaryCache = unwrapResponse(response);
    return adminDashboardSummaryCache;
  });
};

export const downloadAdminReportPdf = async (reportType) => {
  const response = await axiosInstance.get(`/reports/${encodeURIComponent(reportType)}/pdf`, {
    responseType: "blob",
  });

  return {
    blob: response.data,
    filename: extractFilename(response.headers?.["content-disposition"], reportType),
  };
};
