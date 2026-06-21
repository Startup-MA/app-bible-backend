import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"

import "../styles/PopUp.css"

function PopUp({isOpen, onClose, actionHandler, title, content}) {
    const dialogRef = useRef(null)
    
    useEffect(() => {
        const dialogNode = dialogRef.current

        if (!dialogNode) return

        if (isOpen) {
            // window.scroll(0, 0)
            dialogNode.showModal()
        } else {
            dialogNode.close()
        }

    }, [isOpen])
    
    if (!isOpen) return null

    return createPortal(
        <>
            <dialog
                ref={dialogRef}
                onClose={onClose}
                className="pop-up-background" id="PopUp"
            >
                <div className="pop-up">
                    <h2>
                        {title}
                    </h2>
                    <div className="pop-up-content">
                        <p>{content}</p>
                    </div>
                    <div className="pop-up-controlls" >
                        <button onClick={actionHandler}>Cancel</button>
                        <button onClick={actionHandler}>Confirm</button>
                    </div>
                </div>
            </dialog>
        </>,
        document.getElementById("modal-root") 
    )
}

export default PopUp