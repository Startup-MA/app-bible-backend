import "../styles/Loader.css"

import BLogo from "../assets/BLogo.svg"

function Loader({ height }) {
    return (
        <>                    
            <div style={{height: height}} className="loader-content">
                <img src={BLogo} alt="Logo"/>
                <p>Loading...</p>
            </div>
        </>
    )
}

export default Loader