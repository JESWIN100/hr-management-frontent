import React from 'react';
import './SubtleButton.css'; // Assuming you saved the CSS above in this file

const SubtleButton = ({ 
  variant = 'primary', 
  children, 
  className = '', 
  ...props 
}) => {
  // Construct the class name based on the variant prop
  const buttonClass = `btn-subtle btn-subtle-${variant} ${className}`;

  return (
    <button className={buttonClass.trim()} {...props}>
      {children}
    </button>
  );
};

export default SubtleButton;