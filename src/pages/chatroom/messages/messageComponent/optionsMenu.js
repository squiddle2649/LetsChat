
import './messageStyling.css'

export const OptionsMenu = (props)=>{
    const visibility={
        display:props.visible?"":"none"
    }
    return <div className='menuContainer whiteText' style={visibility}>
        <p className=' redBGhover menuText pointer'>Pin message</p>
        <p className=' redBGhover menuText pointer'>Report message</p>
        <p className=' redBGhover menuText pointer'>Add a reaction</p>
    </div>

}