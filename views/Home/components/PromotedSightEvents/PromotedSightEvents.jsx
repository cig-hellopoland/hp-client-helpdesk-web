import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { ReactReduxContext } from 'react-redux';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import IconClear from '@material-ui/icons/Clear';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import { DEFAULT_LANGUAGE } from 'utils/translations';
import PromotionDialog from './PromotionDialog';

const MAX_OFFERS = 8;
const options = { headers: { 'Content-Language': DEFAULT_LANGUAGE } };
const styles = theme => ({
  orderItem: {
    alignItems: 'center',
    borderBottom: '1px solid #e0e0e0',
    cursor: 'move',
    display: 'flex',
    minHeight: 56,
    padding: `${theme.spacing.unit}px 0`,
  },
  orderIndex: { color: theme.palette.text.secondary, width: 48 },
  orderName: { flex: 1 },
  orderHandle: { color: theme.palette.text.secondary, paddingRight: theme.spacing.unit },
  dropZone: { padding: '16px 0', textAlign: 'center', color: theme.palette.text.secondary },
});

const errorMessage = (error, fallback) => {
  const data = error && error.response && error.response.data;
  return data && typeof data.message === 'string' ? data.message : fallback;
};

export class PromotedSightEvents extends Component {
  state = {
    items: [],
    available: [],
    loading: true,
    saving: false,
    loaded: false,
    error: '',
    dialogError: '',
    adding: false,
    ordering: false,
    removing: null,
    orderItems: [],
    draggedId: null,
  };

  componentDidMount() {
    this.mounted = true;
    this.load();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  load = async () => {
    const { httpClient } = this.props;
    this.setState({ loading: true, error: '' });
    try {
      const [promoted, all] = await Promise.all([
        httpClient.get('/sight-events/promoted', options),
        httpClient.get('/sight-events', options),
      ]);
      if (!Array.isArray(promoted.data.items) || !Array.isArray(all.data.items)) {
        throw new Error('Invalid offers response');
      }
      if (!this.mounted) return;
      this.setState({
        items: promoted.data.items.slice().sort((a, b) => a.promotion - b.promotion),
        available: all.data.items.slice().sort((a, b) => (a.name || '').localeCompare(
          b.name || '', 'pl', { sensitivity: 'base' },
        )),
        loaded: true,
        loading: false,
      });
    } catch (error) {
      if (this.mounted) {
        this.setState({
          loading: false,
          loaded: false,
          error: 'Nie udało się pobrać listy promowanych ofert.',
        });
      }
    }
  };

  mutate = async (method, url, data) => {
    const { httpClient } = this.props;
    const { loading, loaded } = this.state;
    if (this.pending || loading || !loaded) return;
    this.pending = true;
    this.setState({ saving: true, dialogError: '' });
    try {
      await httpClient({
        method, url, data, ...options,
      });
      if (!this.mounted) return;
      this.setState({ adding: false, ordering: false, removing: null });
      await this.load();
    } catch (error) {
      if (this.mounted) {
        this.setState({
          dialogError: errorMessage(error, 'Nie udało się zapisać zmiany. Spróbuj ponownie.'),
        });
      }
    } finally {
      this.pending = false;
      if (this.mounted) this.setState({ saving: false });
    }
  };

  add = (id) => {
    const { items, available } = this.state;
    if (items.length >= MAX_OFFERS || items.some(item => String(item.id) === String(id))
      || !available.some(item => String(item.id) === String(id))) return;
    this.mutate('post', `/sight-events/${encodeURIComponent(id)}/promotion`);
  };

  closeDialogs = () => {
    if (!this.pending) {
      this.setState({
        adding: false, ordering: false, removing: null, dialogError: '', draggedId: null,
      });
    }
  };

  dragStart = id => (event) => {
    const { dataTransfer } = event;
    if (dataTransfer) {
      dataTransfer.effectAllowed = 'move';
      dataTransfer.setData('text/plain', String(id));
    }
    this.setState({ draggedId: id });
  };

  dragOver = (event) => {
    event.preventDefault();
    const { dataTransfer } = event;
    if (dataTransfer) dataTransfer.dropEffect = 'move';
  };

  drop = targetId => (event) => {
    event.preventDefault();
    if (this.pending) return;
    this.setState(({ orderItems, draggedId }) => {
      if (draggedId === null || draggedId === targetId) return { draggedId: null };
      const next = orderItems.slice();
      const from = next.findIndex(item => item.id === draggedId);
      if (from < 0) return { draggedId: null };
      const [moved] = next.splice(from, 1);
      const to = targetId === null ? next.length : next.findIndex(item => item.id === targetId);
      if (to < 0) return { draggedId: null };
      next.splice(to, 0, moved);
      return { orderItems: next, draggedId: null };
    });
  };

  render() {
    const { classes } = this.props;
    const {
      items, available, loading, loaded, saving, error, adding, ordering,
      removing, dialogError, orderItems,
    } = this.state;
    const busy = loading || saving;
    const candidates = available.filter(item => !items.some(promoted => promoted.id === item.id));
    return (
      <Fragment>
        {error && <Typography color="error" role="alert">{error}</Typography>}
        <Typography variant="caption">
          {loading ? 'Ładowanie ofert…' : `Promowane oferty: ${items.length} / ${MAX_OFFERS}`}
        </Typography>
        <List dense>
          {items.map(item => (
            <Fragment key={item.id}>
              <ListItem>
                <ListItemText primary={item.name} secondary={`Kolejność na liście: ${item.promotion}`} />
                <ListItemSecondaryAction>
                  <IconButton
                    aria-label={`Usuń promocję: ${item.name}`}
                    disabled={busy || !loaded}
                    onClick={() => this.setState({ removing: item, dialogError: '' })}
                  >
                    <IconClear />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
            </Fragment>
          ))}
        </List>
        {loaded && !items.length && <Typography>Brak promowanych ofert</Typography>}
        <Button
          color="primary"
          disabled={busy || !loaded || items.length >= MAX_OFFERS}
          onClick={() => this.setState({ adding: true, dialogError: '' })}
        >
          Dodaj ofertę
        </Button>
        <Button
          disabled={busy || !loaded || items.length < 2}
          onClick={() => this.setState({ ordering: true, orderItems: items.slice(), dialogError: '' })}
        >
          Ustal kolejność
        </Button>
        {error && <Button onClick={this.load} disabled={busy}>Spróbuj ponownie</Button>}
        {adding && (
          <PromotionDialog
            open
            onClose={this.closeDialogs}
            onSubmit={this.add}
            sightEvents={candidates}
            saving={saving}
            error={dialogError}
          />
        )}
        <Dialog
          open={ordering}
          onClose={this.closeDialogs}
          fullWidth
          maxWidth="sm"
          aria-labelledby="promoted-order-title"
        >
          <DialogTitle id="promoted-order-title">Ustal kolejność promowanych ofert</DialogTitle>
          <DialogContent>
            {orderItems.map((item, index) => (
              <div
                key={item.id}
                className={classes.orderItem}
                draggable={!saving}
                onDragStart={this.dragStart(item.id)}
                onDragOver={this.dragOver}
                onDrop={this.drop(item.id)}
                onDragEnd={() => this.setState({ draggedId: null })}
              >
                <Typography className={classes.orderIndex}>{index + 1}</Typography>
                <Typography className={classes.orderName}>{item.name}</Typography>
                <Typography className={classes.orderHandle}>::</Typography>
              </div>
            ))}
            <div className={classes.dropZone} onDragOver={this.dragOver} onDrop={this.drop(null)}>
              Upuść na koniec listy
            </div>
            {dialogError && <Typography color="error" role="alert">{dialogError}</Typography>}
          </DialogContent>
          <DialogActions>
            <Button disabled={saving} onClick={this.closeDialogs}>Anuluj</Button>
            <Button
              color="primary"
              disabled={saving}
              onClick={() => this.mutate('put', '/sight-events/promoted/order',
                orderItems.map(item => item.id))}
            >
              Zapisz
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={Boolean(removing)}
          onClose={this.closeDialogs}
          aria-labelledby="remove-promoted-title"
        >
          <DialogTitle id="remove-promoted-title">Usuń promowaną ofertę</DialogTitle>
          <DialogContent>
            <Typography>{`Usunąć ofertę „${removing ? removing.name : ''}” z promowanych?`}</Typography>
            {dialogError && <Typography color="error" role="alert">{dialogError}</Typography>}
          </DialogContent>
          <DialogActions>
            <Button disabled={saving} onClick={this.closeDialogs}>Anuluj</Button>
            <Button
              color="primary"
              disabled={saving || !removing}
              onClick={() => this.mutate('delete', `/sight-events/${removing.id}/promotion`)}
            >
              Usuń
            </Button>
          </DialogActions>
        </Dialog>
      </Fragment>
    );
  }
}

PromotedSightEvents.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  httpClient: PropTypes.func.isRequired,
};

const StyledPromotedSightEvents = withStyles(styles)(PromotedSightEvents);

export default function ConnectedPromotedSightEvents() {
  return (
    <ReactReduxContext.Consumer>
      {({ store }) => (
        <StyledPromotedSightEvents httpClient={store.logicMiddleware.httpClient} />
      )}
    </ReactReduxContext.Consumer>
  );
}
