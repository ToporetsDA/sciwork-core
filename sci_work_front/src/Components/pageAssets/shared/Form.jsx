
import { useState, useContext } from 'react'

import '../../../Styles/components/pageAssets/shared/Form.sass'

import { SPECIAL_DISPLAY_FIELDS } from '../../../lib/constants'
import { getInput } from '../../../lib/helpers'

import { AppContext } from '../pageAssets/shared'

const Form = (
    label,
    defaultData,
    dataToEdit,
    handleSpecialDisplay,
    save,
    alwaysEdit = false
) => {

    const {
        useLocale
    } = useContext(AppContext)

    const { t } = useLocale("pageAssets.shared.form")

    // ==================================
    // const, helpers and state management
    // ==================================

    const [editMode, setEditMode] = useState(false)
    const [tmpData, setTempData] = useState({ ...dataToEdit })
    const [errors, setErrors] = useState({})

    // ==================================
    // userData update management
    // ==================================
  
    const handleInputChange = (field, value) => {
        setTempData({ ...tmpData, [field]: value })
        setErrors({ ...errors, [field]: false }) // Clear error on change
    }


    const validateRequiredFields = () => {
        const newErrors = {}
        Object.entries(defaultData.basic).forEach(([key, [isRequired]]) => {
            console.log(key, isRequired, tmpData[key])
            if (isRequired && (!tmpData[key] || tmpData[key].trim() === '') && key !== "statusName") {
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

        save(tmpData)
        setEditMode(false)
    }

    // ==================================
    
    return (
        <div className="form-page .page-wrapper-no-cp">
            <h2>{label}</h2>
            <div className="form-info">
                {Object.entries(defaultData.basic).map(([key, [isRequired, type]]) => (
                    <div className="form-field" key={key}>
                        {(editMode || alwaysEdit) ? (
                            <>
                                {
                                    getInput(
                                        key,
                                        "text",
                                        SPECIAL_DISPLAY_FIELDS.includes(key)
                                            ? handleSpecialDisplay(key)
                                            : (tmpData[key] || ' '),
                                        false,
                                        (e) => {
                                            if (!defaultData.fixed.includes(key)) {
                                                handleInputChange(key, e.target.value)
                                            }
                                        },
                                        defaultData.fixed.includes(key),
                                        null,
                                        80
                                    )
                                }
                                <p className='required'>
                                    {isRequired && (editMode || alwaysEdit) && !defaultData.fixed.includes(key) && '*'}
                                </p>
                            </>
                        ) : (
                            getInput(
                                key,
                                "text",
                                SPECIAL_DISPLAY_FIELDS.includes(key)
                                    ? handleSpecialDisplay(key)
                                    : (tmpData[key] || ' '),
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
            <div className="form-actions">
                {(editMode || alwaysEdit) ? (
                    <>
                        <button
                            className='button-main'
                            onClick={saveChanges}
                            disabled={alwaysEdit && (dataToEdit === tmpData)}
                        >
                            {t("save")}
                        </button>
                        {!alwaysEdit &&
                        <button
                            className='button-main'
                            onClick={() => {
                                setTempData({ ...dataToEdit })
                                setEditMode(false)
                            }}
                        >
                            {t("cancel")}
                        </button>
                        }
                    </>
                ) : (
                    <button
                        className='button-main'
                        onClick={() => setEditMode(true)}
                    >
                        {t("edit")}
                    </button>
                )}
            </div>
        </div>
    )
}

export default Form