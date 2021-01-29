import React from 'react';
import { Box, Columns, Column, Pagination } from 'src/components/matchbox';
import { DEFAULT_PER_PAGE_BUTTONS, DEFAULT_PAGE_RANGE } from 'src/constants';
import PerPageButtons from './PerPageButtons';
import SaveCSVButton from './SaveCSVButton';

const CollectionPagination = ({
  currentPage,
  data,
  onPageChange,
  onPerPageChange,
  pageRange,
  perPage,
  perPageButtons,
  saveCsv,
}) => {
  const renderPageButtons = () => {
    if (data.length <= perPage) {
      return null;
    }

    return (
      <Pagination
        pages={Math.ceil(data.length / perPage)}
        pageRange={pageRange}
        currentPage={currentPage}
        onChange={onPageChange}
      />
    );
  };

  if (!currentPage) {
    return null;
  }

  return (
    <Columns collapseBelow="xs" align="center">
      <Column data-id="pagination-pages">{renderPageButtons()}</Column>
      <Box
        as={Column}
        data-id="pagination-per-page"
        display="flex"
        alignItems="center"
        justifyContent={['flex-start', 'flex-start', 'flex-end']}
      >
        <PerPageButtons
          totalCount={data.length}
          data={data}
          perPage={perPage}
          perPageButtons={perPageButtons}
          onPerPageChange={onPerPageChange}
        />
        <SaveCSVButton size="small" outline data={data} saveCsv={saveCsv} />
      </Box>
    </Columns>
  );
};

CollectionPagination.defaultProps = {
  pageRange: DEFAULT_PAGE_RANGE,
  perPageButtons: DEFAULT_PER_PAGE_BUTTONS,
  saveCsv: true,
};

export default CollectionPagination;
