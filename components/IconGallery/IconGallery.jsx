import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import config from 'config';
import GridItem from 'components/GridItem';
import axios from 'axios';
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
  const [iconsManifest, setIconsManifest] = useState();
  const { axios: axiosConfig, iconBaseURL } = config.public;
  const sections = Object.values(categories);
  const variant = 'svg';

  const fetchCustomIconsManifest = async () => {
    try {
      const { data } = await axios.get(`${axiosConfig.iconManifestURL}/custom/manifest.json`);
      setIconsManifest(data);
    } catch {
      console.error('Failed to fetch custom icons manifest.');
      setIconsManifest(null);
    }
  };

  function handleIconClick(event, iconSrc) {
    if (onSelect) {
      onSelect(iconSrc);
    }
  }

  useEffect(() => {
    fetchCustomIconsManifest();
  }, []);

  return (
    <React.Fragment>
      <Grid container className={classes.section}>
        <GridItem>
          <Typography variant="h6" className={classes.header}>
            Ikony Hello Poland
          </Typography>
          {iconsManifest === undefined && (<CircularProgress />)}
          {iconsManifest === null && ('Błąd podczas ładowania ikon.')}
          {iconsManifest && iconsManifest.icons
            .filter(({ variants: iconVariants }) => iconVariants.includes(variant))
            .map(({ name }) => {
              const variantPath = `custom${variants[variant].path}`;
              const src = `${iconBaseURL}/${variantPath}/${name}.${variant}`;

              return (
                <IconButton key={src} onClick={event => handleIconClick(event, src)}>
                  <img src={src} alt={name} height={48} width={48} title={name} />
                </IconButton>
              );
            })
          }
        </GridItem>
      </Grid>
      {iconsManifest !== undefined && sections.map((sectionName) => {
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
