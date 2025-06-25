import { useState, useRef, useEffect, useCallback } from 'react'
import useWebSocket from 'react-use-websocket'

import LogIn from './dialogs/LogIn'

// import * as Shared from './pages/shared'

const Connection = ({
    state, setState,
    userData, setUserData,
    isLoggedIn, setLoggedIn,
    setRights,
    setUsers,
    isUserUpdatingItems, setIsUserUpdatingItems,
    isUserUpdatingUserData, setIsUserUpdatingUserData,
    previousVersionsRef
}) => {

    const [servers, setServers] = useState([])
    const [loading, setLoading] = useState(true)
    const [sessionToken, setToken] = useState()
    const [formValues, setFormValues] = useState()
    const [wsUrl, setWsUrl] = useState(null)

    const format = (str) => {
        return str.replace(/\s+/g, '')
    }

    //create server address string
    const serverAddress = (address) => {
        // Get the address without the scheme (http:// or https://)
        let serverAddress = address.split('://')[1]
        
        // Remove trailing slash if present
        if (serverAddress.endsWith('/')) {
            serverAddress = serverAddress.slice(0, -1)
        }
        
        // Extract the domain and port
        const [domain, port] = serverAddress.split(':')
        
        // Increment the port by 1
        const newPort = parseInt(port, 10) + 1
        
        // Reassemble the address with the new port
        return `${domain}:${newPort}`
    }

    const { sendMessage, readyState } = useWebSocket(wsUrl, {
        onOpen: () => {
            console.log('WebSocket connection established.')
            // Send the login message after the connection is established
            sendMsg("login", { login: formValues.login });
        },
        onClose: () => console.log('WebSocket connection closed'),
        onMessage: (event) => handleResponse(event),
        onError: (error) => {
            console.error('WebSocket error:', error)
        },
        shouldReconnect: () => true, // Reconnect on disconnection
        queryParams: { token: sessionToken }, // Optional query params
        share: true // Share the WebSocket instance between components
    })

    // Callback to send a message
    const sendMsg = useCallback((type, data) => {
        const message = {
            type: type,          // e.g., "login"
            sessionToken,        // Auth token
            data: data,          // Payload data
            timestamp: new Date().toISOString(), // Optional timestamp
        }

        // Send the message as a JSON string
        sendMessage(JSON.stringify(message))
        console.log('Sent message:', message)

         // Reset flags
        setIsUserUpdatingItems(false)
        setIsUserUpdatingUserData(false)
    }, [sendMessage, sessionToken, setIsUserUpdatingItems, setIsUserUpdatingUserData])

    const handleResponse = useCallback((event) => {
        console.log("from handleResponse: ")
        try {
            const response = JSON.parse(event.data)
            console.log(response) // This will log the entire response
        
            // Now, you can access specific parts of the response
            switch(response.message) {
            case "data": {
                const { type, data } = response.data
        
                console.log("Received data type:", type)
                console.log("Fetched data:", data)
        
                // You can handle the data based on the type (user, projects, etc.)
                switch (type) {
                    case "all": {
                        setUserData(data.user)
                        console.log(data.items)
                        setRights(data.organisation.rights)
                        setUsers(data.users)
                        break
                    }
                    case "users": {
                        setUsers(data)
                        break
                    }
                    case "user": {
                        setUserData(data)
                        break
                    }
                    case "organisation": {
                        setRights(data.organisation.rights)
                        break
                    }
                    default: {
                        console.log("Unknown data type:", type)
                    }
                }
                break
            }
            case "confirm": {
                const { data, error } = response.data
                console.log("confirm item", response.data, data.id, error)
                if (error) {
                    const backup = previousVersionsRef.current[data.id]
                    if (backup) {
                        if (data.id === userData._id) {
                        setUserData(backup)
                        } else {
                            // editors
                        }
                    }
                    delete previousVersionsRef.current[data.id] // clean up
                }
                else {
                    // notify user that update happened and increment its __v
                    if (data.id === userData._id) {
                        setUserData((prevData) => ({
                            ...prevData,
                            __v: prevData.__v + 1
                        }))
                    }
                    else {
                        //editors
                    }

                    if (data.id in previousVersionsRef.current) {
                        delete previousVersionsRef.current[data.id]
                    }

                    console.log(data.id, "updated successfully")
                }
                break
            }
            default: {
                console.log("Unknown message: ", response.message)
            }
            }
            setLoggedIn(true);
        } catch (error) {
            console.error("Error processing message:", error.message)
        }
    }, [setLoggedIn, setRights, setUsers, userData._id, setUserData, previousVersionsRef])

    //send update ONLY when page changes
    const lastSentPage = useRef({
        currentPage: 'HomePage'
    })
    useEffect(() => {
        if ((lastSentPage.current.currentPage === state.currentPage) || !isLoggedIn) {
            return
        }
        const location = state.currentProject || state.currentPage
        sendMsg("goTo", { page: format(location), isId: false })
        lastSentPage.current = state
    }, [sendMsg, state, isLoggedIn])

    // Track user-initiated changes to data
    const updateByUser = useCallback((item, toDo, itemType) => {

        if (readyState === 1) { // Check if WebSocket is open
            sendMsg(toDo, item)
            console.log("Sent update:")
        } else {
            console.error(`WebSocket is not open. Cannot send ${itemType} update.`)
        }

    }, [readyState, sendMsg])

    // Trigger user-initiated updates
    useEffect(() => {
        if (isUserUpdatingItems) {
            // updateByUser(isUserUpdatingItems, "editor")
        }
        if (isUserUpdatingUserData) {
            updateByUser(userData, "addEditUser", "user")
        }
    }, [userData, updateByUser, isUserUpdatingItems, isUserUpdatingUserData])

    //on login
    const loginToServer = async (formValues) => {
        const selectedServer = servers.find((server) => server.id === formValues.server)
    
        if (!selectedServer) {
            alert("Invalid server selected.")
            return
        }
    
        try {
            const response = await fetch(`${selectedServer.address}/admin/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login: formValues.login, password: formValues.password })
            })

            if (response.status === 200) {
                console.log('Login successful')
                const data = await response.json()
                setToken(data.sessionToken)

                setFormValues(formValues)

                // Set WebSocket URL dynamically
                const wsAddress = `ws://${serverAddress(selectedServer.address)}`
                setWsUrl(wsAddress)

                console.log('WebSocket URL:', wsAddress)
            }
            else {
                alert('Login failed')
            }
        } catch (error) {
            alert('An error occurred during login.')
            console.error(error)
        }
    }

    //get list of organisations whos servers are on
    useEffect(() => {
        const fetchServers = async () => {
            try {
                const response = await fetch('http://localhost:3000/servers/list')
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }
                
                const data = await response.json();
                setServers(data)
                setLoading(false)
            } catch (error) {
                console.error("Failed to fetch servers:", error)
                setLoading(false)
            }
        }

        fetchServers()
    }, [])

    return (
        <div>
            {loading ? (
                <p>Loading servers...</p> // Display loading message while fetching servers
            ) : (
                <>
                    {state.currentDialog.name === "LogIn" &&
                        <LogIn
                            setState={setState}
                            isLoggedIn={isLoggedIn}
                            servers={servers}
                            loginToServer={loginToServer}
                        />
                    }
                </>
            )}
        </div>
    )
}

export default Connection
