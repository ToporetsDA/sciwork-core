
import { useState, useEffect, useMemo, useCallback } from 'react'

import '../../../Styles/components/pageAssets/shared/Form.sass'

import { getInput, getSelect } from '../../../lib/helpers'

/* from:
pages/Settings.js
pages/Profile.js
*/

const FormExtended = (
    dataFormat,
    dataToEdit,
    handleSpecial,
    save,
    callSave,
    tmpData,
    setTempData,
    editMode = true,
    immediateApply = false,
    alwaysEdit = false
) => {

    // ==================================
    // const, helpers and state management
    // ==================================

    const [errors, setErrors] = useState({})

    const fixedSet = useMemo(
        () => new Set(dataFormat.fixed || []),
        [dataFormat.fixed]
    )

    useEffect(() => {
        setTempData({ ...dataToEdit })
    }, [setTempData, dataToEdit])

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
                const displayOptions = options.map(opt => opt.toString())
                return getSelect(
                    value,
                    handler,
                    options,
                    displayOptions,
                    disabled
                )
            }

            default:
                console.warn(`Unknown field type '${element}'`)
        }
    }

    const validateRequiredFields = useCallback(() => {
        const newErrors = {}

        Object.entries(dataFormat.basic).forEach(([key, value]) => {

            const isRequired = value.required
            const val = tmpData[key]
            
            const isEmpty =
                val === null ||
                val === undefined ||
                (typeof val === "string" && val.trim() === '')
            
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
    }, [dataFormat.basic, fixedSet, tmpData])

    const handleSubmit = useCallback(() => {
        if (!validateRequiredFields()) {
            alert("Please fill out all required fields.")
            return
        }

        save(tmpData)
    }, [save, tmpData, validateRequiredFields])

    useEffect(() => {
        callSave.current = handleSubmit
    }, [callSave, handleSubmit])

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
        <div className="form-info">
            {Object.entries(dataFormat.basic).map(([key, value]) => {

                const elementType = (value.type === "select") ? "select" : "input"

                return (
                    <div className="form-field" key={key}>
                        {errors[key] &&
                            <p>!</p>
                        }
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
    )
}

export default FormExtended