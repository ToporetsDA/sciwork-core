import { useState } from 'react'
import '../../css/dialogs/AddEditContent.css'
import '../../css/dialogs/dialog.css'

import * as Shared from '../pages/sharedComponents'

const AddEditContent = ({
    userData, setUserData,
    projects,
    activities,
    setData,
    state, setState,
    rights,
    isCompany
}) => {

    const itemIndex = state.currentDialog.params[2]
    const containerId = state.currentDialog.params[3]

    const activity = Shared.GetItemById(activities, containerId)
    const listStructure = activity.content?.liStructure || {}
    const listItems = activity.content?.listItems || []

    console.log("activity", activity, containerId)

    const [editType, setEditType] = useState({type: "Items"})


    const [formValues, setFormValues] = useState(() =>
        Object.keys(listStructure).reduce((acc, key) => {
            acc[key] = listStructure[key] === 'checkbox' ? false : ''
            return acc
        }, {})
    )

    const [structureFields, setStructureFields] = useState(() => ({ ...listStructure }))

    const [errors, setErrors] = useState({})

    //handle dialog behaviors

    const closeDialog = () => {
        setState(prev => ({
            ...prev,
            currentDialog: { name: undefined, params: [] }
        }))
    }

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormValues(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleStructureChange = (key, type) => {
        setStructureFields(prev => ({
            ...prev,
            [key]: type
        }))
    }

    //check special conditions. Will be added later
    const validate = () => {
        const newErrors = {}
        //structure can not be empty
        if (Object.keys(listStructure).length === 0) {
            newErrors["listStructure"] = 'empty'
        }
        // for (const key in listStructure) {
        //     const val = formValues[key]
        //     if (listStructure[key] === 'checkbox') continue
        //     if (typeof val === 'string' && val.trim() === '') {
        //         newErrors[key] = 'Required'
        //     }
        // }
        return newErrors
    }

    const handleSubmit = () => {

        const errors = validate()
        if (Object.keys(errors).length > 0) {
            setErrors(errors)
            alert('Please fix the errors before saving.')
            return
        }

        const updatedActivity = { ...activity }

        if (editType === "Structure") {
            updatedActivity.content.liStructure = { ...structureFields }
        }
        else {
            const newItem = {
                _id: activity._id + '.' + listItems.length,
                ...formValues
            }

            updatedActivity.content.listItems = [...listItems]
            updatedActivity.content.listItems.splice(itemIndex + 1, 0, newItem)
        }

        setData({
            action: "content",
            item: {
                type: "List",
                activity: updatedActivity
            }
        })

        closeDialog()
    }

    return (
        <div className="addEditContentDialog dialogContainer">
            <div className="dialogContent">
                <Shared.ToggleButton
                    data={editType}
                    setter={setEditType}
                    field={"type"}
                    displayOptions={['Structure', 'Items']}
                />

                <form className="dialogForm">
                    {(editType.type === "Structure") ? (
                        <>
                            {Object.entries(structureFields).map(([key, type]) => (
                                <div key={key}>
                                    <label>{key}</label>
                                    <select value={type} onChange={(e) => handleStructureChange(key, e.target.value)}>
                                        <option value="text">text</option>
                                        <option value="html">html</option>
                                        <option value="checkbox">checkbox</option>
                                    </select>
                                </div>
                            ))}
                            <p className='warning'>WARNING: deletion of a field will erase it from existing entries!</p>
                        </>
                    ) : (
                        Object.entries(listStructure).map(([key, type]) => {
                            if (type === 'checkbox') {
                                return (
                                    <label key={key}>
                                        <input
                                            type="checkbox"
                                            name={key}
                                            checked={formValues[key]}
                                            onChange={handleInputChange}
                                        />
                                        {key}
                                    </label>
                                )
                            }
                            else {
                                return (
                                    <label key={key}>
                                        {key}
                                        <input
                                            type="text"
                                            name={key}
                                            value={formValues[key]}
                                            onChange={handleInputChange}
                                        />
                                        {errors[key] && <span className="error">{errors[key]}</span>}
                                    </label>
                                )
                            }
                        })
                    )}
                </form>

                <div className="dialogButtons">
                    <button onClick={handleSubmit}>Save</button>
                    <button onClick={closeDialog}>Cancel</button>
                </div>
            </div>
        </div>
    )
}

export default AddEditContent