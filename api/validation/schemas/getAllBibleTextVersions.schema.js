import Joi from "joi"
import { 
    id,
    number
} from "./bookmark.schema.js"

export const getAllBibleTextVersionsSchema = Joi.object({
    start_id: id,
    number: number
})