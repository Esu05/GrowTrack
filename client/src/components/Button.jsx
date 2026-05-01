import React from "react";

const Button = ({ title, containerClass, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={containerClass}
    >
      {title}
    </button>
  );
};

export default Button;