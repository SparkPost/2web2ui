import { ReportBuilderContextProvider } from './context/ReportBuilderContext';
import ReportBuilder from './ReportBuilder';
import React from 'react';

export default function ReportBuilderContainer() {
  return (
    <ReportBuilderContextProvider>
      <ReportBuilder />
    </ReportBuilderContextProvider>
  );
}
