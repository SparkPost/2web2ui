import React from 'react';
import { ScreenReaderOnly } from 'src/components/matchbox';

export default function EmptyCell() {
  return (
    <>
      {/* hidden from screen reader users */}
      <span aria-hidden="true">---</span>
      {/* hidden from everyone else */}
      <ScreenReaderOnly> No Data</ScreenReaderOnly>
    </>
  );
}
