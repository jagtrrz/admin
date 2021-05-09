import React, { useState, useEffect } from "react";
import { useQuery } from '../hooks/useQuery';
import { useHistory, Link } from 'react-router-dom';
import PropTypes from "prop-types";

import CustomToolbar from "./CustomToolbar";
import MUIDataTable from "mui-datatables";
import { Avatar, Grow, Icon, IconButton, TextField, Tooltip } from "@material-ui/core";

import axios from "../../axios";
import { DownloadCsv } from "./DownloadCsv";
import dayjs from "dayjs";
import bc from "app/services/breathecode";

const host = `${process.env.REACT_APP_API_HOST}/v1`
const stageColors = {
  INACTIVE: "bg-gray",
  PREWORK: "bg-secondary",
  STARTED: "text-white bg-warning",
  FINAL_PROJECT: "text-white bg-error",
  ENDED: "text-white bg-green",
  DELETED: "light-gray",
  'INVITED': 'text-white bg-error',
  'ACTIVE': 'text-white bg-green',
};
const name = (user) => {
  if (user && user.first_name && user.first_name != "") return user.first_name + " " + user.last_name;
  else return "No name";
}

let relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

export const SmartMUIDataTable = (props) => {
  const [isAlive, setIsAlive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [table, setTable] = useState({
      count: 100,
      page: 0
    }); 
  const query = useQuery();
  const history = useHistory();
  const [querys, setQuerys] = useState({});
  const [queryLimit, setQueryLimit] = useState(query.get("limit") || 10);
  const [queryOffset, setQueryOffset] = useState(query.get("offset") || 0);
  const [queryLike, setQueryLike] = useState(query.get("like") || "");

  const [firstColumnName, setFirstColumnName] = useState(props.firstColumnName)
  const [firstColumnLabel, setFirstColumnLabel] = useState(props.firstColumnLabel)
  const [secondColumnName, setSecondColumnName] = useState(props.secondColumnName)
  const [secondColumnLabel, setSecondColumnLabel] = useState(props.secondColumnLabel)
  const [thirdColumnName, setThirdColumnName] = useState(props.thirdColumnName)
  const [thirdColumnLabel, setThirdColumnLabel] = useState(props.thirdColumnLabel)
  const [fourthColumnName, setFourthColumnName] = useState(props.fourthColumnName)
  const [fourthColumnLabel, setFourtyhColumnLabel] = useState(props.fourthColumnLabel)

  const getAll = (query) => {
      const qs = query !== undefined ? Object.keys(query).map(key => `${key}=${query[key]}`).join('&') : ''; 
      return axios._get("SmartMUIDataTable", host + props.url + `${query ? '?'+ qs : ''}`)
  };

  useEffect(() => {
    setIsLoading(true);
    getAll({
      limit: query.get("limit") || 10,
      offset: query.get("offset") || 0,
      like: query.get("like") || ""
    })
      .then(({ data }) => {
        setIsLoading(false);
        if (isAlive) {
          setItems(data.results);
          setTable({ count: data.count });
        };
      }).catch(error => {
        setIsLoading(false);
      })
    return () => setIsAlive(false);
  }, []);

  const handlePageChange = (page, rowsPerPage, _like) => {
      setIsLoading(true);
      setQueryLimit(rowsPerPage);
      setQueryOffset(rowsPerPage * page);
      setQueryLike(_like);
      let query = {
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        like: _like
      }
      setQuerys(query);
      getAll(query)
        .then(({ data }) => {
            console.log(data)
          setIsLoading(false);
          setItems(data.results);
          setTable({ count: data.count, page: page });
          history.replace(`${props.queryUrl}?${Object.keys(query).map(key => key + "=" + query[key]).join("&")}`)
        }).catch(error => {
          setIsLoading(false);
        })
  }

  const resendInvite = (user) => {
    bc.auth().resendInvite(user)
      .then(({ data }) => console.log(data))
      .catch(error => console.log(error))
  }

  //LAS COLUMNAS SE RENDERIZAN SEGÚN LOS NOMBRES QUE LE PASAMOS AL COMPONENTE POR PROPS. 

  const columns = [
    {
      name: "id", // field name in the row object
      label: "ID", // column title that will be shown in table
      options: {
        filter: true,
      },
    },
    {
      name: firstColumnName, // field name in the row object
      label: firstColumnLabel,  // column title that will be shown in table
      options: {
        filter: true,
        customBodyRenderLite: (dataIndex) => {
          if(firstColumnName == "first_name"){ // STUDENTS VIEW
            let { user, ...rest } = items[dataIndex];
            return (
              <div className="flex items-center">
                <Avatar className="w-48 h-48" src={user?.imgUrl} />
                <div className="ml-3">
                  <h5 className="my-0 text-15">{user !== null ? name(user) : rest.first_name + " " + rest.last_name}</h5>
                  <small className="text-muted">{user?.email || rest.email}</small>
                </div>
              </div>
            );
          }
          if(firstColumnName == "stage"){ // COHORT VIEWS
            let item = items[dataIndex];
            return (
              <div className='flex items-center'>
                <div className='ml-3'>
                  <small className={"border-radius-4 px-2 pt-2px " + stageColors[item?.stage]}>
                    {item?.stage}
                  </small>
                  <br />
                  {((dayjs().isBefore(dayjs(item?.kickoff_date)) &&
                    ["INACTIVE", "PREWORK"].includes(item?.stage)) ||
                    (dayjs().isAfter(dayjs(item?.ending_date)) &&
                      !["ENDED", "DELETED"].includes(item?.stage))) && (
                    <small className='text-warning pb-2px'>
                      <Icon>error</Icon>Out of sync
                    </small>
                  )}
                </div>
              </div>
            );
          }
        },
      },
    },
    {
      name: secondColumnName,
      label: secondColumnLabel,
      options: {
        filter: true,
        filterList: query.get("slug") !== null ? [query.get("slug")] : [],
        customBodyRenderLite: i => {
          if(secondColumnName == "created_at"){ // STUDENT VIEW
            return (
            <div className="flex items-center">
              <div className="ml-3">
                <h5 className="my-0 text-15">{dayjs(items[i].created_at).format("MM-DD-YYYY")}</h5>
                <small className="text-muted">{dayjs(items[i].created_at).fromNow()}</small>
              </div>
            </div>
            )
          } 
          if(secondColumnName == "slug"){ // COHORT VIEW
            let item = items[i]; 
            return (
              <div className='flex items-center'>
                <div className='ml-3'>
                  <h5 className='my-0 text-15'>{item?.name}</h5>
                  <small className='text-muted'>{item?.slug}</small>
                </div>
              </div>
            );
          }
        }
      },
    },
    {
      name: thirdColumnName,
      label: thirdColumnLabel,
      options: {
        filter: true,
        filterList: query.get("kickoff_date") !== null ? [query.get("kickoff_date")] : [],
        customBodyRenderLite: (dataIndex, i) => {
          if(thirdColumnName == "status"){ // STUDENT VIEW
            let item = items[dataIndex]
            return (
              <div className="flex items-center">
                <div className="ml-3">
                  <small className={"border-radius-4 px-2 pt-2px" + stageColors[item.status]}>{item.status.toUpperCase()}</small>
                  {item.status == 'INVITED' && <small className="text-muted d-block">Needs to accept invite</small>}
                </div>
              </div>
            )
          }
          if(thirdColumnName == "kickoff_date"){ // COHORT VIEW
            return (
              <div className='flex items-center'>
                <div className='ml-3'>
                  <h5 className='my-0 text-15'>
                    {dayjs(items[i].kickoff_date).format("MM-DD-YYYY")}
                  </h5>
                  <small className='text-muted'>
                    {dayjs(items[i].kickoff_date).fromNow()}
                  </small>
                </div>
              </div>
            )
          }
          
        }
      },
    },
    {
      name: fourthColumnName,
      label: fourthColumnLabel,
      options: {
        filter: true,
        filterList: query.get("certificate") !== null ? [query.get("certificate")] : [],
        customBodyRenderLite: (i) =>{
          if(fourthColumnName == "certificate"){ // COHORT VIEW
            return items[i].certificate?.name;
          }
        } 
      },
    },
    {
      name: "action",
      label: " ",
      options: {
        filter: false,
        customBodyRenderLite: (dataIndex) => {
          if(props.title == "All Students"){ // STUDENT VIEW 
            let item = items[dataIndex].user !== null 
              ? (items[dataIndex]) 
              : ({ ...items[dataIndex], user: { first_name: "", last_name: "", imgUrl: "", id: "" } });
            return item.status === "INVITED" 
              ? (<div className="flex items-center">
                  <div className="flex-grow"></div>
                  <Tooltip title="Resend Invite">
                    <IconButton onClick={() => resendInvite(item.id)}>
                      <Icon>refresh</Icon>
                    </IconButton>
                  </Tooltip>
                </div>) 
              : <div className="flex items-center">
                <div className="flex-grow"></div>
                <Link to={`/admissions/students/${item.user !== null ? item.user.id : ""}`}>
                  <Tooltip title="Edit">
                    <IconButton>
                      <Icon>edit</Icon>
                    </IconButton>
                  </Tooltip>
                </Link>
              </div>
          }
          if(props.title == "All Cohorts"){ // COHORT VIEW
            return (
              <div className='flex items-center'>
                <div className='flex-grow'></div>
                <Link to={"/admissions/cohorts/" + items[dataIndex].slug}>
                  <IconButton>
                    <Icon>edit</Icon>
                  </IconButton>
                </Link>
                <Link to='/pages/view-customer'>
                  <IconButton>
                    <Icon>arrow_right_alt</Icon>
                  </IconButton>
                </Link>
              </div>
            )
          }
        },
      },
    }
  ];

  return (
    <MUIDataTable
      title={props.title}
      data={items}
      columns={columns}
      options={{
        download: false,
        filterType: "textField",
        responsive: "standard",
        serverSide: true,
        elevation: 0,
        count: table.count,
        page: table.page,
        selectableRowsHeader:false,
        rowsPerPage: querys.limit === undefined ? 10 : querys.limit,
        rowsPerPageOptions: [10, 20, 40, 80, 100],
        viewColumns: true,

        customToolbar: () => {
            return <DownloadCsv />;
          },
        
        onFilterChange: (
            changedColumn,
            filterList,
            type,
            changedColumnIndex
          ) => {
            let q = {
              ...querys,
              [changedColumn]: filterList[changedColumnIndex][0],
            };
            setQuerys(q);
            history.replace(`${props.queryUrl}?${Object.keys(q)
                .map((key) => `${key}=${q[key]}`)
                .join("&")}`
            );
          },
        
        customToolbarSelect: (selectedRows, displayData, setSelectedRows) => {
          return <CustomToolbar 
                      selectedRows={selectedRows} 
                      displayData={displayData} 
                      setSelectedRows={setSelectedRows} 
                      items={items} 
                      key={items} 
                      history={history}/>
          },

        onTableChange: (action, tableState) => {
          console.log(action, tableState);
            switch (action) {
                case "changePage":
                handlePageChange(tableState.page, tableState.rowsPerPage, queryLike);
                break;
                case "changeRowsPerPage":
                handlePageChange(tableState.page, tableState.rowsPerPage, queryLike);
                break;
            }
        },

        customSearchRender: (
            searchText,
            handleSearch,
            hideSearch,
            options
        ) => {
            return (
              <Grow appear in={true} timeout={300}>
                <TextField
                    variant="outlined"
                    size="small"
                    fullWidth
                    onKeyPress={(e) => {
                        if(e.key == "Enter"){
                            handlePageChange(queryOffset, queryLimit, e.target.value)
                    }}}
                    InputProps={{
                    style: {paddingRight: 0},
                    startAdornment: (
                      <Icon className="mr-2" fontSize="small">
                        search
                      </Icon>
                    ),
                    endAdornment: (
                      <IconButton onClick={hideSearch}>
                        <Icon fontSize="small">clear</Icon>
                      </IconButton>
                    ),
                    }}
                />
              </Grow>
            );
          },
      }}/>
    );
}

SmartMUIDataTable.propTypes = {
    title: PropTypes.string,
    url: PropTypes.string,
    queryUrl: PropTypes.string,
    firstColumnName: PropTypes.string,
    firstColumnLabel: PropTypes.string,
    secondColumnName: PropTypes.string,
    secondColumnLabel: PropTypes.string,
    thirdColumnName: PropTypes.string,
    thirdColumnLabel: PropTypes.string,
    fourthColumnName: PropTypes.string,
    fourthColumnLabel: PropTypes.string,
};