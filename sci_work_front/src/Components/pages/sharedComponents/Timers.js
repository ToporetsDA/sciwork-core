import { useEffect } from 'react'

const Timer = (period, event) => {

    useEffect(() => {
        
        const runEvent = () => {
            const now = new Date()
            console.log("Tick at:", now.toLocaleTimeString())
            event(now, period)
        }
  
        const now = new Date()
        const minutes = now.getMinutes()
        const seconds = now.getSeconds()
        const milliseconds = now.getMilliseconds()
  
        const minutesToNextMark = period - (minutes % period)
        const delay = minutesToNextMark * 60 * 1000 - (seconds * 1000 + milliseconds)
  
        let intervalId
  
        const timeoutId = setTimeout(() => {
            runEvent() // First call on the clean time
            intervalId = setInterval(runEvent, period * 60 * 1000)
        }, delay)
  
        // Proper cleanup
        return () => {
            clearTimeout(timeoutId)
            if (intervalId) clearInterval(intervalId)
        }
    }, [event, period])
}

export default Timer