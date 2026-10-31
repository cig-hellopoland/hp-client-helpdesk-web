import React from 'react';
import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import GridItem from 'components/GridItem';

const SeasonalClosureFields = () => (
  <Field
    name="seasonallyClosed"
    render={({ field, form }) => (
      <React.Fragment>
        <GridItem md={4} sm={4}>
          <FormControlLabel
            label="Sezonowo nieczynne"
            control={(
              <Switch
                name={field.name}
                checked={Boolean(field.value)}
                disabled={form.isSubmitting}
                onChange={event => form.setFieldValue(field.name, event.target.checked)}
                onBlur={field.onBlur}
              />
          )}
          />
        </GridItem>
        {(field.value || form.values.seasonalClosureFrom || form.values.seasonalClosureTo) && (
        <React.Fragment>
          <GridItem md={6} sm={6}>
            <Field
              name="seasonalClosureFrom"
              label="Nieczynne od (opcjonalnie)"
              type="date"
              component={TextField}
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: '0001-01-01', max: form.values.seasonalClosureTo || '9999-12-31' }}
            />
          </GridItem>
          <GridItem md={6} sm={6}>
            <Field
              name="seasonalClosureTo"
              label="Nieczynne do (włącznie, opcjonalnie)"
              type="date"
              component={TextField}
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: form.values.seasonalClosureFrom || '0001-01-01', max: '9999-12-31' }}
            />
          </GridItem>
          <GridItem>
            <Typography variant="caption">
              Bez dat komunikat jest widoczny do wyłączenia przełącznika. Daty obowiązują
              według czasu polskiego i tylko przy włączonym przełączniku.
              Komunikat nie blokuje zakupu biletów.
            </Typography>
          </GridItem>
        </React.Fragment>
        )}
      </React.Fragment>
    )}
  />
);

export default SeasonalClosureFields;
