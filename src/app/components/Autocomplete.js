// *https://www.registers.service.gov.uk/registers/country/use-the-api*
import React from "react";
import { TextField, CircularProgress } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import useDebounce from "../hooks/useDebounce";
import PropTypes from "prop-types";

export function AsyncAutocomplete(props) {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [cache, setCache] = React.useState({})
  // Searching status (whether there is pending API request)
  const debouncedSearchTerm = useDebounce(searchTerm, 700);
  const { width, onChange, value, asyncSearch, children, debounced, label,required, ...rest } = props;
  const search = (searchTerm) => {
    setLoading(true);
    if(cache[searchTerm] !== undefined && debounced){
      setOptions(cache[searchTerm]);
      setLoading(false);
      console.log(cache)
    } else asyncSearch(searchTerm).then(({ data }) => {
      setLoading(false);
      setOptions(data);
      setCache({
       ...cache,
       [searchTerm]:data 
      });
      console.log(options)
    })
      .catch(error => console.log(error))
  }

  React.useEffect(() => {
    if (debounced) {
      if (debouncedSearchTerm) {
        search(debouncedSearchTerm);
      } else {
        setOptions([]);
      }
    } else{
      search();
    }
  }, [debouncedSearchTerm]);


  return (
    <>
      <Autocomplete
        {...rest}
        style={{ width: width }}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        value={value}
        onChange={(e, newValue) => {
          setOpen(false);
          onChange(newValue);
        }}
        options={options}
        loading={loading}
        renderInput={params => (
          <TextField
            {...params}
            label={label}
            fullWidth
            onChange={(e) => {
              setSearchTerm(e.target.value)
            }}
            required={required}
            variant="outlined"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </React.Fragment>
              )
            }}
          />
        )}
      />
      {children}
    </>
  );
}

AsyncAutocomplete.propTypes = {
	debounced: PropTypes.bool,
	children: PropTypes.any,
  label: PropTypes.string,
  asyncSearch: PropTypes.func,
  value: PropTypes.any,
  required:PropTypes.bool
};