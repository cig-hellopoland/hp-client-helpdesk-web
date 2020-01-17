import React from 'react';
import PropTypes from 'prop-types';
import _isEqual from 'lodash/isEqual';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import EventIcon from '@material-ui/icons/Event';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import TicketPoolDefinitionForm from '../TicketPoolDefinitionForm';

const styles = theme => ({
  actionButtons: {
    marginTop: theme.spacing.unit,
  },
  summary: {
    backgroundColor: theme.palette.grey[100],
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
  image: {
    color: theme.palette.grey[500],
    fontSize: theme.spacing.unit * 10,
  },
  section: {
    marginTop: theme.spacing.unit * 4,
  },
});

class TicketPoolDefinitionsList extends React.Component {
  constructor(props) {
    super(props);

    const { data } = this.props;

    this.state = {
      dialogOpen: false,
      dialogProps: {},
      tpdData: this.parseTPD(data),
    };
  }

  componentDidUpdate(prevProps) {
    const { data: prevData } = prevProps;
    const { data } = this.props;

    if (!_isEqual(data, prevData)) {
      this.hydrateTPD(data);
    }
  }

  parseTPD = (data) => {
    let tpdData = {};

    if (data && data.length) {
      tpdData = data.reduce((acc, tpd) => ({
        ...acc,
        [tpd.id]: tpd,
      }), {});
    }

    return tpdData;
  };

  hydrateTPD = data => this.setState({
    tpdData: this.parseTPD(data),
  });

  handleDialogAccept = () => {
    const { dialogProps } = this.state;
    const { itemId } = dialogProps || {};

    if (itemId) {
      this.handleTPDDelete(itemId);
    }

    this.handleDialogClose();
  };

  handleDialogClose = () => this.setState({ dialogOpen: false });

  handleDialogExited = () => this.setState({ dialogProps: {} });

  handleDialogOpen = dialogProps => this.setState({ dialogOpen: true, dialogProps });

  handleTPDChange = formData => this.setState(state => ({
    tpdData: {
      ...state.tpdData,
      [formData.id]: formData,
    },
  }));

  handleTPDDelete = (poolId) => {
    const { onTPDDelete } = this.props;

    if (onTPDDelete) {
      onTPDDelete(poolId);
    }
  };

  handleTPDUpdate = (poolId) => {
    const { tpdData } = this.state;
    const { onTPDUpdate } = this.props;

    if (onTPDUpdate) {
      onTPDUpdate(tpdData[poolId]);
    }
  };

  render() {
    const { dialogOpen, dialogProps, tpdData } = this.state;
    const { classes, partnerId } = this.props;

    const poolDefinitions = Object.values(tpdData);
    return (
      <React.Fragment>
        {(!poolDefinitions || poolDefinitions.length === 0)
          && (
            <Grid container item direction="column" alignItems="center" justify="center">
              <EventIcon className={classes.image} />
              <Typography variant="h6">Pule biletów</Typography>
              <Typography>Partner nie zdefiniował żadnych pul biletów.</Typography>
            </Grid>
          )
        }
        {(poolDefinitions && poolDefinitions.length > 0)
          && poolDefinitions.map((poolDefinition) => {
            const { id: poolId, name: poolName } = poolDefinition;

            return (
              <React.Fragment key={`${poolId}-${poolName}`}>
                <ExpansionPanel elevation={0}>
                  <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                    className={classes.summary}
                  >
                    <Typography className={classes.heading}>{poolName}</Typography>
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails>
                    <Grid container>
                      <Grid item>
                        <TicketPoolDefinitionForm
                          data={{
                            ...poolDefinition,
                            partnerId,
                          }}
                          onChange={this.handleTPDChange}
                        />
                      </Grid>
                      <Grid container item className={classes.actionButtons} justify="flex-end">
                        <Grid item>
                          <Button onClick={() => this.handleDialogOpen({ itemId: poolId, name: poolName })} color="primary">
                            Usuń
                          </Button>
                          <Button
                            onClick={() => this.handleTPDUpdate(poolId)}
                            color="primary"
                            variant="contained"
                          >
                            Zapisz
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid>
                  </ExpansionPanelDetails>
                </ExpansionPanel>
                <Dialog
                  open={dialogOpen}
                  onClose={this.handleDialogClose}
                  onExited={this.handleDialogExited}
                  aria-labelledby="alert-dialog-title"
                  aria-describedby="alert-dialog-description"
                >
                  <DialogTitle id="alert-dialog-title">
                    Usuń pulę biletów
                  </DialogTitle>
                  <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                      {`Czy napewno usunąć pulę "${dialogProps.name}"?`}
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={this.handleDialogClose} color="primary">
                      Anuluj
                    </Button>
                    <Button onClick={this.handleDialogAccept} color="primary">
                      OK
                    </Button>
                  </DialogActions>
                </Dialog>
              </React.Fragment>
            );
          })}
      </React.Fragment>
    );
  }
}

TicketPoolDefinitionsList.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})),
  onTPDDelete: PropTypes.func,
  onTPDUpdate: PropTypes.func,
  partnerId: PropTypes.number.isRequired,
};

TicketPoolDefinitionsList.defaultProps = {
  data: null,
  onTPDDelete: null,
  onTPDUpdate: null,
};

export default withStyles(styles)(TicketPoolDefinitionsList);
