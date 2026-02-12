import { useState, useContext } from 'react'

import '../../Styles/components/dialogs/AddEditContent.sass'

import { TECH_FIELDS, FIELD_TYPES } from '../../lib/constants'
import { getInput, getItemById, getSelect } from '../../lib/helpers'

import { AppContext } from '../pageAssets/shared'

const AddEditContent = () => {

    const { //can not apply url-based itemIds in dialogs
        userData,
        activities,
        setData,
        setDialog,
        dialog,
        useLocale
    } = useContext(AppContext)

    const { t } = useLocale("dialogs.addEditContent")

    // ==================================
    // const, helpers and state management
    // ==================================

    let itemIndex = dialog.params[2]
    const containerId = dialog.params[3]
    const editType =  dialog.params[4]

    const activity = getItemById(activities, containerId)
    const listStructure = activity.content?.liStructure || {}
    const listItems = activity.content?.listItems || []

    const [newField, setNewField] = useState({ name: '', type: 'text' })

    const [formValues, setFormValues] = useState(() =>
        Object.keys(listStructure).reduce((acc, key) => {
            acc[key] = listStructure[key] === 'checkbox' ? false : ''
            return acc
        }, {})
    )

    const [structureFields, setStructureFields] = useState(() => ({ ...listStructure }))

    const [errors, setErrors] = useState({})

    // ==================================
    // form logic management
    // ==================================

    const handleStructureChange = (key, type) => {
        setStructureFields(prev => ({
            ...prev,
            [key]: type
        }))
    }

    //check special conditions. Will be added later
    const validate = () => {
        const newErrors = {}

        // 1. List structure must not be empty
        if (Object.keys(listStructure).length === 0) {
            newErrors["listStructure"] = 'empty'
        }

        // 2. If markable is enabled, perform checks
        if (activity.content?.currentSettings?.markable) {
            const { date, startTime, endTime } = formValues.markable || {}

            // A. Check if start time is after end time
            if (startTime && endTime) {
                const start = new Date(`2000-01-01T${startTime}`)
                const end = new Date(`2000-01-01T${endTime}`)
                if (start >= end) {
                    newErrors["markableTime"] = "Start time must be before end time"
                }
            }

            // B. Check if date is in the past (compared to today)
            if (date) {
                const today = new Date()
                const inputDate = new Date(date)
                today.setHours(0, 0, 0, 0) // Strip time from today
                inputDate.setHours(0, 0, 0, 0) // Strip time from input date

                if (inputDate < today) {
                    newErrors["markableDate"] = "Date cannot be in the past"
                }
            }
        }

        return newErrors
    }

    const handleSubmit = () => {
        const errors = validate()
        if (Object.keys(errors).length > 0) {
            setErrors(errors)
            alert('Please fix the errors before saving.')
            return
        }

        setData({
            domain: "activities",
            id: activity._id,
            recipe: (draft) => {
                if (!editType.includes("Structure")) {
                    // створюємо новий елемент
                    const newItem = {
                        ...formValues,
                        _id: draft._id + '.' + listItems.length,
                        creatorId: userData._id,
                        userList: [{ id: userData._id, access: 0 }]
                    }

                    if (draft.content?.currentSettings?.markable) {
                        newItem.markable = { userEntries: [] }
                    }

                    // вставляємо новий елемент у listItems
                    draft.content.listItems = [...listItems]
                    draft.content.listItems.splice(itemIndex + 1, 0, newItem)
                    itemIndex++
                } else {
                    draft.content.liStructure = { ...structureFields }
                    console.log("I updated structure")
                }
            }
        })
    }

    // ==================================
    // dialog logic
    // ==================================

    const closeDialog = () => {
        setDialog(prev => ({
            name: undefined,
            params: []
        }))
    }

    const handleInputChange = (e) => {
        const { name, value, type, checked, dataset } = e.target
        const section = dataset.section

        console.log("updating form values", name, value, type, checked, section)

        if (section === "markable") {
            setFormValues((prev) => ({
            ...prev,
            markable: {
                ...prev.markable,
                [name]: value,
            },
            }))
        } else {
            setFormValues((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
            }))
        }
    }

    // ==================================

    return (
        <div className="dialog-container">
            <div className="dialog-content">
                <form className="add-edit-content-dialog-form">
                    {(editType.includes("Structure")) ? (
                        <>
                            {Object.entries(structureFields).filter(([key, type]) => !TECH_FIELDS.includes(key)).map(([key, type]) => (
                                <div key={key}>
                                    {key !== "markable" &&
                                    <div
                                        className='field'
                                    >
                                        <p>{key}</p>
                                        {getSelect(
                                            type,
                                            (e) => handleStructureChange(key, e.target.value),
                                            FIELD_TYPES,
                                            FIELD_TYPES.map(opt =>
                                                t(`fields.structure.fieldTypes.${opt}`)
                                            )
                                        )}
                                        <button
                                            className="button-mini"
                                            type="button"
                                            onClick={() => {
                                                setStructureFields(prev => {
                                                    const updated = { ...prev }
                                                    delete updated[key]
                                                    return updated
                                                })
                                            }}
                                        >
                                            X
                                        </button>
                                    </div>
                                    }
                                </div>
                            ))}
                            <div className="add-field-form">
                                {getInput(
                                    t("fields.structure.fieldName.label"),
                                    t("fields.structure.fieldName.placeholder"),
                                    newField.name,
                                    undefined,
                                    e => setNewField(prev => ({ ...prev, name: e.target.value })),
                                    false,
                                    null,
                                    50
                                )}
                                {getSelect(
                                    newField.type,
                                    (e) => setNewField(prev => ({ ...prev, type: e.target.value })),
                                    FIELD_TYPES,
                                    FIELD_TYPES.map(opt =>
                                        t(`fields.structure.fieldTypes.${opt}`)
                                    )
                                )}
                                <button
                                    className="button-mini"
                                    type="button"
                                    onClick={() => {
                                        const { name, type } = newField
                                        if (name && !(name in structureFields)) {
                                            setStructureFields(prev => ({
                                                ...prev,
                                                [name]: type
                                            }))
                                            setNewField({ name: '', type: 'text' })
                                        }
                                    }}
                                >
                                    {t("buttons.add")}
                                </button>
                            </div>
                            {/* <p className='warning'>WARNING: deletion of a field will erase it from existing entries!</p> */}
                        </>
                    ) : (
                        Object.entries(structureFields).filter(([key, type]) => !TECH_FIELDS.includes(key)).map(([key, type]) => {
                            switch(type) {
                                case "text": {
                                    return (
                                        <label key={key}>
                                            {getInput(
                                                key,
                                                t(`fields.values.text.placeholder`),
                                                formValues[key] || "",
                                                false,
                                                handleInputChange,
                                                false,
                                                null,
                                                50
                                            )}
                                            {errors[key] && <span className="error">{errors[key]}</span>}
                                        </label>
                                    )
                                }
                                case "checkbox": {
                                    return (
                                        <label key={key}>
                                            <input
                                                type="checkbox"
                                                name={key}
                                                checked={formValues[key] || false}
                                                onChange={handleInputChange}
                                            />
                                            {key}
                                        </label>
                                    )
                                }
                                case "markable": {
                                    return (
                                        <div key={key} className="markable-wrapper">
                                            <label><strong>{key}</strong></label>
                                            <div>
                                                <label>
                                                    {getInput(
                                                        "date",
                                                        t("fields.values.markable.date"),
                                                        formValues.markable?.date || "",
                                                        false,
                                                        handleInputChange,
                                                        false,
                                                        "markable",
                                                        50
                                                    )}
                                                </label>
                                                <label>
                                                    {getInput(
                                                        "startTime",
                                                        t("fields.values.markable.start"),
                                                        formValues.markable?.startTime || "",
                                                        false,
                                                        handleInputChange,
                                                        false,
                                                        "markable",
                                                        50
                                                    )}
                                                </label>
                                                <label>
                                                    {getInput(
                                                        "endTime",
                                                        t("fields.values.markable.end"),
                                                        formValues.markable?.endTime || "",
                                                        false,
                                                        handleInputChange,
                                                        false,
                                                        "markable",
                                                        50
                                                    )}
                                                </label>
                                            </div>
                                        </div>
                                    )
                                }
                                default: {
                                    return (
                                    <div key={key}></div>
                                    )
                                }
                            }
                        })
                    )}
                </form>

                <div className="dialog-actions">
                    <button
                        className='button-main'
                        onClick={handleSubmit}
                    >
                        {t("actions.save")}
                    </button>
                    <button
                        className='button-main'
                        onClick={closeDialog}
                    >
                        {t("actions.back")}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AddEditContent