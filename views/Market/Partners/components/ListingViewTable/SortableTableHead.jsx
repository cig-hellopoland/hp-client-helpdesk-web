import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Tooltip from '@material-ui/core/Tooltip';

function SortableTableHead({
  columns, onRequestSort, order, orderBy, TooltipProps,
}) {
  const createSortHandler = property => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {columns.map(({
          align, id: columnId, label, sortable, ...columnProps
        }) => (
          <TableCell
            key={columnId}
            sortDirection={orderBy === columnId ? order : false}
            {...columnProps}
          >
            {sortable
              ? (
                <Tooltip title="Sortuj" placement="bottom-start" enterDelay={300} {...TooltipProps}>
                  <TableSortLabel
                    active={orderBy === columnId}
                    direction={order}
                    onClick={createSortHandler(columnId)}
                  >
                    {label}
                  </TableSortLabel>
                </Tooltip>
              )
              : label
            }
          </TableCell>
        ), this)}
      </TableRow>
    </TableHead>
  );
}

SortableTableHead.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    sortable: PropTypes.bool,
  })).isRequired,
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.string,
  orderBy: PropTypes.string,
  TooltipProps: PropTypes.shape({}),
};

SortableTableHead.defaultProps = {
  order: 'asc',
  orderBy: 'id',
  TooltipProps: null,
};

export default SortableTableHead;
