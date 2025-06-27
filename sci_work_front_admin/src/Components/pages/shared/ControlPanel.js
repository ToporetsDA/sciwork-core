import { useState, useEffect }  from 'react'
import '../../../css/components/pages/shared/ControlPanel.css'

import * as Shared from './'

const ControlPanel = ({
    userData, setUserData,
    state, setState,
    rights,
    setItemsToDisplay,
    currentScale, setCurrentScale,
    editIntervalAnchor }) => {

    //search
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        setSearchQuery("")
    }, [state.currentProject])

    //filter items

    // const filterItems = useCallback((items) => {
    //     let filtered = items

    //     filtered = filtered.filter(item => !item.deleted || (item.deleted && rights.fullView.includes(item.access)))

    //     // Filter by state first
    //     if (currentStateOption !== "all") {
    //         filtered = filtered.filter(item => {

    //             const endDate = new Date(item.endDate)
    //             const timeDifference = (endDate - new Date()) / (24 * 60 * 60 * 1000) // days remaining
    //             if (currentStateOption === "expired" && timeDifference < 0) {
    //                 return true // Expired items
    //             }
    //             if (currentStateOption === "expiring" && timeDifference < 30 && timeDifference >= 0) {
    //                 return true // Expiring items (within 30 days)
    //             }
    //             return false
    //         })
    //     }

    //     // Filter by search query
    //     if (searchQuery.trim() !== "") {
    //         filtered = filtered.filter(item =>
    //             item.name.toLowerCase().includes(searchQuery.toLowerCase()) // Case-insensitive search
    //         )
    //         console.log(filtered)
    //     }

    //     return filtered
    // }, [currentStateOption, searchQuery, rights.fullView])

    //data to display

    //return data to display it

    return (
        <div className='control-panel'>
            {(state.currentPage === "Logs") &&
                <>
                    {Shared.getInput("Search", "text", searchQuery, false, (e) => setSearchQuery(e.target.value), false, null, 25)}
                </>
            }
            {(rights.edit.includes(userData.genStatus)
            && ["Users"].includes(state.currentPage))
            && (
                Shared.getDialogButton(
                    setState,
                    "add-item button-mini",
                    'AddUser',
                    [true, false],
                    "Add User",
                    false
                )
            )}
        </div>
    )}

export default ControlPanel