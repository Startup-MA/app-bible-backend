function Message({message}) {
    return (
        <div style={{border: "2px solid green", borderRadius: "5px", backgroundColor: "lightgreen"}}>
            <div>
                <h3>
                    Status: {message.message.data.status}
                </h3>
            </div>
            <div>
                <p><b>Message: </b>{message.message.data.message}</p>
            </div>
        </div>    
    )
}

export default Message