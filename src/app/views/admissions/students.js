import React, { useState } from "react";
import { Breadcrumb } from "matx";
import { MatxLoading } from "matx";
import { Button } from "@material-ui/core";
import { Link } from "react-router-dom";

import { SmartMUIDataTable } from "app/components/SmartDataTable";


const Students = () => {
  const [isLoading, setIsLoading] = useState(false); 

  return (
    <div className="m-sm-30">
      <div className="mb-sm-30">
        <div className="flex flex-wrap justify-between mb-6">
          <div>
            <Breadcrumb
              routeSegments={[
                { name: "Admissions", path: "/" },
                { name: "Students" },
              ]}
            />
          </div>

          <div className="">
            <Link to={`/admissions/students/new`}>
              <Button variant="contained" color="primary">
                Add new student
            </Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="overflow-auto">
        <div className="min-w-750">
          {isLoading && <MatxLoading />}
          <SmartMUIDataTable 
            title="All Students"
            url="/auth/academy/student"
            queryUrl="/admissions/students"
            firstColumnName="first_name"
            firstColumnLabel="Name"
            secondColumnName="created_at"
            secondColumnLabel="Created At"
            thirdColumnName="status"
            thirdColumnLabel="Status"
            fourthColumnName=""
            fourtyhColumnLabel=""
          />
        </div>
      </div>
    </div>
  );
};

export default Students;
