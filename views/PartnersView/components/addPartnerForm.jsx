import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography/Typography';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import yupObject from 'yup/lib/object';
import yupString from 'yup/lib/string';
import yupNumber from 'yup/lib/number';
import GridItem from 'components/GridItem';

const commonProps = {
  fullWidth: true,
};


class AddPartnerForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      initialValues: {
        email: '',
        name: '',
        commission: 0,
        p24MerchantId: '',
      },
    };

    // TODO: nested validation seems not working
    // TODO: see https://github.com/jaredpalmer/formik/issues/986
    this.validationSchema = yupObject().shape({
      email: yupString().email().trim(),
      name: yupString().required(),
      commission: yupNumber().min(1).max(100).required(),
      p24MerchantId: yupString().required(),
    });
  }

  handleSubmit = (values, actions) => {
    const { onSubmit } = this.props;
    console.log(actions)
    onSubmit(values);
  };

  render() {
    const { initialValues } = this.state;
    const { FormikProps } = this.props;
    return (
      <Formik
        enableReinitialize
        {...FormikProps}
        initialValues={initialValues}
        validationSchema={this.validationSchema}
        onSubmit={this.handleSubmit}
      >
        {() => (
          <Form autoComplete="off" noValidate>
            <Grid container spacing={16}>
              <GridItem>
                <Typography variant="h6">Dane partnera</Typography>
              </GridItem>
              <GridItem>
                <Field name="email" label="E-mail partnera" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem>
                <Field name="name" label="Nazwa partnera" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem>
                <Field name="commission" type="number" label="Prowizja" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem>
                <Field name="p24MerchantId" label="Merchant Id" required component={TextField} {...commonProps} />
              </GridItem>
              <GridItem>
                <Button type="submit" variant="contained" color="primary">Utwórz partnera</Button>
              </GridItem>
            </Grid>
          </Form>
        )}
      </Formik>
    );
  }
}

AddPartnerForm.propTypes = {
  classes: PropTypes.shape({}).isRequired,
  FormikProps: PropTypes.shape({}),
  onSubmit: PropTypes.func,
  onSubmitFailure: PropTypes.func,
  onSubmitSuccess: PropTypes.func,
};

AddPartnerForm.defaultProps = {
  FormikProps: null,
  onSubmit: null,
  onSubmitFailure: null,
  onSubmitSuccess: null,
};

export default AddPartnerForm;
