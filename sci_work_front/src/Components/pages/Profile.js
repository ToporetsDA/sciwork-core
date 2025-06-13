import { useState } from 'react'
import '../../css/components/pages/Profile.css'

import * as Shared from './sharedComponents'

const Profile = ({ userData, setUserData, profileData, rights }) => {

    const [editMode, setEditMode] = useState(false)
    const [tmpUserData, setTempData] = useState({ ...userData })
    const [errors, setErrors] = useState({})
  
    const handleInputChange = (field, value) => {
        setTempData({ ...tmpUserData, [field]: value })
        setErrors({ ...errors, [field]: false }) // Clear error on change
    }
  
    const validateRequiredFields = () => {
        const newErrors = {}
        Object.entries(profileData.basic).forEach(([key, [isRequired]]) => {
            console.log(key, isRequired, tmpUserData[key])
            if (isRequired && (!tmpUserData[key] || tmpUserData[key].trim() === '') && key !== "statusName") {
            newErrors[key] = true // Mark field as invalid
            }
        })
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0 // Return true if no errors
    }

    const saveChanges = () => {
        if (!validateRequiredFields()) {
            alert("Please fill out all required fields.")
            return
        }
        setUserData({...userData, ...tmpUserData}, false)
        setEditMode(false)
    }
    
    return (
        <div className="accountPage .page-wrapper-no-cp">
            <h2>Profile Details</h2>
            {/* <div className='accountImage'>
                {userData.photo !== undefined &&
                    <></>
                }
            </div> */}
            <div className="accountInfo">
                {Object.entries(profileData.basic).map(([key, [isRequired, type]]) => (
                    <div className="accountField" key={key}>
                        {(editMode) ? (
                            <>
                                {Shared.GetInput(
                                    key,
                                    "text",
                                    key === 'statusName'
                                        ? (rights.names[userData.genStatus] || ' ')
                                        : (tmpUserData[key] || ' '),
                                        false,
                                    (e) => {
                                        if (!profileData.fixed.includes(key)) {
                                            handleInputChange(key, e.target.value)
                                        }
                                    },
                                    profileData.fixed.includes(key),
                                    80
                                )}
                                <p className='required'>
                                    {isRequired && editMode && !profileData.fixed.includes(key) && '*'}
                                </p>
                            </>
                        ) : (
                            Shared.GetInput(
                                key,
                                "text",
                                key === 'statusName'
                                    ? (rights.names[userData.genStatus] || ' ')
                                    : (tmpUserData[key] || ' '),
                                false,
                                null,
                                true,
                                80
                            )
                        )}
                    </div>
                ))}
            </div>
            <div className="accountActions">
                {editMode ? (
                    <>
                        <button
                            className='button-main'
                            onClick={saveChanges}
                        >
                            Save
                        </button>
                        <button
                            className='button-main'
                            onClick={() => {
                                setTempData({ ...userData })
                                setEditMode(false)
                            }}
                        >
                            Cancel
                        </button>
                    </>
                ) : (
                    <button
                        className='button-main'
                        onClick={() => setEditMode(true)}
                    >
                        Edit Profile
                    </button>
                )}
            </div>
        </div>
    )
}

export default Profile

/*!!! for beta-version !!!

permission list

profile image

locale related settings
last login dateTime

account status          (active, disabled, suspended)

list of devices         (optional, may be required)
list of allowed devices (optional)

more organisation data  (like class, department) (optional)
*/