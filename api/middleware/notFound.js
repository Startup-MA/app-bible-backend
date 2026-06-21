import { StatusCodes } from "http-status-codes";

async function notFound(req, res, next) {
	return res.status(StatusCodes.NOT_FOUND).json({
		status: "error",
    	message: "Sorry, the requested resource was not found!"
	})
}

export default notFound