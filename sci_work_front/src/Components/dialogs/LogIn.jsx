
import { useState, useContext } from 'react'

import '../../Styles/components/dialogs/LogIn.sass'

import { getInput } from '../../lib/helpers'
import { TYPE_OPTIONS } from '../../lib/constants'

import { AppContext, CustomSelect, ToggleButton } from '../pageAssets/shared'

const LogIn = ({
    servers,
    loginToServer,
    formValues,
    setFormValues
}) => {

    const { //can not apply url-based itemIds in dialogs
        setDialog,
        isLoggedIn,
        useLocale
    } = useContext(AppContext)

    const { t } = useLocale("dialogs.logIn")

    // ==================================
    // const, helpers and state management
    // ==================================

    const [canReg, setCanReg] = useState(false)

    const [type, setType] = useState({type: "Log in"})

    // ==================================
    // dialog logic
    // ==================================

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
            setDialog((prevState) => {
                this.name = undefined
                this.params = []
            })
        }
    }

    // ==================================

    return (
        <>
            {!isLoggedIn &&
            <div className="auth-dialog dialog-container">
                <div className="dialog-content">
                    <form onSubmit={handleSubmit}>
                        {/* Server Selection */}
                        <label htmlFor="server">
                            {t("fields.server.label")}
                        </label>
                        <CustomSelect
                            id={"server"}
                            name={"server"}
                            value={formValues.server}
                            handler={handleInputChange}
                            options={servers}
                            optionSelectField={"id"}
                            optionContentField={"name"}
                            placeholder={"Select server"}
                            emptyPlaceholder={t("fields.server.placeholder")}
                            disabled={false}
                        />
                        {canReg ? (
                                <ToggleButton
                                    data={type}
                                    setter={setType}
                                    field={"type"}
                                    displayOptions={TYPE_OPTIONS}
                                    showDisplayOptions={TYPE_OPTIONS.map(o => t(`options.${o}`))}
                                />
                            ) : (
                                <h3>{t("label")}</h3>
                            )
                        }
                        {
                            getInput(
                                "login",
                                t("fields.login"),
                                "text",
                                formValues.login,
                                false,
                                handleInputChange,
                                false,
                                null,
                                60
                            )
                        }
                        {
                            getInput(
                                "password",
                                t("fields.password"),
                                "text",
                                formValues.password,
                                false,
                                handleInputChange,
                                false,
                                null,
                                60
                            )
                        }

                        <div>
                            <button
                                type="submit"
                                className="button-main"
                            >
                                {t("actions.logIn")}
                            </button>
                            <button
                                className='button-main'
                                onClick={closeDialog}
                            >
                                {t("actions.back")}
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