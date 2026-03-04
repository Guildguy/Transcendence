import './Avatar.css'
import UserImage from '../images/jpg/User.jpg'

export default function Avatar() {
  return (
            <div className="avatar-wrapper">
              <div className="avatar-circle">
                <img src={UserImage} alt="User avatar" />
              </div>
            </div>
    ) 
}