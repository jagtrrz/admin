import React, { useState } from "react";
import { Breadcrumb } from "matx";
import { Button } from "@material-ui/core";
import { Link } from "react-router-dom";
import { MatxLoading } from "matx";

import { SmartMUIDataTable } from "app/components/SmartDataTable";

const Cohorts = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className='m-sm-30'>
      <div className='mb-sm-30'>
        <div className='flex flex-wrap justify-between mb-6'>
          <div>
            <Breadcrumb
              routeSegments={[
                { name: "Admin", path: "/admin" },
                { name: "Cohorts" },
              ]}
            />
          </div>

          <div className=''>
            <Link
              to='/admissions/cohorts/new'
              color='primary'
              className='btn btn-primary'
            >
              <Button variant='contained' color='primary'>
                Add new cohort
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div className='overflow-auto'>
        <div className='min-w-750'>
          {isLoading && <MatxLoading />}
          <SmartMUIDataTable 
            title="All Cohorts"
            url="/admissions/academy/cohort"
            queryUrl="/admissions/cohorts"
            firstColumnName="stage"
            firstColumnLabel="Stage"
            secondColumnName="slug"
            secondColumnLabel="Slug"
            thirdColumnName="kickoff_date"
            thirdColumnLabel="Kickoff Date"
            fourthColumnName="certificate"
            fourthColumnLabel="Certificate"
          />
        </div>
      </div>
    </div>
  );
};

export default Cohorts;
