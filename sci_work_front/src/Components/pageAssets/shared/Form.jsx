
import { useState, useContext } from 'react'

import '../../../Styles/components/pageAssets/shared/Form.sass'

import { getInput, getSelect } from '../../../lib/helpers'

import { AppContext } from '../pageAssets/shared'

/* from:
pages/Settings.js
pages/Profile.js
*/

const Form = (
    label,
    dataFormat,
    dataToEdit,
    handleSpecial,
    save,
    immediateApply = false,
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

    const fixedSet = new Set(dataFormat.fixed)

    // ==================================
    // userData update management
    // ==================================

    const getField = (element, key, value, params) => {
        switch (element) {
            case "input": {
                const { type, handler, disabled = true } = params
                return getInput(
                    key,
                    type,
                    "",
                    value || '',
                    false,
                    handler,
                    disabled,
                    null,
                    80
                )
            }

            case "select": {
                const { handler, options, disabled = true } = params
                const displayOprions = options.map(opt => opt.toString())
                return getSelect(
                    value,
                    handler,
                    options,
                    displayOprions,
                    disabled
                )
            }

            default:
                console.warn(`Unknown field type '${element}'`)
        }
    }


    const validateRequiredFields = () => {
        const newErrors = errors

        Object.entries(dataFormat.basic).forEach(([key, [isRequired]]) => {

            const value = tmpData[key]
            const isEmpty =
                value === null ||
                value === undefined ||
                (typeof value === "string" && value.trim() === '')
            
            if (
                isRequired &&
                isEmpty &&
                !fixedSet.has(key))
            {
                newErrors[key] = true // Mark field as invalid
            }
        })

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0 // Return true if no errors
    }

    const handleSubmit = () => {
        if (!validateRequiredFields()) {
            alert("Please fill out all required fields.")
            return
        }

        save(tmpData)
        setEditMode(false)
    }

    const updateField = (key, value) => {
        const specialKeys = Object.keys(dataFormat.special)
        const v = (specialKeys.includes(key))
            ? handleSpecial(key, value)
            : value
            
        setTempData(prev => {
            const updated = { ...prev, [key]: v }

            if (immediateApply) {
                save(updated)
            }

            return updated
        })

        setErrors(prev => ({ ...prev, [key]: false }))
    }

    // ==================================
    
    return (
        <div className="form-page .page-wrapper-no-cp">
            <h2>{label}</h2>
            <div className="form-info">
                {Object.entries(dataFormat.basic).map(([key, value]) => {

                    const elementType = (value.type === "select") ? "select" : "input"

                    return (
                        <div className="form-field" key={key}>
                            {getField(
                                elementType,
                                key,
                                tmpData[key] || '',
                                {
                                    type: value.type,
                                    handler: (editMode || alwaysEdit)
                                        ? (e) => {
                                            if (!fixedSet.has(key)) {
                                                updateField(key, e.target.value)
                                            }
                                        }
                                        : null,
                                    disabled: !(editMode || alwaysEdit) || fixedSet.has(key),
                                    options: value?.options || []
                                }
                            )}
                        </div>
                    )
                })}
            </div>
            {!immediateApply && (
                <div className="form-actions">
                    {(editMode || alwaysEdit) ? (
                        <>
                            <button
                                className='button-main'
                                onClick={handleSubmit}
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
            )}
        </div>
    )
}

export default Form