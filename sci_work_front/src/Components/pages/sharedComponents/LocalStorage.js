// In localStorage data:[{userId, data:[]}]
const LocalStorage = (get, name, _id, val) => {

    if (get === true) {
        const saved = localStorage.getItem(name)
        if (saved) {
            try {
            const parsed = JSON.parse(saved)
            console.log("from local storage", parsed)
                if (_id) {
                const userDataBlock = Array.isArray(parsed) ? parsed.find(entry => entry.userId === _id) : null
                return userDataBlock?.data || []
                }
                else {
                const userDataBlock = Array.isArray(parsed) ? parsed : null
                return userDataBlock || []
                }
            } catch (err) {
                console.error("Invalid localStorage data:", err)
            }
        }
        return []
    }
    else {
        localStorage.setItem(name, JSON.stringify(val))
    }
}

export default LocalStorage