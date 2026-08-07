import PaddleService from "./PaddleService.js"
import GenAIService from "./GenAIService.js"

class ApiGateway {
    constructor() {
        this.paddle = new PaddleService()
        this.genAI = new GenAIService()
    }
}

export default new ApiGateway()