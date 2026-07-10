import React from "react";
function VehicleCard({ vehicle, onViewDetails }) {
  const styles = {
    card: {
      background: "rgba(255,255,255,0.08)",
      backdropFilter: "blur(15px)",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: "18px",
      padding: "20px",
      color: "#fff",
      boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
      marginBottom: "20px",
      transition: "0.3s",
    },

    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "15px",
    },

    title: {
      margin: 0,
      fontSize: "22px",
    },

    info: {
      margin: "8px 0",
      fontSize: "15px",
    },

    button: {
      width: "100%",
      marginTop: "18px",
      padding: "12px",
      border: "none",
      borderRadius: "10px",
      background: "#4F8CFF",
      color: "#fff",
      fontSize: "15px",
      fontWeight: "bold",
      cursor: "pointer",
    },
  };

  const getStatusStyle = (status) => {
    let color = "#1DB954";

    if (status === "Idle") color = "#FFA500";
    if (status === "Offline") color = "#FF3B30";

    return {
      background: color,
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "13px",
      fontWeight: "bold",
      color: "#fff",
    };
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>🚚 {vehicle.id}</h3>
        <span style={getStatusStyle(vehicle.status)}>
          {vehicle.status}
        </span>
      </div>

      <p style={styles.info}>
        <strong>Truck No:</strong> {vehicle.truckNumber}
      </p>

      <p style={styles.info}>
        <strong>Driver:</strong> {vehicle.driver}
      </p>

      <p style={styles.info}>
        <strong>Speed:</strong> {vehicle.speed} km/h
      </p>

      <p style={styles.info}>
        <strong>Fuel:</strong> {vehicle.fuel}%
      </p>

      <button
        style={styles.button}
        onClick={() => onViewDetails(vehicle)}
      >
        View Details
      </button>
    </div>
  );
}

export default VehicleCard;