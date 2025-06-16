import { useEffect } from 'react'

const useTimer = (event, period, delay, isLoggedIn) => {

    useEffect(() => {
        if (!isLoggedIn || typeof event !== "function" || typeof period !== "number" || typeof delay !== "number") {
            console.log("Timer not started: invalid args", { isLoggedIn, event, period, delay })
            return
        }

        const runEvent = () => {
            const now = new Date()
            console.log("Tick at:", now.toLocaleTimeString(), period, delay)
            event(now, period, delay)
        }
  
        const now = new Date()
        const minutes = now.getMinutes()
        const seconds = now.getSeconds()
        const milliseconds = now.getMilliseconds()
  
        const minutesToNextMark = period - (minutes % period)
        const delayMin = minutesToNextMark * 60 * 1000 - (seconds * 1000 + milliseconds)
  
        let intervalId
  
        const timeoutId = setTimeout(() => {
            runEvent() // First call on the clean time
            intervalId = setInterval(runEvent, period * 60 * 1000)
        }, delayMin)
  
        // Proper cleanup
        return () => {
            clearTimeout(timeoutId)
            if (intervalId) clearInterval(intervalId)
        }
    }, [event, period, delay, isLoggedIn])
}

export default useTimer