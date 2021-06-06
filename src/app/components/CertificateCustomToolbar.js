import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import PostAddIcon from '@material-ui/icons/PostAdd';
import { withStyles } from "@material-ui/core/styles";
import bc from "../services/breathecode";
import {
  Tooltip,
  IconButton,
} from "@material-ui/core";

const defaultToolbarSelectStyles = {
  iconButton: {},
  iconContainer: {
    marginRight: "24px",
  },
  inverseIcon: {
    transform: "rotate(90deg)",
  },
};

const CustomToolbarSelectCertificates = (props) => {
  const { classes, reRender } = props;
  const [bulkCertificates, setBulkCertificates] = useState([])

  useEffect(() => {
    let indexList = props.selectedRows.data.map(item => item.index);
    let certificates = []
    indexList.map((item, index) => {
        if(index == 0){
            let certificate = {
                user_id: props.items[item].user.id,
                cohort_slug: props.items[item].cohort.slug
            }
            certificates = [certificate]
        } 
        if(index > 0){
            let certificate = {
                user_id: props.items[item].user.id,
                cohort_slug: props.items[item].cohort.slug
            }
            certificates.push(certificate)
        }
    })
    setBulkCertificates(certificates)
    }, [props.selectedRows])

  return (
      <Tooltip title={"Re-attemps certificates"}>
        <IconButton className={classes.iconButton} onClick={() => {
            bc.certificates().addBulkCertificates(bulkCertificates)
            props.setSelectedRows(props.selectedRows.data = [])
            setBulkCertificates([]);}}>
            <PostAddIcon className={classes.icon} />
        </IconButton>
    </Tooltip>
  );
};

export default withStyles(defaultToolbarSelectStyles, {
  name: "CustomToolbarSelectCertificates",
})(CustomToolbarSelectCertificates);
