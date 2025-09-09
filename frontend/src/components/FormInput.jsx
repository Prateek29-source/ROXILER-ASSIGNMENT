import React from 'react';

const FormInput = ({ label, name, type = 'text', value, onChange, required = true }) => {
    return (
        <div className="form-group">
            <label>{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
            />
        </div>
    );
};

export default FormInput;
