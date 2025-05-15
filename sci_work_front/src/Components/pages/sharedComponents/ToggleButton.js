import { useState, useEffect } from 'react'

const ToggleButton = ({userData, setUserData, displayOptions}) => {

    const [currentDisplayOption, setCurrentDisplayOption] = useState(userData.currentSettings.displayProjects)

    const handleDisplayOptionSelect = (option) => {
        setUserData({ displayProjects: option}, true)
    }

    useEffect(() => {
        if (userData) {
            setCurrentDisplayOption(userData.currentSettings.displayProjects)
        }
    }, [userData])
    
    return (
        <div className='displayProjects'>
            {displayOptions.map((option) => (
                <button
                key={option}
                className={`toggle-btn ${currentDisplayOption === option ? 'active' : ''}`}
                onClick={() => handleDisplayOptionSelect(option)}
                >
                {option}
                </button>
            ))}
        </div>
    )
}

export default ToggleButton