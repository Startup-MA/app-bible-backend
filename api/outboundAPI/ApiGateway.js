import PaddleService from "./PaddleService.js"
import GenAIService from "./GenAIService.js"
import GoogleAuthService from "./GoogleAuthService.js"
import AppleAuthService from "./AppleAuthService.js"

class ApiGateway {
    constructor() {
        this.paddle = new PaddleService()
        this.genAI = new GenAIService()
        this.googleAuth = new GoogleAuthService()
        this.appleAuth = new AppleAuthService()
    }
}

export default new ApiGateway()