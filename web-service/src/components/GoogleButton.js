import { useLocation } from "react-router"
import Google from "../assets/Google.svg"

function GoogleButton() {
    const location = useLocation()

    const handleGoogleLogin = () => {
    

        const googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth"
        const returnTo = `${location.pathname}${location.search}${location.hash}`

        const options = {
            client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
            redirect_uri: `${process.env.REACT_APP_BACKEND_URL}/api/auth/google`,
            response_type: "code",
            scope: "openid email",
            state: JSON.stringify({
                device: "browser",
                returnTo: returnTo
            }),
            prompt: "select_account"
        }

        const queryString = new URLSearchParams(options).toString()

        window.location.href = `${googleAuthUrl}?${queryString}`
    }

    return (
        <>
            <button onClick={() => handleGoogleLogin()}>
                <img src={Google} />
            </button>
        </>
    )
}

export default GoogleButton