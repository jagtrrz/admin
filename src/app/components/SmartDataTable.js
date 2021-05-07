import React, { useState, useEffect } from "react";
import { useQuery } from '../hooks/useQuery';
import { useHistory } from 'react-router-dom';
import PropTypes from "prop-types";
import axios from "../../axios";

import CustomToolbar from "./CustomToolbar";
import MUIDataTable from "mui-datatables";
import { Grow, Icon, IconButton, TextField } from "@material-ui/core";

import { DownloadCsv } from "./DownloadCsv";

const host = `${process.env.REACT_APP_API_HOST}/v1`

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

    const getAll = (query) => {
        const qs = query !== undefined ? Object.keys(query).map(key => `${key}=${query[key]}`).join('&') : ''; 
        return axios._get("SmartMUIDataTable", host + props.url + `${query ? '?'+ qs : ''}`)
    };

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
            history.replace(`${props.historyReplace}?${Object.keys(query).map(key => key + "=" + query[key]).join("&")}`)
          }).catch(error => {
            setIsLoading(false);
          })
    }

    //Revisar si tiene que ver con las columnas y ver si puedo añadir las columnas al componente. 

    const columns = [
        {
          name: "first_name", // field name in the row object
          label: "Name", // column title that will be shown in table
          options: {
            filter: true,
            customBodyRenderLite: (dataIndex) => {
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
            },
          },
        },
        {
          name: "created_at",
          label: "Created At",
          options: {
            filter: true,
            customBodyRenderLite: i =>
              <div className="flex items-center">
                <div className="ml-3">
                  <h5 className="my-0 text-15">{dayjs(items[i].created_at).format("MM-DD-YYYY")}</h5>
                  <small className="text-muted">{dayjs(items[i].created_at).fromNow()}</small>
                </div>
              </div>
          },
        },
        {
          name: "status",
          label: "Status",
          options: {
            filter: true,
            customBodyRenderLite: (dataIndex) => {
              let item = items[dataIndex]
              return <div className="flex items-center">
                <div className="ml-3">
                  <small className={"border-radius-4 px-2 pt-2px" + statusColors[item.status]}>{item.status.toUpperCase()}</small>
                  {item.status == 'INVITED' && <small className="text-muted d-block">Needs to accept invite</small>}
                </div>
              </div>
            }
          },
        },
        {
          name: "action",
          label: " ",
          options: {
            filter: false,
            customBodyRenderLite: (dataIndex) => {
              let item = items[dataIndex].user !== null ?
                (items[dataIndex]) :
                ({ ...items[dataIndex], user: { first_name: "", last_name: "", imgUrl: "", id: "" } });
              return item.status === "INVITED" ? (<div className="flex items-center">
                <div className="flex-grow"></div>
                <Tooltip title="Resend Invite">
                  <IconButton onClick={() => resendInvite(item.id)}>
                    <Icon>refresh</Icon>
                  </IconButton>
                </Tooltip>
              </div>) : <div className="flex items-center">
                <div className="flex-grow"></div>
                <Link to={`/admissions/students/${item.user !== null ? item.user.id : ""}`}>
                  <Tooltip title="Edit">
                    <IconButton>
                      <Icon>edit</Icon>
                    </IconButton>
                  </Tooltip>
                </Link>
              </div>
            },
          },
        }
      ];
  

  return (
    <MUIDataTable
        title={props.title}
        data={props.data}
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
                history.replace(`${props.historyReplace}?${Object.keys(q)
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
                                }
                            }}
                            InputProps={{
                            style: {
                                paddingRight: 0,
                            },
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
        }}
          />
    );
}

SmartMUIDataTable.propTypes = {
    title: PropTypes.string,
    data: PropTypes.any,
    columns: PropTypes.any,
    url: PropTypes.string,
    historyReplace: PropTypes.string
};