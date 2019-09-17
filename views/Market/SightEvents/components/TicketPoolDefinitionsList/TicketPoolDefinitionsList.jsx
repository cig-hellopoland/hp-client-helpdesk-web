import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import EventIcon from '@material-ui/icons/Event';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import TicketPoolDefinitionForm from '../TicketPoolDefinitionForm';

const styles = theme => ({
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

function TicketPoolDefinitionsList({ classes, data }) {
  function formatPrice(price) {
    return `${parseFloat((price / 100).toFixed(2))} zł`;
  }

  return (
    <React.Fragment>
      {(!data || data.length === 0)
        && (
          <Grid container item direction="column" alignItems="center" justify="center">
            <EventIcon className={classes.image} />
            <Typography variant="h6">Pule biletów</Typography>
            <Typography>Partner nie zdefiniował żadnych pul biletów.</Typography>
          </Grid>
        )
      }
      {(data && data.length > 0) && data.map((poolDefinition) => {
        const { id: poolId, name: poolName, ticketDefinitions } = poolDefinition;

        return (
          <ExpansionPanel key={poolId} elevation={0}>
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} className={classes.summary}>
              <Typography className={classes.heading}>{poolName}</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <Grid container direction="column">
                <TicketPoolDefinitionForm data={poolDefinition} onChange={() => {}} readOnly />
                <Typography variant="h6" className={classes.section}>Bilety</Typography>
                <List>
                  {ticketDefinitions.map((ticketDefinition) => {
                    const {
                      availableTicketsNumber, id, name: ticketName, price,
                    } = ticketDefinition;
                    const availableTickets = !availableTicketsNumber
                    || availableTicketsNumber === -1
                      ? 'Brak'
                      : `${availableTicketsNumber} szt`;
                    const ticketPrice = formatPrice(price);
                    const secondaryText = `Limit biletów: ${availableTickets} | Cena: ${ticketPrice}`;

                    return (
                      <ListItem key={`${id}-${ticketName}`}>
                        <ListItemText
                          primary={ticketName}
                          secondary={secondaryText}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Grid>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        );
      })}
    </React.Fragment>
  );
}

TicketPoolDefinitionsList.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})),
};

TicketPoolDefinitionsList.defaultProps = {
  data: null,
};

export default withStyles(styles)(TicketPoolDefinitionsList);
