import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import LocalPlayIcon from '@material-ui/icons/LocalPlay';
import LockIcon from '@material-ui/icons/Lock';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import PublicIcon from '@material-ui/icons/Public';
import SortableTableHead from '../../../Partners/components/ListingViewTable/SortableTableHead';

const tableColumns = [
  { id: 'item-id', label: '# ID' },
  { id: 'name', label: 'Nazwa oferty' },
  { id: 'details', label: '' },
];

const styles = theme => ({
  image: {
    color: theme.palette.grey[500],
    fontSize: theme.spacing.unit * 10,
  },
  orderNumber: {
    width: 160,
  },
});

function SightEvents({ classes, items }) {
  const colorActive = 'primary';
  const colorInactive = 'disabled';

  return (
    <React.Fragment>
      {(!items || !items.length)
        && (
          <Grid container item direction="column" alignItems="center" justify="center">
            <LocalPlayIcon className={classes.image} />
            <Typography variant="h6">Oferty</Typography>
            <Typography>
              Partner nie zdefiniował żadnych ofert powiązanych z tą atrakcją.
            </Typography>
          </Grid>
        )
      }
      {items && items.length > 0
        && (
          <Table aria-labelledby="items-list">
            <SortableTableHead columns={tableColumns} orderBy="name" onRequestSort={() => {}} />
            <TableBody>
              {items.map(({
                blocked, id: itemId, name, published,
              }) => (
                <TableRow key={itemId} hover>
                  <TableCell className={classes.orderNumber}>{itemId}</TableCell>
                  <TableCell>{name}</TableCell>
                  <TableCell align="right">
                    <IconButton disabled>
                      <LockIcon color={blocked ? colorActive : colorInactive} />
                    </IconButton>
                    <IconButton disabled>
                      <PublicIcon color={published ? colorActive : colorInactive} />
                    </IconButton>
                    <Link
                      as={`/market/sight-events/${itemId}/edit`}
                      href={`/market/sight-events/edit?itemId=${itemId}`}
                    >
                      <IconButton component="a" title="Otwórz">
                        <OpenInNewIcon color="action" />
                      </IconButton>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )
      }
    </React.Fragment>
  );
}

SightEvents.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({})),
};

SightEvents.defaultProps = {
  items: [],
};

export default withStyles(styles)(SightEvents);
