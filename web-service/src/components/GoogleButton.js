import { useGoogleLogin, GoogleLogin } from "@react-oauth/google"

import Google from "../assets/Google.svg"

function GoogleButton() {
    const login = useGoogleLogin({
        ux_mode: "redirect",
        redirect_uri: `${process.env.REACT_APP_BACKEND_URL}/api/auth/google/callback`, 
        flow: "auth-code", 
    });

    return (
        <>
            <button onClick={() => login()}>
                <img src={Google} />
                Continue with Google
            </button>
        </>
    )
}

export default GoogleButton