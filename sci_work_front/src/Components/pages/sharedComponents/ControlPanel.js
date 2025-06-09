import { useState, useEffect, useRef, useMemo, useCallback }  from 'react'
import '../../../css/pages/sharedComponents/ControlPanel.css'

import * as Shared from './'

const ControlPanel = ({
    userData, setUserData,
    state, setState,
    projects,
    activities,
    rights,
    setItemsToDisplay,
    currentScale,
    setCurrentScale,
    editIntervalAnchor }) => {

    const filterOptions = {
        sort: ["A-Z", "Z-A", "start date", "end date"],
        state: ["all", "expired", "expiring"]
    }

    //to display combobox options
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false)
    const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false)
    //current combobox values
    const [currentSortOption, setCurrentSortOption] = useState(userData.currentSettings.sortFilter)
    const [currentStateOption, setCurrentStateOption] = useState(userData.currentSettings.stateFilter)
    //toggle switch(s)
    const displayOptions = ["tiles", "list", "table"]
    //search
    const [searchQuery, setSearchQuery] = useState("")

    const sortDropdownRef = useRef(null)
    const stateDropdownRef = useRef(null)

    useEffect(() => {
        setSearchQuery("")
    }, [state.currentProject])

    const getAccess = (item) => {
        return item.userList.find(item => item.id === userData._id).access
    }

    //update filter values

    useEffect(() => {
        if (userData) {
            setCurrentSortOption(userData.currentSettings.sortFilter)
            setCurrentStateOption(userData.currentSettings.statusFilter)
        }
    }, [userData])

    const handleSortOptionSelect = (option) => {
        setUserData({ sortFilter: option }, true)
        setIsSortDropdownOpen(false)
    }

    const handleStateOptionSelect = (option) => {
        setUserData({statusFilter: option}, true)
        setIsStateDropdownOpen(false)
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

    useState(() => {
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
        return items.sort((a, b) => {
            if (currentSortOption === "A-Z") {
                return a.name.localeCompare(b.name)
            }
            if (currentSortOption === "Z-A") {
                return b.name.localeCompare(a.name)
            }
            if (currentSortOption === "start date") {
                return new Date(a.startDate) - new Date(b.startDate)
            }
            if (currentSortOption === "end date") {
                return new Date(a.endDate) - new Date(b.endDate)
            }
            return 0
        })
    }, [currentSortOption])

    //filter items

    const filterItems = useCallback((items) => {
        let filtered = items

        filtered = filtered.filter(item => !item.deleted || (item.deleted && rights.fullView.includes(item.access)))

        // Filter by state first
        if (currentStateOption !== "all") {
            filtered = filtered.filter(item => {

                const endDate = new Date(item.endDate)
                const timeDifference = (endDate - new Date()) / (24 * 60 * 60 * 1000) // days remaining
                if (currentStateOption === "expired" && timeDifference < 0) {
                    return true // Expired items
                }
                if (currentStateOption === "expiring" && timeDifference < 30 && timeDifference >= 0) {
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
    }, [currentStateOption, searchQuery, rights.fullView])

    //data to display

    const projectsToDisplay = useMemo(() => {
        return projects ? filterItems(sortItems([...projects])) : []
    }, [projects, filterItems, sortItems])

    const activitiesToDisplay = useMemo(() => {
        const activities = Shared.GetItemById(projects, state.currentProject).activities
        return Array.isArray(activities)
            ? filterItems(sortItems([...activities]))
            : []
    }, [projects, state.currentProject, filterItems, sortItems])

    //return data to display it
    useEffect(() => {
        setItemsToDisplay({
            projects: projectsToDisplay,
            activities: activitiesToDisplay
        })
    }, [projectsToDisplay, activitiesToDisplay, setItemsToDisplay])

    return (
        <div className='controlPanel'>
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="searchInput"
            />
            {state.currentPage === "Schedule" &&
                <div className='scale'>
                    <select
                        id="scale"
                        value={currentScale}
                        onChange={(e) => setCurrentScale(e.target.value)}
                    >
                        <option value="week">Week</option>
                        <option value="month">Month</option>
                        <option value="year">Year</option>
                    </select>
                    <button className='moveSchedulePage' onClick={() => editIntervalAnchor(-1)}>
                        Prev.
                    </button>
                    <button className='moveSchedulePage' onClick={() => editIntervalAnchor(0)}>
                        To now
                    </button>
                    <button className='moveSchedulePage' onClick={() => editIntervalAnchor(1)}>
                        Next
                    </button>
                </div>
            }
            {(state.currentPage === "Projects" || state.currentPage === "Project"  || state.currentPage === "Activity") &&
                <>
                    {userData.currentSettings.displayProjects !== "table" &&
                    <div className='sortAndFilter'>
                        <div>
                            <button
                                className="filterButton"
                                onClick={() => {setIsSortDropdownOpen(!isSortDropdownOpen)}}
                                ref={sortDropdownRef}
                            >
                                {currentSortOption}
                            </button>
                            {isSortDropdownOpen && (
                                <ul className="dropdown">
                                    {filterOptions.sort.map((option, index) => (
                                        <li key={index} onClick={() => { handleSortOptionSelect(option)}}>
                                            {option}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div>
                            <button
                                className="filterButton"
                                onClick={() => setIsStateDropdownOpen(!isStateDropdownOpen)}
                                ref={stateDropdownRef}
                            >
                                {currentStateOption}
                            </button>
                            {isStateDropdownOpen && (
                                <ul className="dropdown">
                                    {filterOptions.state.map((option, index) => (
                                        <li key={index} onClick={() => handleStateOptionSelect(option)}>
                                            {option}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                    }
                    {((state.currentPage !== "Projects")
                    && ((state.currentProject) ? rights.edit.includes(getAccess(Shared.GetItemById(projects, state.currentProject))) : false))
                    && (
                        <div>
                        {Shared.GetDialogButton(
                            setState,
                            "addItem",
                            'AddEditUserList',
                            [true],
                            "Add/Edit users",
                            false
                        )
                        }
                        </div>
                    )}
                </>
            }
            {(state.currentPage === "Projects") &&
                <Shared.ToggleButton
                    data={userData.currentSettings}
                    setter={setUserData}
                    field={"displayProjects"}
                    displayOptions={displayOptions}
                />
            }
            {(rights.edit.includes(userData.genStatus)
            && ["Projects"].includes(state.currentPage))
            && (
                Shared.GetDialogButton(
                    setState,
                    "addItem",
                    'AddEditItem',
                    [true, false],
                    "New Project",
                    false
                )
            )}
        </div>
    )}

export default ControlPanel