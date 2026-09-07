import Apple from "../assets/Apple.svg"

function AppleButton() {
    const handleAppleLogin = () => {
        const appleAuthUrl = "https://appleid.apple.com/auth/authorize"

        const options = {
            client_id: process.env.REACT_APP_APPLE_SERVICE_ID,
            redirect_uri: `${process.env.REACT_APP_BACKEND_URL}/api/auth/apple`,
            response_type: "code id_token",
            scope: "email",
            response_mode: "form_post",
            state: JSON.stringify({
                device: "browser",
                platform: "web"
            })
        }

        const queryString = new URLSearchParams(options).toString()
        
        window.location.href = `${appleAuthUrl}?${queryString}`
    }
    return (
        <>
            <button onClick={() => handleAppleLogin()}>
                <img src={Apple} />
            </button>
        </>
    )
}

export default AppleButton