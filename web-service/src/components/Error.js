import "../styles/Error.css"

import ErrorClose from "../assets/ErrorClose.svg"

function Error({message, cancelMessage}) {
    const errorTimeoutId = setTimeout(() => cancelMessage(false), 30000)
    
    const handleCancelMessage = () => {
        clearTimeout(errorTimeoutId)
        cancelMessage(false)
    }

    return (
        <div id="ErrorPopUp">
            <div id="Content">
                <div id="Message">
                    <h3>
                        {message}
                    </h3>
                </div>
                <div onClick={handleCancelMessage} id="ErrorClose">
                    <img src={ErrorClose} alt="Close" />
                </div>
            </div>        
        </div>    
    )
}

export default Error