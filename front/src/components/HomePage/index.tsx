import React from "react";
import "./homepage.css";

const HomePage = ({title, subtitle}) => {
  return (
    <>
      <h1 className="main-title">{title}</h1>
      <h2 className="subtitle">
        {subtitle}
      </h2>
    </>
  );
};

export default HomePage;
