import React from "react";
import VehicleCard from "../components/VehicleCard.jsx";
import vehicles from "../data/vehicles.js";

function VehiclePage() {

  return (
    <div className="vehicle-page">

      <h1>Vehicle Management</h1>

      <div className="vehicle-container">

        {
          vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
            />
          ))
        }

      </div>

    </div>
  );
}

export default VehiclePage;