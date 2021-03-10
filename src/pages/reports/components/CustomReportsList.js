import React from 'react';
import { withRouter } from 'react-router-dom';
import { Button, Panel, Modal } from 'src/components/matchbox';
import ReportRow from './CustomReportRow';

export function CustomReportsList({ deleting, handleLoad, onDelete, reports }) {
  const [open, setOpen] = React.useState(false);

  const reportList = React.useMemo(() => {
    if (!reports.length) {
      return <Panel.LEGACY.Section>You do not have any saved reports.</Panel.LEGACY.Section>;
    }

    return reports.map((report, i) => {
      function onLoad() {
        setOpen(false);
        handleLoad(report);
      }

      return (
        <ReportRow
          key={`${report.name}-${i}`}
          {...report}
          onLoad={onLoad}
          onDelete={onDelete}
          deleting={deleting}
        />
      );
    });
  }, [deleting, handleLoad, onDelete, reports]);

  return (
    <>
      <Button flat color="orange" size="small" onClick={() => setOpen(!open)}>
        Saved Reports
      </Button>
      <Modal.LEGACY open={open} onClose={() => setOpen(false)} showCloseButton>
        <Panel.LEGACY title="Saved Reports">{reportList}</Panel.LEGACY>
      </Modal.LEGACY>
    </>
  );
}

export default withRouter(CustomReportsList);
