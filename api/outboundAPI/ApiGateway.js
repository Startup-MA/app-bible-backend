import PaddleService from "./PaddleService.js"
import GenAIService from "./GenAIService.js"

class ApiGateway {
    constructor() {
        // Instantiate the services once
        this.paddle = new PaddleService()
        this.genAI = new GenAIService()
    }
}

// Export as a singleton so the same instances are reused across your app
export default new ApiGateway()