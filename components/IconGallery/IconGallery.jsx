import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import config from 'config';
import GridItem from 'components/GridItem';
import categories from './categories';
import variants from './variants';
import icons from './icons';

const styles = theme => ({
  header: {
    '&:first-letter': {
      textTransform: 'uppercase',
    },
  },
  section: {
    marginBottom: theme.spacing.unit * 3,
  },
});

function IconGallery({ classes, onSelect }) {
  const { iconBaseURL } = config.public;
  const sections = Object.values(categories);
  const variant = 'svg';

  function handleIconClick(event, iconSrc) {
    if (onSelect) {
      onSelect(iconSrc);
    }
  }

  return (
    <React.Fragment>
      {sections.map((sectionName) => {
        const sectionIcons = icons[sectionName];

        if (!sectionIcons) {
          return null;
        }

        return (
          <Grid container key={sectionName} className={classes.section}>
            <GridItem>
              <Typography variant="h6" className={classes.header}>
                {sectionName.toLowerCase()}
              </Typography>
            </GridItem>
            {sectionIcons.map(({ name }) => {
              const variantPath = `${sectionName.toLowerCase()}${variants[variant].path}`;
              const variantSuffix = variants[variant].suffix;
              const src = `${iconBaseURL}/${variantPath}/${name}${variantSuffix}`;

              return (
                <IconButton key={src} onClick={event => handleIconClick(event, src)}>
                  <img src={src} alt={name} height={48} width={48} title={name} />
                </IconButton>
              );
            })}
          </Grid>
        );
      })}
    </React.Fragment>
  );
}

IconGallery.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default withStyles(styles)(IconGallery);
