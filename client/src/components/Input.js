import React from "react";

const Input = ({ label, value, setValue, type = "text", placeholder }) => (
  <div className="mb-4" style={{textAlign: 'left'}}>
    <span style={{fontSize: '16px', color: '#000', marginBottom: '10px'}}>{label}</span>
    <input
      type={type}
      onChange={(e) => setValue(e.target.value)}
      value={value}
      placeholder={placeholder}
      className="form-control"
    />
  </div>
);

export default Input;
