const DaysTillEvent = (diff, date, time) => {
    const now = new Date()

    const [year, month, day] = date.split("-").map(Number)
    const [hours, minutes] = time.split(":").map(Number)
    const eventDate = new Date(year, month - 1, day, hours, minutes)

    const timeDiff = now - eventDate
    return (timeDiff <= diff * 24 * 60 * 60 * 1000)
    
}

export default DaysTillEvent