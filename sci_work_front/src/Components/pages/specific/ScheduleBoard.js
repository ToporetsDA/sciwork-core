import { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate } from "react-router-dom"
import '../../../css/components/pages/specific/ScheduleBoard.css'

import * as Shared from '../shared'

const ScheduleBoard = ({
    projects,
    state, setState,
    currentScale, setCurrentScale,
    gridValues, setGridValues,
    intervalAnchor,
    scheduleBoard,
    recentActivities, setRecentActivities
}) => {

    const navigate = useNavigate()
    const goTo = Shared.goTo

    const projectId = (id) => {
        return id.split('.')[0]
    }

    //calculate scale values
    const getDaysInMonth = useCallback((month, year) => {
        return new Date(year, month, 0).getDate()
    }, [])

    const [firstDay, setFirstDay] = useState(
        new Date(intervalAnchor.getMonth() + 1, intervalAnchor.getFullYear() - 1, 1).getDay()
    )

    const firstDayOfMonth = useMemo(() => {
        return (firstDay === 0) ? 7 : firstDay
    }, [firstDay])

    const [lastDayOfMonth, setLastDayOfMonth] = useState(
        new Date(intervalAnchor.getMonth() + 1, intervalAnchor.getFullYear(), 0).getDay()
    )
    
    const [totalDaysInMonth, setTotalDaysInMonth] = useState(
        getDaysInMonth(intervalAnchor.getMonth() + 1, intervalAnchor.getFullYear())
    )

    const weeksInMonth = useCallback((month, year) => {
        setFirstDay(new Date(year, month - 1, 1).getDay())
        setLastDayOfMonth(new Date(year, month, 0).getDay())
        setTotalDaysInMonth(getDaysInMonth(month, year))
        const fullWeeks = Math.floor((totalDaysInMonth + firstDayOfMonth) / 7)
        // Return total weeks: full weeks + 1 if there's a partial week at the end of month
        return fullWeeks + (lastDayOfMonth !== 0 ? 1 : 0)
    }, [getDaysInMonth, firstDayOfMonth, lastDayOfMonth, totalDaysInMonth])

    //set grid resolution
    useEffect(() => {
        if (currentScale === 'week') {
            setGridValues({
                rows: 24,
                columns: 7
            })
        } else if (currentScale === 'month') {
            setGridValues({
                rows: weeksInMonth(intervalAnchor.getMonth() + 1, intervalAnchor.getFullYear()),
                columns: 7
            })
        } else if (currentScale === 'year') {
            setGridValues({
                rows: 31,
                columns: 12
            })
        }
    }, [currentScale, weeksInMonth, intervalAnchor, setCurrentScale, setGridValues])

    //schedule BG like a simple calendar
    const scheduleCells = Array.from({ length: gridValues.rows * gridValues.columns }).map((_, index) => (
        <div
            key={'cell-' + index}
            className="schedule-cell"
            style={{
                backgroundColor: (currentScale === 'week')
                ? ''
                : (
                    (currentScale === 'month') ? (
                        (index+1 - (firstDayOfMonth-1) <= 0 || index+1 - (firstDayOfMonth-1) > totalDaysInMonth)
                        ? 'lightgray'
                        : ''
                    ) : (//currentScale === 'year'
                        (Math.floor(index/12)+1 > getDaysInMonth(index % 12 + 1, intervalAnchor.getFullYear()))
                        ? 'lightgray'
                        : ''
                    )
                )
            }}
        >
            {currentScale === 'month' && index+1 - (firstDayOfMonth-1) > 0 && index+1 - (firstDayOfMonth-1) <= totalDaysInMonth &&
                `${index+1 - (firstDayOfMonth-1)}`
            }
            {currentScale === 'year' && (Math.floor(index/12)+1 <= getDaysInMonth(index % 12 + 1, intervalAnchor.getFullYear())) &&
                `${Math.floor(index/12)+1}`
            }
        </div>
    ))

    // Determine data to display based on the scale
    //I need to modify data first! I mean creating start-end activities before filtering by rangeToDisplay

    const formatDate = (date) => {
        const year = date.getFullYear()
        const month = (date.getMonth() + 1).toString().padStart(2, '0') // Add leading zero if needed
        const day = date.getDate().toString().padStart(2, '0') // Add leading zero if needed
        return `${year}-${month}-${day}`
    }

    const rangeToDisplay = useMemo(() => ({
        week: {
            start: new Date(intervalAnchor.getFullYear(), intervalAnchor.getMonth(), intervalAnchor.getDate() - ((intervalAnchor.getDay() === 0) ? 6 : intervalAnchor.getDay() - 1)),
            end: new Date(intervalAnchor.getFullYear(), intervalAnchor.getMonth(), intervalAnchor.getDate() - ((intervalAnchor.getDay() === 0) ? 6 : intervalAnchor.getDay() - 1) + 7),
        },
        month: {
            start: new Date(intervalAnchor.getFullYear(), intervalAnchor.getMonth(), 1),
            end: new Date(intervalAnchor.getFullYear(), intervalAnchor.getMonth() + 1, 0),
        },
        year: {
            start: new Date(intervalAnchor.getFullYear(), 0, 1),
            end: new Date(intervalAnchor.getFullYear(), 11, 31),
        },
    }), [intervalAnchor])

    // ranged data for current scale
    const scaledData = useMemo(() => {
        if (!projects) return []
    
        const filteredActivities = projects
            .flatMap(project => Shared.treeToArray(project.activities, "activities"))
            .flatMap(activity => {
    
                if (activity.startDate === activity.endDate) {// Single-day activity
                    return [{
                        ...activity,
                        eventId: activity._id
                    }]
                }
    
                // Multi-day activity
                const startItem = {
                    ...activity,
                    name: `${activity.name} - Start`,
                    startDate: activity.startDate,
                    endDate: activity.startDate,
                    type: 'activity',
                    eventId: activity._id + '.start'
                }
                const endItem = {
                    ...activity,
                    name: `${activity.name} - End`,
                    startDate: activity.endDate,
                    endDate: activity.endDate,
                    type: 'activity',
                    eventId: activity._id + '.end'
                }

                let repeatItems = []

                repeatItems.push(startItem)

                if (activity.repeat === true) {
                    let start = new Date(activity.startDate)
                    start.setDate(start.getDate() + 1)
                    const end = new Date(activity.endDate)
                    const daysOfWeek = activity.days.map(day => {
                        switch(day) {
                            case 'Mon': return 1
                            case 'Tue': return 2
                            case 'Wed': return 3
                            case 'Thu': return 4
                            case 'Fri': return 5
                            case 'Sat': return 6
                            case 'Sun': return 0
                            default: return -1
                        }
                    })
            
                    // Loop through the days between startDate and endDate
                    for (let d = new Date(start + 1); d < end; d.setDate(d.getDate() + 1)) {
                        // Check if the day is one of the repeating days
                        if (daysOfWeek.includes(d.getDay())) {

                            const repeatItem = {
                                ...activity,
                                name: `${activity.name} - Repeat (${d.toLocaleDateString()})`,
                                startDate: formatDate(d),
                                endDate: formatDate(d),
                                type: 'activity',
                                eventId: activity._id + '_' + d.toLocaleDateString() // Use the date as part of the ID to make it unique
                            }
            
                            repeatItems.push(repeatItem)
                        }
                    }
                }

                repeatItems.push(endItem)
    
                return repeatItems
            })

        const filteredProjects = projects.flatMap(project => {
    
            const startItem = {
                ...project,
                name: `${project.name} - Start`,
                startDate: project.startDate,
                endDate: project.startDate,
                type: 'project',
                eventId: project._id + '_0',
                page: true
            }
            const endItem = {
                ...project,
                name: `${project.name} - End`,
                startDate: project.endDate,
                endDate: project.endDate,
                type: 'project',
                eventId: project._id + '_1',
                page: true
            }

            return [startItem, endItem]
        })

        const { start, end } = rangeToDisplay[currentScale]

        const dataForScale = (currentScale === 'week') ? (
            filteredActivities.filter(activity => activity?.isTimed === true)
        ) : (
            [ ...filteredActivities, ...filteredProjects]
        )

        const rangedData = dataForScale
            .filter(event => {
                const projectStart = new Date(event.startDate)
                const projectEnd = new Date(event.endDate)
                return projectEnd >= start && projectStart <= end
            })
    
        return rangedData
    }, [projects, currentScale, rangeToDisplay])

    // scaledData with grouped overlaps
    const scaledDataWithOverlaps = useMemo(() => {

        const overlaps = []
        // Sort events by start time/date
        scaledData.sort((a, b) => (currentScale === "week" ? a.startTime - b.startTime : a.startDate - b.startDate))
      
        // Group overlapping events
        scaledData.forEach((event, i) => {

            const overlapGroup = [event]

            for (let j = i + 1; j < scaledData.length; j++) {

                const nextEvent = scaledData[j]

                if (// all events last 1 day
                    (currentScale === "week" && nextEvent.startDate === event.startDate && ((nextEvent.startTime < event.endTime && nextEvent.endTime > event.startTime) || (event.startTime < nextEvent.endTime && event.endTime > nextEvent.startTime))) ||
                    (currentScale !== "week" && nextEvent.startDate === event.startDate)
                ) {
                    overlapGroup.push(nextEvent)
                }
            }

            // Check if any existing group contains any of the events in overlapGroup
            const isContained = overlaps.some(existingGroup => 
                overlapGroup.every(newEvent => 
                    existingGroup.some(existingEvent => existingEvent.eventId === newEvent.eventId) // assuming _id is the unique identifier
                )
            )

            if (!isContained) {
                overlaps.push(overlapGroup)
            }
        })
      
        return overlaps
    }, [currentScale, scaledData])

    // events rendered as <div></div>s
    const renderEvents = useCallback((group, i, content, isJoint, zIndex) => {

        const eventStart = new Date(`${group[i].startDate}T${group[i].startTime || "00:00"}`)
        const tmp = group
        if (currentScale === "week" && group.length > 3) {
            tmp.sort((a, b) => (b.endTime - a.endTime))
        }
        const eventEnd = new Date(`${tmp[i].endDate}T${tmp[i].endTime || "00:00"}`)
        
        const dayOfWeek = ((eventStart.getDay() === 0) ? 7 : eventStart.getDay()) - 1 // 0-6 (Monday - Sunday)
        const dayOfMonth = eventStart.getDate() // 1 - 28-31
        
        const startHour = eventStart.getHours()
        const startMinutes = eventStart.getMinutes()
        const endHour = eventEnd.getHours()
        const endMinutes = eventEnd.getMinutes()

        let part = (isJoint) ? 1 : group.length //size of group element

        let top, left, bottom, right

        let space

        switch(currentScale) {
            case "week": {
                part = 100 / 7 / part
                space = part / 100

                top = 100 / 24 * (startHour + (startMinutes / 60))
                left = (100 / 7 * dayOfWeek) + (part * i)
                bottom = 100 / 24 * (endHour + (endMinutes / 60))
                right = left + (part)
                break
            }
            case "month": {
                const weeks = weeksInMonth(intervalAnchor.getMonth() + 1, intervalAnchor.getFullYear())
                part = 100 / weeks / part
                space = part / 100

                top = (100 / weeks * Math.floor((dayOfMonth + firstDayOfMonth - 1) / 7)) + (part * i)
                left = 100 / 7 * dayOfWeek
                bottom = top + (part)
                right = left + (100 / 7)
                break
            }
            case "year": {
                part = 100 / 31 / part
                space = part / 100
                
                top = (100 / 31 * (dayOfMonth - 1)) + (part * i)
                left = 100 / 12 * eventStart.getMonth()
                bottom = top + (part)
                right = left + (100 / 12)
                break
            }
            default:
        }

        return (
            <div
                key={'event-' + group[i].eventId}
                className={`event ${(isJoint) ? `overlap-bg` : `event-bg`}`}
                style={{
                    zIndex: `${zIndex}`,
                    width: `${right - left - space}%`,
                    height: `${bottom - top -  space}%`,
                    position: 'absolute',
                    top: `${top}%`,
                    left: `${left}%`
                }}
                onClick={() => {
                    (isJoint) ? (
                        setState((prevState) => ({
                            ...prevState,
                            currentDialog: {
                                name: 'JointEventOverlap',
                                params: [group]
                            }
                        }))
                    ) : (
                        navigate(goTo(group[i], projects, recentActivities, setRecentActivities))
                    )
                }}
            >
                {content}
            </div>
        )
    }, [currentScale, firstDayOfMonth, projects, setState, weeksInMonth, intervalAnchor, goTo, navigate, recentActivities, setRecentActivities])

    //schedule events as <div></div>s to display
    const eventsToDisplay = useMemo(() => {

        const getContent = (item, showStartEnd, start, end) => {
            let content = ``

            if (item?.type === 'activity') {
                content += `${Shared.getItemById(projects, projectId(item._id)).name}: `
            }

            content += `${item.name}\n`

            if (showStartEnd) {
                content += `Start at ${item[start]}\nEnd at${item[end]}`
            }
            return content
        }

        const eventDivs = scaledDataWithOverlaps.flatMap((group, i) => {

            const isTimed = group[i]?.startTime && group[i]?.endTime

            if (group.length <= 2) {// event, overlaps of 2 events events

                const groupDivs = group.flatMap((event, i) => {
                    
                    const content = (currentScale === 'week') ? (
                        getContent(group[i], isTimed, "startTime", "endTime")
                    ) : (
                        getContent(group[i], true, "startDate", "endDate")
                    )
                    
                    return renderEvents(group, i, content, false, 2)
                })
                
                return groupDivs
            }
            else if (group.length > 2) { // Joint block

                let content = ``
                group.forEach((event, i) => {
                    content += getContent(event, false)
                })

                return [renderEvents(group, 0, content, true, 3)]
            }
            else {
                return []
            }
        })

        //move text to visible part of event if any
        eventDivs.forEach((event) => {
            const overlapEvent = document.querySelector(`.overlapEvent[data-id="${event._id}"]`)
            if (overlapEvent) {
                const eventText = document.querySelector(`.event[data-id="${event._id}"] .text`)
                if (eventText) {
                  eventText.style.top = `${overlapEvent.offsetHeight}px` // Adjust text to visible area
                }
            }
        })

        return eventDivs
        
    }, [projects, currentScale, renderEvents, scaledDataWithOverlaps])

    return (
        <div
            className="schedule"
            style={scheduleBoard}
        >
            {scheduleCells}
            {eventsToDisplay}
        </div>
    )}

export default ScheduleBoard