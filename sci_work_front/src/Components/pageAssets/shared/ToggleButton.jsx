import React from 'react'

import '../../../Styles/components/pageAssets/shared/ToggleButton.sass'

const ToggleButton = ({ data, setter, field, displayOptions, showDisplayOptions }) => {

  const showOptions = showDisplayOptions ?? displayOptions

  return (
    <div className="toggle-wrapper">
      {displayOptions.map((option, index) => (
        <button
          key={option}
          className={`toggle-btn ${data[field] === option ? 'active' : ''}`}
          onClick={() => setter({ [field]: option })}
        >
          {showOptions[index]}
        </button>
      ))}
    </div>
  )
}

export default ToggleButton