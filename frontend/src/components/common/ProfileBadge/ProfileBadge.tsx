import './ProfileBadge.css';

export const ProfileBadge = ({ text }: { text: string }) => {
  return <div className="profile-badge">{text}</div>;
};