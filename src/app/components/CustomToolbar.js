import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

import  BulkDelete  from "../components/BulkDelete";
import AddBulkToCohort from "../components/AddBulkToCohort";

const defaultToolbarSelectStyles = {
  iconButton: {},
  iconContainer: {
    marginRight: "24px",
  },
  inverseIcon: {
    transform: "rotate(90deg)",
  },
};

const CustomToolbarSelect = (props) => {
  const { classes } = props;

  return (
    <div className={classes.iconContainer}>
      <BulkDelete
        selectedRows={props.selectedRows}
        displayData={props.displayData}
        setSelectedRows={props.setSelectedRows}
        items={props.items}
        key={props.key}
        history={props.history}
        // reRender={handleLoadingData}
      />
      {props.customToolbarByPage}
    </div>
  );
};

export default withStyles(defaultToolbarSelectStyles, {
  name: "CustomToolbarSelect",
})(CustomToolbarSelect);

CustomToolbarSelect.propTypes = {
  customToolbarByPage: PropTypes.any
};
