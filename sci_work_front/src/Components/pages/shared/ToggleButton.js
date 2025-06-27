import { useState, useEffect } from 'react'

import '../../../css/components/pages/shared/ToggleButton.css'

const ToggleButton = ({data, setter, field, displayOptions}) => {

    const [currentOption, setCurrentOption] = useState(data[field])

    const handleDisplayOptionSelect = (option) => {
        setter({ [field]: option}, true)
    }

    useEffect(() => {
        if (data) {
            setCurrentOption(data[field])
        }
    }, [data, field])
    
    return (
        <div className='toggle-wrapper'>
            {displayOptions.map((option) => (
                <button
                key={option}
                className={`toggle-btn ${currentOption === option ? 'active' : ''}`}
                onClick={() => handleDisplayOptionSelect(option)}
                >
                {option}
                </button>
            ))}
        </div>
    )
}

export default ToggleButton