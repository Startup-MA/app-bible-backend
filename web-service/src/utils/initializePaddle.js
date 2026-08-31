import { initializePaddle } from "@paddle/paddle-js"

export let updater = {
    updateData: ""
}

export const paddle = await initializePaddle({
    token: process.env.REACT_APP_PADDLE_INITIALIZE_TOKEN,
    environment: process.env.REACT_APP_PADDLE_ENVIRONMENT,
    eventCallback: (data) => {
        if (data.name === "checkout.completed") {
            console.log("checkout.completed")
            setTimeout(updater.updateData, 3000)
            setTimeout(updater.updateData, 5000)
        }
    }
})