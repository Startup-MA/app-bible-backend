import PaddleService from "./PaddleService.js"
import GenAIService from "./GenAIService.js"
import GoogleAuthService from "./GoogleAuthService.js"

class ApiGateway {
    constructor() {
        this.paddle = new PaddleService()
        this.genAI = new GenAIService()
        this.googleAuth = new GoogleAuthService()
    }
}

export default new ApiGateway()