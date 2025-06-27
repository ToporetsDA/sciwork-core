import { useState } from 'react'
import '../../css/components/dialogs/LogIn.css'
import '../../css/base/dialog.css'

import * as Shared from '../pages/shared'


const LogIn = ({ setState, isLoggedIn, servers, loginToServer }) => {

    const [formValues, setFormValues] = useState(() => {
        return {
            server: "",
            login: "",
            password: ""
        }
    })

    const [canReg, setCanReg] = useState(false)

    const handleInputChange = (e) => {
        const { name, value } = e.target
        const server = servers.find(s => s.id === value)
        setCanReg(server?.canReg)
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

    const closeDialog = (e) => {
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

    const [type, setType] = useState({type: "Log in"})

    return (
        <>
            {!isLoggedIn &&
            <div className="auth-dialog dialog-container">
                <div className="dialog-content">
                    <form onSubmit={handleSubmit}>
                        {/* Server Selection */}
                        <label htmlFor="server">Server</label>
                        <Shared.CustomSelect
                            id={"server"}
                            name={"server"}
                            value={formValues.server}
                            handler={handleInputChange}
                            options={servers}
                            optionSelectField={"id"}
                            optionContentField={"name"}
                            placeholder={"Select server"}
                            emptyPlaceholder={"No servers available"}
                            disabled={false}
                        />
                        {canReg ? (
                                <Shared.ToggleButton
                                    data={type}
                                    setter={setType}
                                    field={"type"}
                                    displayOptions={['Register', 'Log in']}
                                />
                            ) : (
                                <h3>Login</h3>
                            )
                        }

                        {Shared.getInput("login", "text", formValues.login, false, handleInputChange, false, null, 60)}
                        {Shared.getInput("password", "text", formValues.password, false, handleInputChange, false, null, 60)}

                        <div>
                            <button
                                type="submit"
                                className="button-main"
                            >
                                Log In
                            </button>
                            <button
                                className='button-main'
                                onClick={closeDialog}
                            >
                                Back
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            }
        </>
    )
}

export default LogIn