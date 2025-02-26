import React, { useState, useRef, useEffect, useCallback } from 'react'
import useWebSocket from 'react-use-websocket'
import LogIn from './pages/dialogs/LogIn'

const Connection = ({ state, setState, editorData, setEditorData, userData, setUserData, isLoggedIn, setLoggedIn, setOrgData, users, setUsers, isUserUpdatingData, setIsUserUpdatingData }) => {

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
        const newPort = parseInt(port, 10) + 2
        
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

        setIsUserUpdatingData(false) // Reset flag
    }, [sendMessage, sessionToken, setIsUserUpdatingData])

    const handleResponse = useCallback((event) => {
        try {
            const response = JSON.parse(event.data)
            console.log(response) // This will log the entire response
        
            // Now, you can access specific parts of the response
            switch(response.message) {
            case "data": {
                const { data } = response
                const { type, data: fetchedData } = data
        
                console.log("Received data type:", type)
                console.log("Fetched data:", fetchedData)
        
                // You can handle the data based on the type (user, projects, etc.)
                switch (type) {
                case "setup": {
                    setUserData(fetchedData.user)
                    setOrgData(fetchedData.organisation)
                    break
                }
                case "editor": {
                    setEditorData(fetchedData)
                    break
                }
                case "organisation": {
                    setOrgData(fetchedData)
                    break
                }
                case "Users": {
                    setUsers(fetchedData)
                    break
                }
                default: {
                    console.log("Unknown data type:", type)
                }
                }
                break
            }
            case "addEdit": {
                const { type, data: fetchedData } = response.data
        
                console.log("Received data type:", type)
                console.log("Updated:", fetchedData)
        
                // You can handle the data based on the type (user, projects, etc.)
                switch (type) {
                case"editor": {
                    const item = fetchedData
                    if (editorData.find(project => project._id === item._id).length === 0) {
                    setEditorData(prevData => ({ ...prevData, item }))
                    }
                    else {
                        setEditorData(prevData => 
                            prevData.map(project => 
                            project._id === item._id ? item : project
                        ))
                    }
                    break
                }
                case"user": {
                    setEditorData(fetchedData)
                    break
                }
                default: {

                }
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
    }, [editorData, setEditorData, setUserData, setLoggedIn, setOrgData, setUsers])

    //send update ONLY when page value changes
    const lastSentPage = useRef(null)
    useEffect(() => {
        if (lastSentPage.current === state.currentPage || !isLoggedIn) return
            sendMsg("goTo", format(state.currentPage))
        lastSentPage.current = state.currentPage
    }, [sendMsg, state.currentPage, isLoggedIn])

    // Track user-initiated changes
    const updateData = useCallback((type, updatedData, id) => {
        const updatedItem = { item: updatedData.find(item => item._id === id), id: id}
        if (readyState === 1) { // Check if WebSocket is open
            const data = { type: type, data: updatedItem}
            sendMsg("addEditData", data)
            console.log("Sent update:", data)
        } else {
            console.error("WebSocket is not open. Cannot send update.")
        }
    }, [readyState, sendMsg])

    // Trigger user updates data in editor
    useEffect(() => {
        if (isUserUpdatingData && state.currentEditor) {
            const data = (state.currentEditor === "Users") ? users : editorData
            console.log("list data:", data)
            updateData(state.currentEditor, data, isUserUpdatingData)
        }
    }, [editorData, users, updateData, isUserUpdatingData, state.currentEditor])

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
