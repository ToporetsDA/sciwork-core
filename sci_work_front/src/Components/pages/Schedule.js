// Libraries
import { useState, useCallback, useMemo } from 'react'
// Styles, Classes, Constants
import '../../css/components/pages/Schedule.css'
import { DAYS_OF_WEEK, MONTHS } from '../../Basics/constants'
// Methods, Components
import * as Shared from './shared'
import ScheduleBoard from './specific/ScheduleBoard'

const Schedule = () => {

    //date data
    const now = useMemo(() => new Date(), [])
    const [intervalAnchor, setIntervalAnchor] = useState(now)

    const [currentScale, setCurrentScale] = useState('week')
    const [gridValues, setGridValues] = useState({ rows: 24, columns: 7 })

    //update displayed period
    const editIntervalAnchor = useCallback((val) => {
        setIntervalAnchor((prevAnchor) => {
            if (val === 0) {
                return now
            }
    
            const newAnchor = new Date(prevAnchor)
    
            switch (currentScale) {
                case 'week':
                    newAnchor.setDate(prevAnchor.getDate() + val * 7)
                    break
                case 'month':
                    newAnchor.setMonth(prevAnchor.getMonth() + val)
                    break;
                case 'year':
                    newAnchor.setFullYear(prevAnchor.getFullYear() + val)
                    break
                default:
            }
    
            return newAnchor
        })
    }, [currentScale, now])

    //calculate scale values
    const getWeekOfYear = (date) => {
        const startOfYear = new Date(date.getFullYear(), 0, 1)
        const diff = date - startOfYear
        const oneDay = 1000 * 60 * 60 * 24
        const weekNumber = Math.floor(diff / oneDay / 7)
        return weekNumber + 1 // Week number starts from 1
    }

    const scheduleBoard = {
        display: 'grid',
        gridTemplateRows: `repeat(${gridValues.rows}, 1fr)`,
        gridTemplateColumns: `repeat(${gridValues.columns}, 1fr)`,
        position: 'relative'
    }

    //schedule maps
    const scheduleVMap = useMemo(() => {

        if (currentScale === 'week' || currentScale === 'month') {
            
            // Get the start of the week based on the intervalAnchor
            const startOfWeek = new Date(intervalAnchor)
            const currentDay = startOfWeek.getDay()
            const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay
            startOfWeek.setDate(startOfWeek.getDate() + mondayOffset)
    
            return DAYS_OF_WEEK.map((day, index) => {
                const dayDate = new Date(startOfWeek)
                dayDate.setDate(dayDate.getDate() + index) // Increment day by index
                
                const formattedDate = `${String(dayDate.getDate()).padStart(2, '0')}.${String(dayDate.getMonth() + 1).padStart(2, '0')}`
                
                return (
                    <div key={'v-' + index} className="top-label">
                        {day} {(currentScale === 'week') && formattedDate}
                    </div>
                )
            })
        }
        if (currentScale === 'year') {
            return MONTHS.map((month, index) => <div key={'v-' + index} className="top-label">{month}</div>)
        }
        return []
    }, [currentScale, intervalAnchor])

    const scheduleHMap = useMemo(() => {

        let length
        switch(currentScale) {
            case 'week': {
                length = 24
                break
            }
            case 'month': {
                length = gridValues.rows
                break
            }
            case 'year': {
                length = 31
                break
            }
            default: {
                length = 0
            }
        }
        
        return Array.from({ length: length }).map((_, index) => {

            let itemInfo = ''
            switch (currentScale) {
                case 'week': {
                    itemInfo = `${index}:00`
                    break
                }
                case 'month': {
                    itemInfo = `Week ${index + getWeekOfYear(intervalAnchor)}`
                    break
                }
                case 'year': {
                    itemInfo = `${index + 1}`
                    break
                }
                default: {
                    itemInfo = ''
                }
            }

            return (
                <div key={`h-${index}`} className="left-label">
                    {itemInfo}
                </div>
            )
        })
        
    }, [currentScale, gridValues, intervalAnchor])

    return (
        <>
            <Shared.ControlPanel
                currentScale={currentScale}
                setCurrentScale={setCurrentScale}
                editIntervalAnchor={editIntervalAnchor}
            />
            <div className='schedule-container page-wrapper'>
                {currentScale === "week" &&
                    <p className='warning'>Not timed events are not displayed at weekly scale</p>
                }
                <p className='current-map'>
                {currentScale!=='year' && MONTHS[intervalAnchor.getMonth()]} {intervalAnchor.getFullYear()}
                </p>
                <div
                    className="schedule-v-map"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: scheduleBoard.gridTemplateColumns
                    }}>
                    {scheduleVMap}
                </div>
                <div
                    className='schedule-scrollable'
                >
                    <div
                        className="schedule-h-map"
                        style={{
                            display: 'grid',
                            gridTemplateRows: scheduleBoard.gridTemplateRows
                        }}
                    >
                        {scheduleHMap}
                    </div>
                    <ScheduleBoard
                        currentScale={currentScale}
                        setCurrentScale={setCurrentScale}
                        gridValues={gridValues}
                        setGridValues={setGridValues}
                        intervalAnchor={intervalAnchor}
                        scheduleBoard={scheduleBoard}
                    />
                </div>
            </div>
        </>
    )}

export default Schedule