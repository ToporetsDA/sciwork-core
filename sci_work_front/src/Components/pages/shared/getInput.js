import '../../../css/base/input.css'

/* from
AddEditContent
AddEditItem
LogIn
ListItem
Profile
ControlPanel
*/

const getInput = (fieldName, type, value, checked = false, handler, disabled = false, section = undefined, width = 50) => {

    // const name = fieldName.toLowerCase()

    return (
        <div
            className="input-group field"
            style={{
                width: `${width}%`
            }}
        >
            <input
                type={type}
                className="input-field"
                placeholder={fieldName}
                name={fieldName}
                id={fieldName}
                data-section={section}
                disabled={disabled}
                value={value}
                checked={checked}
                onChange={handler}
            />
            <label
                htmlFor={fieldName}
                className="input-label"
            >
                {fieldName}
            </label>
        </div>
    )
}

export default getInput