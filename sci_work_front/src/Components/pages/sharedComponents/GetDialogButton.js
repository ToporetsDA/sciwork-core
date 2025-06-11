import '../../../css/base/buttons.css'

const GetDialogButton  = (setState, buttonClass, dialog, params, text, stopPropagate) => {
    return (
        <button className={`${buttonClass}`} onClick={(e) => {
            if (stopPropagate) {
                e.stopPropagation()
            }
            setState((prevState) => ({
                ...prevState,
                currentDialog: {
                    name: dialog,
                    params
                }
            }))
        }}>
            {text}
        </button>
    )
}

export default GetDialogButton