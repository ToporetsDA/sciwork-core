import { useState, useRef, useEffect } from 'react'
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
    itemStructure,
    defaultStructure,
    isCompany
}) => {
    const currentId = state.currentDialog.params[0]
    const type = state.currentDialog.params[1]
    const field = state.currentDialog.params[2]

    // const editorRef = useRef(null)
    // const [savedHtml, setSavedHtml] = useState('')
    // const [errors, setErrors] = useState({})

    const activity = Shared.GetItemById(activities, currentId)

    // useEffect(() => {
    //     if (activity && activity.content?.[field]) {
    //         setSavedHtml(activity.content[field])
    //     }
    // }, [activity, field])

    const closeDialog = () => {
        setState((prevState) => ({
            ...prevState,
            currentDialog: {
                name: undefined,
                params: []
            }
        }))
    }

    // const validation = () => {
    //     const errors = {}
    //     // Add any validation rules if needed
    //     return errors
    // }

    // const handleSave = () => {
    //     const newHtml = editorRef.current.innerHTML

    //     const errors = validation()
    //     if (Object.keys(errors).length > 0) {
    //         setErrors(errors)
    //         alert('Please fix the errors before saving.')
    //         return
    //     }

    //     // Clone the activity and update the field inside 'content'
    //     const updatedActivity = {
    //         ...activity,
    //         content: {
    //             ...activity.content,
    //             [field]: newHtml
    //         }
    //     }

    //     // Call the parent handler to store it
    //     console.log("I'll save activity", updatedActivity)
    //     setData({ action: "content", item: { type, activity: updatedActivity } })

    //     closeDialog()
    // }

    return (
        <div className="addEditContentDialog dialogContainer">
            <div className="dialogContent">

                <div className="dialogButtons">
                    {/* <button onClick={handleSave}>Save</button> */}
                    <button onClick={closeDialog}>Cancel</button>
                </div>
            </div>
        </div>
    )
}

export default AddEditContent