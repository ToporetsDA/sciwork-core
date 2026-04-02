import { useState, useEffect, useCallback, useContext } from 'react'
import { useTranslation } from "react-i18next"

import { AppContext } from '../pageAssets/shared'
import { Enter } from '../dialogs'

import { AppSocket } from './socket/AppSocket'
import { getApiMethod } from './api/AppApiClient'

const AppConnection = ({
    onReady,
    setProjects,
    setActivities,
    setRights,
    setUsers,
    previousVersionsRef
}) => {

    const {
        dialog,
        setUserData,
        setDisplaySettings,
        setFunctionalSettings
    } = useContext(AppContext)

    const { t } = useTranslation("base.connection")

    // ==================================
    // const, vars, helpers and state management
    // ==================================

    const [servers, setServers] = useState([])              // список з бекенду
    const [loading, setLoading] = useState(true)            // UI-флаг
    const [sessionToken, setToken] = useState()             // auth
    const [baseUrl, setBaseUrl] = useState()                // currnt server URL
    
    const [wsUrl, setWsUrl] = useState(null)                // websocket endpoint
    

    //get list of working servers
    useEffect(() => {
        const fetchServers = async () => {
            try {
                const response = await fetch('http://localhost:3000/servers/list') //load from outside later
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

    // ==================================
    // API calls
    // ==================================

    const callApi = useCallback(async (method, path, payload = null) => {
        const m = getApiMethod(baseUrl, sessionToken, method)
        return m(path, payload)
    },[baseUrl, sessionToken])

    const applyBackUp = useCallback((domain, id) => {
        // rollback через previousVersionsRef
        const versionKey = id ?? domain
        const prev = previousVersionsRef.current?.[versionKey]?.val
        if (prev) {
            console.warn(`Rolling back ${versionKey} to previous version`)
            
            const domainAssets = {
                projects: setProjects,
                activities: setActivities,
                user: setUserData,
                displaySettings: setDisplaySettings,
                functionalSettings: setFunctionalSettings
            }

            const setter = domainAssets[domain]
            if (setter) {
                setter(prev)
            }
        }

        // Очистка старої версії після rollback (опційно)
        delete previousVersionsRef.current?.[versionKey]
    }, [
        previousVersionsRef,
        setProjects, setActivities, setUserData, setDisplaySettings, setFunctionalSettings, 
    ])

    // GET

    const fetchInitData = async () => {
        if (!sessionToken) return
        if (!baseUrl) return

        try {

            const data = await callApi("get", "init")

            setUserData(data.user)
            setProjects(data.projects)
            setActivities(data.activities)
            setUsers(data.users)
            setRights(data.organisation.rights)
            setDisplaySettings(data.settings.display)
            setFunctionalSettings(data.settings.functional)
        } catch (error) {
            console.error("Failed to fetch init data", error)
        }
    }

    // PATCH

    const sendRequest = useCallback(async (domain, id, patches) => {
        if (!sessionToken) {
            console.warn("No session token")
            return
        }
        if (!baseUrl) {
            console.warn("No server address")
            return
        }

        try {
            return await callApi("patch", domain, patches)
        } catch (error) {
            console.error("Failed to send request:", error)
            applyBackUp(domain, id)
        }
        
    }, [callApi, applyBackUp, baseUrl, sessionToken])

    useEffect(() => {
        onReady(sendRequest)
    }, [ onReady, sendRequest])

    // ==================================
    // log in/register logic
    // ==================================

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

    const handleEnter = async (t, server, payload) => {
        const type = t.replace(/\s/g, '').toLowerCase()
        const selectedServer = servers.find((s) => s.address === server.address)
        if (!selectedServer) {
            alert("Invalid server selected.")
            return
        }

        try {
            const response = await callApi("post", `/users/${type}`, payload)

            if (response.status === 200) {

                console.log(`${type} successful`)
                
                const data = await response.json()
                setToken(data.sessionToken)
                setBaseUrl(selectedServer.address)

                const wsAddress = `ws://${serverAddress(selectedServer.address)}`
                setWsUrl(wsAddress)

                fetchInitData()

                console.log('WebSocket URL:', wsAddress)
            }
            else {
                alert(`${type} failed`)
            }
        } catch (error) {
            alert(`An error occurred during ${type}.`)
            console.error(error)
        }
    }

    // ==================================

    return (
        <div>
            <AppSocket
                //data
                setProjects={setProjects}
                setActivities={setActivities}
                //tech+meta
                setRights={setRights}
                setUsers={setUsers}
                //state
                sessionToken={sessionToken}
                wsUrl={wsUrl}
            />
            {loading ? (
                <p>{t("fallback")}</p> // Display loading message while fetching servers
            ) : (
                <>
                    {dialog.name === "Enter" &&
                        <Enter
                            servers={servers}
                            handleEnter={handleEnter}
                        />
                    }
                </>
            )}
        </div>
    )
}

export default AppConnection