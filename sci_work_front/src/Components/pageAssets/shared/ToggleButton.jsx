import React from 'react'

import '../../../Styles/components/pageAssets/shared/ToggleButton.sass'

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