import { useGoogleLogin, GoogleLogin } from "@react-oauth/google"

import Google from "../assets/Google.svg"

function GoogleButton() {
    const handleGoogleLogin = () => {
        const googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth"
        
        const options = {
            client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
            redirect_uri: `${process.env.REACT_APP_BACKEND_URL}/api/auth/google`,
            response_type: "code",
            scope: "openid email profile",
            state: "browser",
            prompt: "consent"
        }

        const queryString = new URLSearchParams(options).toString()
        
        // Redirect the browser directly to Google
        window.location.href = `${googleAuthUrl}?${queryString}`
    }
    return (
        <>
            <button onClick={() => handleGoogleLogin()}>
                <img src={Google} />
                Continue with Google
            </button>
        </>
    )
}

export default GoogleButton