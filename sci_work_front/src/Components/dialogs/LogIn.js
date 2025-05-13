import { useState } from 'react'
import '../../css/dialogs/LogIn.css'
import '../../css/dialogs/dialog.css'


const LogIn = ({ setState, isLoggedIn, servers, loginToServer }) => {

    const [formValues, setFormValues] = useState(() => {
        return {
            server: "",
            login: "",
            password: ""
        }
    })

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormValues((prev) => ({
            ...prev,
            [name]: value
        }))
    }
    
    const handleSubmit = (e) => {
        e.preventDefault()
        if (servers.length === 0) {
            alert("No servers available. Unable to log in.")
            return
        }
        loginToServer(formValues)
    }

    const handleOutsideClick = (e) => {
        if (e.target === e.currentTarget) {
            setState((prevState) => ({
                ...prevState,
                currentDialog: {
                    name: undefined,
                    params: []
                }
            }))
        }
    }

    return (
        <>
            {!isLoggedIn &&
            <div className="AuthDialog dialogContainer"  onClick={handleOutsideClick}>
                <div className="dialogContent">
                    <form onSubmit={handleSubmit}>
                        {/* Server Selection */}
                        <label htmlFor="server">Server</label>
                        <select
                            id="server"
                            name="server"
                            value={formValues.server}
                            onChange={handleInputChange}
                            disabled={servers.length === 0} // Disable if no servers
                        >
                            <option value="" disabled>
                                {servers.length === 0 ? "No servers available" : "Select a server"}
                            </option>
                            {servers.map((server) => (
                                <option key={server.id} value={server.id}>
                                    {server.name}
                                </option>
                            ))}
                        </select>
                        <datalist id="serverList">
                            {servers.length > 0 ? (
                                servers.map((server) => (
                                    <option key={server.id} value={server.id}>
                                        {server.name}
                                    </option>
                                ))
                            ) : (
                                <option value="No servers available" disabled />
                            )}
                        </datalist>

                        {/* Login Input */}
                        <label htmlFor="login">Login</label>
                        <input
                            id="login"
                            name="login"
                            type="text"
                            value={formValues.login}
                            onChange={handleInputChange}
                        />

                        {/* Password Input */}
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={formValues.password}
                            onChange={handleInputChange}
                        />

                        {/* Submit Button */}
                        <button type="submit" className="submitButton">
                            Log In
                        </button>
                        <button
                            className='backButton'
                            onClick={handleOutsideClick}
                        >
                            Back
                        </button>
                    </form>
                </div>
            </div>
            }
        </>
    )
}

export default LogIn