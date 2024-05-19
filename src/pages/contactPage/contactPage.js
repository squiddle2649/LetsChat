import './contactPageStyling.css'
import { PhoneIcon,MailIcon } from './contactPageSVG'
import { Logo } from 'components/logo/logo'
import { Link } from 'react-router-dom'
    
const ContactPage = () =>{
    return <div style={{padding:"10px"}}>
        <Link to="/" className='logoLinkContainer'>
            <Logo></Logo>
        </Link>
        <div className="contactPageContainer flexCenter">
            <div className="contactPage">
                <h1 className='arial-bold'>Contact me</h1>
                <ContactInfo
                    icon ={<MailIcon></MailIcon>}
                    text ="bruno.abj2017@gmail.com"
                ></ContactInfo>
                <ContactInfo
                    icon ={<PhoneIcon></PhoneIcon>}
                    text ="+49 15166521050"
                ></ContactInfo>
            </div>
        </div>
    </div>

}

const ContactInfo = (props)=>{
    return <div className='contactInfo flexAlignCenter'>
        <div>{props.icon}</div>
        <h2 className='arial' style={{marginLeft:"10px"}}>{props.text}</h2>
    </div>  
}

export default ContactPage