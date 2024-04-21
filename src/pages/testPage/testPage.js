import './testStyling.css'

const SingleMessage = (props)=>{
    return <div className="arial flexColumn">
        <p className="username arial-bold" style={{
            color: props.me?"#59b7db":"#cd4e67"
        }}>{props.username}</p>
        <h3 className="messageText">{props.content}</h3>
    </div>
}

const Message = ()=>{
    return <div>
        <SingleMessage 
            username={"Bruno Avelar"}
            me={true}
            content={"My super duper secret message"}
        ></SingleMessage>
        <SingleMessage 
            username={"Hamlin"}
            me={false}
            content={"I am Hamilton"}
        ></SingleMessage>
    </div>
}
export default Message 