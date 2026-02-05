
import { useState, useContext } from 'react'
import { useTranslation } from "react-i18next"

import '../../Styles/components/pages/Profile.sass'

import { getInput } from '../../lib/helpers'

import { AppContext } from '../pageAssets/shared'

const Profile = () => {

    const {
        setData,
        userData,
        profileData,
        rights
    } = useContext(AppContext)

    const { t } = useTranslation("pages.profile")

    // ==================================
    // const, helpers and state management
    // ==================================

    const [editMode, setEditMode] = useState(false)
    const [tmpUserData, setTempData] = useState({ ...userData })
    const [errors, setErrors] = useState({})

    // ==================================
    // userData update management
    // ==================================
  
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
        
        setData({
            domain: "user",
            id: userData._id,
            recipe: (draft) => {
                Object.assign(draft, tmpUserData)
            }
        })
        setEditMode(false)
    }

    // ==================================
    
    return (
        <div className="account-page .page-wrapper-no-cp">
            <h2>Profile Details</h2>
            {/* <div className='accountImage'>
                {userData.photo !== undefined &&
                    <></>
                }
            </div> */}
            <div className="account-info">
                {Object.entries(profileData.basic).map(([key, [isRequired, type]]) => (
                    <div className="account-field" key={key}>
                        {(editMode) ? (
                            <>
                                {
                                    getInput(
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
                                        null,
                                        80
                                    )
                                }
                                <p className='required'>
                                    {isRequired && editMode && !profileData.fixed.includes(key) && '*'}
                                </p>
                            </>
                        ) : (
                            getInput(
                                key,
                                "text",
                                key === 'statusName'
                                    ? (rights.names[userData.genStatus] || ' ')
                                    : (tmpUserData[key] || ' '),
                                false,
                                null,
                                true,
                                null,
                                80
                            )
                        )}
                    </div>
                ))}
            </div>
            <div className="account-actions">
                {editMode ? (
                    <>
                        <button
                            className='button-main'
                            onClick={saveChanges}
                        >
                            {t("actions.save")}
                        </button>
                        <button
                            className='button-main'
                            onClick={() => {
                                setTempData({ ...userData })
                                setEditMode(false)
                            }}
                        >
                            {t("actions.cancel")}
                        </button>
                    </>
                ) : (
                    <button
                        className='button-main'
                        onClick={() => setEditMode(true)}
                    >
                        {t("actions.edit")}
                    </button>
                )}
            </div>
        </div>
    )
}

export default Profile