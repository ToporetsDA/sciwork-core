import { useState, useEffect, useRef, useMemo, useCallback, useContext }  from 'react'

import '../../../Styles/components/pageAssets/shared/ControlPanel.sass'

import { DISPLAY_OPTIONS_CONTROLS } from '../../../lib/constants'
import { getDialogButton, getInput, getItemById } from '../../../lib/helpers'

import { AppContext, CustomSelect, ToggleButton } from '.'

const ControlPanel = ({
    setItemsToDisplay,
    currentScale, setCurrentScale,
    editIntervalAnchor
}) => {

    const {
        currentPage, projectId,
        userData,
        projects,
        setData,
        setDialog,
        rights
    } = useContext(AppContext)

    // ==================================
    // const, helpers and state management
    // ==================================

    const filterOptions = {
        sort: ["A-Z", "Z-A", "start date", "end date"],
        state: ["all", "expired", "expiring"]
    }

    //to display combobox options
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false)
    const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false)
    //search
    const [searchQuery, setSearchQuery] = useState("")

    const sortDropdownRef = useRef(null)
    const stateDropdownRef = useRef(null)

    

    const getAccess = (item) => {
        return item.userList.find(item => item.id === userData._id).access
    }

    // ==================================
    // tools logic management
    // ==================================

    //update filter values

    useEffect(() => {
        setSearchQuery("")
    }, [projectId])

    const handleOptionSelect = (option, filter) => {
        
        setData({
            domain: "user",
            id: userData._id,
            recipe: (draft) => {
                draft.currentSettings[filter] = option
            }
        })

        const type = filter.replace("Filter", "")
        switch(type) {
            case "sort": {
                setIsSortDropdownOpen(false)
                break
            }
            case "status": {
                setIsStateDropdownOpen(false)
                break
            }
            default: {
                console.warn("No such filter!")
            }
        }
    }

    //close filter option lists on click outside

    const handleClickOutside = useCallback((event) => {
        if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
            if (isSortDropdownOpen) {
                setIsSortDropdownOpen(false)
            }
            if (isStateDropdownOpen) {
                setIsStateDropdownOpen(false)
            }
        }
    }, [isSortDropdownOpen, isStateDropdownOpen])

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [handleClickOutside])

    //sort items

    const sortItems = useCallback((items) => {
        if (items.length === 0) {
            return []
        }

        const option = userData.currentSettings.sortFilter

        return items.sort((a, b) => {
            if (option === "A-Z") {
                return a.name.localeCompare(b.name)
            }
            if (option === "Z-A") {
                return b.name.localeCompare(a.name)
            }
            if (option === "start date") {
                return new Date(a.startDate) - new Date(b.startDate)
            }
            if (option === "end date") {
                return new Date(a.endDate) - new Date(b.endDate)
            }
            return 0
        })
    }, [userData.currentSettings.sortFilter])

    //filter items 

    const filterItems = useCallback((items) => {
        let filtered = items

        filtered = filtered.filter(item => !item.deleted || (item.deleted && rights.fullView.includes(item.access)))

        // Filter by state first
        const stateOption = userData.currentSettings.statusFilter
        if (stateOption !== "all") {
            filtered = filtered.filter(item => {

                const endDate = new Date(item.endDate)
                const timeDifference = (endDate - new Date()) / (24 * 60 * 60 * 1000) // days remaining
                if (stateOption === "expired" && timeDifference < 0) {
                    return true // Expired items
                }
                if (stateOption === "expiring" && timeDifference < 30 && timeDifference >= 0) {
                    return true // Expiring items (within 30 days)
                }
                return false
            })
        }

        // Filter by search query
        if (searchQuery.trim() !== "") {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) // Case-insensitive search
            )
            console.log(filtered)
        }

        return filtered
    }, [userData.currentSettings.statusFilter, searchQuery, rights.fullView])

    // ==================================
    // display logic management
    // ==================================

    //data to display

    const projectsToDisplay = useMemo(() => {
        return projects ? filterItems(sortItems([...projects])) : []
    }, [projects, filterItems, sortItems])

    const activitiesToDisplay = useMemo(() => {
        const activities = getItemById(projects, projectId).activities
        return Array.isArray(activities)
            ? filterItems(sortItems([...activities]))
            : []
    }, [projects, projectId, filterItems, sortItems])

    //return data to display it
    useEffect(() => {
        setItemsToDisplay({
            projects: projectsToDisplay,
            activities: activitiesToDisplay
        })
    }, [projectsToDisplay, activitiesToDisplay, setItemsToDisplay])

    //toggleButton adapter
    const handleToggle = (updateObj) => {
        const field = Object.keys(updateObj)[0]
        const option = updateObj[field]
        handleOptionSelect(option, field)
    }

    // ==================================

    return (
        <div className='control-panel'>
            {(currentPage === "Projects") &&
                <>
                    {getInput("Search", "text", searchQuery, false, (e) => setSearchQuery(e.target.value), false, null, 25)}
                    <ToggleButton
                        data={userData.currentSettings}
                        setter={handleToggle}
                        field={"displayProjects"}
                        displayOptions={DISPLAY_OPTIONS_CONTROLS}
                    />
                </>
            }
            {currentPage === "Schedule" &&
                <div className='scale'>
                    <CustomSelect
                        id={"server"}
                        name={"server"}
                        value={currentScale}
                        handler={(e) => setCurrentScale(e.target.value)}
                        options={[{value: "week"}, {value: "month"}, {value: "year"}]}
                        optionSelectField={"value"}
                        optionContentField={"value"}
                        placeholder={"Select server"}
                        emptyPlaceholder={"No servers available"}
                        disabled={false}
                    />
                    <button className='move-schedule-page button-mini' onClick={() => editIntervalAnchor(-1)}>
                        Prev.
                    </button>
                    <button className='move-schedule-page button-mini' onClick={() => editIntervalAnchor(0)}>
                        To now
                    </button>
                    <button className='move-schedule-page button-mini' onClick={() => editIntervalAnchor(1)}>
                        Next
                    </button>
                </div>
            }
            {(currentPage === "Projects" || currentPage === "Project"  || currentPage === "Activity") &&
                <>
                    {userData.currentSettings.displayProjects !== "table" && currentPage === "Projects" &&
                    <div className='sort-and-filter'>
                        <div>
                            <button
                                className="filter-button  button-mini"
                                onClick={() => {setIsSortDropdownOpen(!isSortDropdownOpen)}}
                                ref={sortDropdownRef}
                            >
                                {userData.currentSettings.sortFilter}
                            </button>
                            {isSortDropdownOpen && (
                                <ul className="dropdown">
                                    {filterOptions.sort.map((option, index) => (
                                        <li key={index} onClick={() => { handleOptionSelect(option, "sortFilter")}}>
                                            {option}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div>
                            <button
                                className="filter-button  button-mini"
                                onClick={() => setIsStateDropdownOpen(!isStateDropdownOpen)}
                                ref={stateDropdownRef}
                            >
                                {userData.currentSettings.statusFilter}
                            </button>
                            {isStateDropdownOpen && (
                                <ul className="dropdown">
                                    {filterOptions.state.map((option, index) => (
                                        <li key={index} onClick={() => handleOptionSelect(option, "statusFilter")}>
                                            {option}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                    }
                    {((currentPage !== "Projects")
                    && ((projectId) ? rights.edit.includes(getAccess(getItemById(projects, projectId))) : false))
                    && (
                        <div>
                        {getDialogButton(
                            setDialog,
                            "add-item button-mini",
                            'AddEditUserList',
                            [projectId],
                            "Add/Edit users",
                            false
                        )
                        }
                        </div>
                    )}
                </>
            }
            {(rights.edit.includes(userData.genStatus)
            && ["Projects"].includes(currentPage))
            && (
                getDialogButton(
                    setDialog,
                    "add-item button-mini",
                    'AddEditItem',
                    [true, false],
                    "New Project",
                    false
                )
            )}
        </div>
    )}

export default ControlPanel