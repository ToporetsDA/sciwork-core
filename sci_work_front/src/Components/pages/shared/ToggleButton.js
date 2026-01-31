//import React from 'react'

import '../../../css/components/pages/shared/ToggleButton.css'

const ToggleButton = ({ data, setter, field, displayOptions }) => {
  return (
    <div className="toggle-wrapper">
      {displayOptions.map(option => (
        <button
          key={option}
          className={`toggle-btn ${data[field] === option ? 'active' : ''}`}
          onClick={() => setter({ [field]: option }, true)}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

export default ToggleButton