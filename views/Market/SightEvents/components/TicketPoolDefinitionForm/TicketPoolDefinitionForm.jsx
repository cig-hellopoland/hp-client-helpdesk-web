import React from 'react';
import PropTypes from 'prop-types';
import format from 'date-fns/format';
import CalendarEventForm from '../CalendarEventForm';

class TicketPoolDefinitionForm extends React.Component {
  getParsedDate = date => format(date, 'YYYY-MM-DDTHH:mm');

  handleChange = name => (...args) => {
    const { onChange } = this.props;

    onChange(name)(...args);
  };

  render() {
    const { data, onChange, canEdit } = this.props;

    return (
      <CalendarEventForm formData={data} onChange={onChange} canEdit={canEdit} />
    );
  }
}

TicketPoolDefinitionForm.propTypes = {
  canEdit: PropTypes.bool,
  data: PropTypes.shape({
    id: PropTypes.number,
    sightEventId: PropTypes.number,
  }),
  onChange: PropTypes.func.isRequired,
};

TicketPoolDefinitionForm.defaultProps = {
  data: null,
  canEdit: false,
};

export default TicketPoolDefinitionForm;
