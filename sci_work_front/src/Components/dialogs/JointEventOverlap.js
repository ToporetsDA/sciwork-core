// Libraries
import { useContext } from 'react'
//Styles, Classes, Constants
import '../../css/components/dialogs/JointEventOverlap.css'
//Methods, Components
import * as Shared from '../pages/shared'

const JointEventOverlapDialog = () => {

    const {
        projects,
        setState
    } = useContext(Shared.AppContext)

    // Close the dialog

    const closeDialog = (e) => {
        if (e.target === e.currentTarget) {
            setState((prevState) => ({
                ...prevState,
                currentDialog: {
                    name: undefined,
                    params: []
                }
            }))
        }
    }

    return (
        <div
            className="dialog-container"
            onClick={closeDialog}
        >
            <div className="dialog-content">
                <Shared.ItemTable
                    itemsToDisplay={projects}
                    itemKeys={["name", "startDate", "endDate"]}
                    //itemTypes
                    editable={false}
                    isItem={true}
                    //linkActions
                />
                <button
                    className='button-main'
                    onClick={closeDialog}
                >
                    Back
                </button>
            </div>
        </div>
    )
}

export default JointEventOverlapDialog