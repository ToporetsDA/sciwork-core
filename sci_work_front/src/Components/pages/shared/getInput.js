import '../../../css/base/input.css'

const getInput = (fieldName, type, value, checked = false, handler, disabled = false, width = 50) => {

    const name = fieldName.toLowerCase()

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
                name={name}
                id={name}
                disabled={disabled}
                value={value}
                checked={checked}
                onChange={handler}
            />
            <label
                htmlFor={name}
                className="input-label"
            >
                {fieldName}
            </label>
        </div>
    )
}

export default getInput