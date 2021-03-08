import React from 'react';
import { useReportBuilderContext } from '../context/ReportBuilderContext';
import { ChartGroups } from 'src/components/reportBuilder';

export default function ChartContainer() {
  const { state: reportOptions } = useReportBuilderContext();
  return <ChartGroups reportOptions={reportOptions} showIndustryBenchmarkButton={true} />;
}
