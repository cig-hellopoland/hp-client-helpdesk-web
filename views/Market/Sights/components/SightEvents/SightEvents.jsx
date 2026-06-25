import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import LocalPlayIcon from '@material-ui/icons/LocalPlay';
import LockIcon from '@material-ui/icons/Lock';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import PublicIcon from '@material-ui/icons/Public';
import {
  actions as sightEventsActions,
  selectors as sightEventsSelectors,
} from '@hello-poland/commons/redux/sightEvents';
import SortableTableHead from '../../../Partners/components/ListingViewTable/SortableTableHead';

const tableColumns = [
  { id: 'item-id', label: '#\u00A0ID' },
  { id: 'name', label: 'Nazwa oferty' },
  { id: 'details', label: '' },
];

const styles = theme => ({
  actions: {
    minWidth: 240,
  },
  addButton: {
    fontSize: 0,
  },
  addButtonLabel: {
    fontSize: 14,
  },
  image: {
    color: theme.palette.grey[500],
    fontSize: theme.spacing.unit * 10,
  },
  icon: {
    marginRight: theme.spacing.unit,
  },
  orderNumber: {
    width: 100,
  },
  toolbar: {
    marginBottom: theme.spacing.unit * 2,
  },
});

class SightEvents extends React.Component {
  state = {
    dialogOpen: false,
    dialogProps: {},
  };

  handleDialogOpen = item => this.setState({
    dialogOpen: true,
    dialogProps: {
      itemId: item.id,
      name: item.name,
    },
  });

  handleDialogClose = () => this.setState({
    dialogOpen: false,
    dialogProps: {},
  });

  handleDeleteFailure = () => {
    const { error, onDeleteFailure } = this.props;

    this.handleDialogClose();

    if (onDeleteFailure) {
      onDeleteFailure(error && error.message);
    }
  };

  handleDeleteSuccess = () => {
    const { onDeleteSuccess } = this.props;

    this.handleDialogClose();

    if (onDeleteSuccess) {
      onDeleteSuccess();
    }
  };

  handleDeleteItem = (itemId) => {
    const { deleteItem } = this.props;

    this.setState(state => ({
      dialogProps: {
        ...state.dialogProps,
        deleting: true,
      },
    }));

    deleteItem({
      id: itemId,
      onFailure: this.handleDeleteFailure,
      onSuccess: this.handleDeleteSuccess,
    });
  };

  render() {
    const {
      classes, items, partnerId, sightId,
    } = this.props;
    const { dialogOpen, dialogProps } = this.state;
    const colorActive = 'primary';
    const colorInactive = 'disabled';
    const successMessage = encodeURIComponent('Zapisano ofertę.');
    const returnTo = encodeURIComponent(
      `/market/sights/edit?itemId=${sightId}&tab=offers&successMessage=${successMessage}`,
    );

    return (
      <React.Fragment>
        <Grid container justify="flex-end" className={classes.toolbar}>
          <Link
            href={`/market/sight-events/create?sightId=${sightId}&partnerId=${partnerId || ''}&returnTo=${returnTo}`}
          >
            <Button component="a" aria-label="Dodaj" className={classes.addButton}>
              <AddIcon className={classes.icon} />
              <span className={classes.addButtonLabel}>Dodaj</span>
              Dodaj ofertę
            </Button>
          </Link>
        </Grid>
        {(!items || !items.length)
          && (
            <Grid container item direction="column" alignItems="center" justify="center">
              <LocalPlayIcon className={classes.image} />
              <Typography variant="h6">Oferty</Typography>
              <Typography>
                Partner nie zdefiniował żadnych ofert powiązanych z tym obiektem.
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
                    <TableCell align="right" className={classes.actions}>
                      <IconButton disabled>
                        <LockIcon color={blocked ? colorActive : colorInactive} />
                      </IconButton>
                      <IconButton disabled>
                        <PublicIcon color={published ? colorActive : colorInactive} />
                      </IconButton>
                      <Link
                        href={`/market/sight-events/edit?itemId=${itemId}&sightId=${sightId}&partnerId=${partnerId || ''}`}
                      >
                        <IconButton component="a" title="Otwórz">
                          <OpenInNewIcon color="action" />
                        </IconButton>
                      </Link>
                      <IconButton
                        onClick={() => this.handleDialogOpen({ id: itemId, name })}
                        title="Usuń"
                      >
                        <DeleteIcon color="action" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )
        }
        <Dialog
          open={dialogOpen}
          onClose={this.handleDialogClose}
          aria-labelledby="delete-sight-event-dialog-title"
          aria-describedby="delete-sight-event-dialog-description"
        >
          <DialogTitle id="delete-sight-event-dialog-title">
            Usuń ofertę
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-sight-event-dialog-description">
              {`Czy na pewno usunąć ofertę "${dialogProps.name}"?`}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={this.handleDialogClose}
              color="primary"
              disabled={dialogProps.deleting}
            >
              Anuluj
            </Button>
            <Button
              onClick={() => this.handleDeleteItem(dialogProps.itemId)}
              color="primary"
              disabled={dialogProps.deleting}
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    );
  }
}

SightEvents.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  deleteItem: PropTypes.func.isRequired,
  error: PropTypes.shape({}),
  items: PropTypes.arrayOf(PropTypes.shape({})),
  onDeleteFailure: PropTypes.func,
  onDeleteSuccess: PropTypes.func,
  partnerId: PropTypes.number,
  sightId: PropTypes.number.isRequired,
};

SightEvents.defaultProps = {
  error: null,
  items: [],
  onDeleteFailure: null,
  onDeleteSuccess: null,
  partnerId: null,
};

const mapStateToProps = state => ({
  error: sightEventsSelectors.getError(state),
});

const mapDispatchToProps = {
  deleteItem: sightEventsActions.deleteItem,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStyles(styles),
)(SightEvents);
