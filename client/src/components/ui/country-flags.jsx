// Country Flag Icons as SVG Components

export const QatarFlag = ({ className = "w-5 h-5" }) => (
  <svg
    viewBox="0 0 11 8"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Maroon background */}
    <rect width="11" height="8" fill="#8D1B3D" />
    {/* White serrated edge */}
    <path
      d="M0 0 L3.5 4 L3.5 0 Z M0 8 L3.5 4 L3.5 8 Z"
      fill="#FFFFFF"
    />
  </svg>
);

export const USAFlag = ({ className = "w-5 h-5" }) => (
  <svg
    viewBox="0 0 19 10"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Red and white stripes */}
    <rect width="19" height="1.43" fill="#B22234" />
    <rect y="1.43" width="19" height="1.43" fill="#FFFFFF" />
    <rect y="2.86" width="19" height="1.43" fill="#B22234" />
    <rect y="4.29" width="19" height="1.43" fill="#FFFFFF" />
    <rect y="5.72" width="19" height="1.43" fill="#B22234" />
    <rect y="7.15" width="19" height="1.43" fill="#FFFFFF" />
    <rect y="8.57" width="19" height="1.43" fill="#B22234" />
    
    {/* Blue canton */}
    <rect width="7.6" height="5.72" fill="#3C3B6E" />
    
    {/* Stars - represented as small circles for simplicity */}
    <g fill="#FFFFFF">
      <circle cx="0.95" cy="0.95" r="0.3" />
      <circle cx="2.85" cy="0.95" r="0.3" />
      <circle cx="4.75" cy="0.95" r="0.3" />
      <circle cx="6.65" cy="0.95" r="0.3" />
      <circle cx="1.9" cy="1.9" r="0.3" />
      <circle cx="3.8" cy="1.9" r="0.3" />
      <circle cx="5.7" cy="1.9" r="0.3" />
      <circle cx="0.95" cy="2.86" r="0.3" />
      <circle cx="2.85" cy="2.86" r="0.3" />
      <circle cx="4.75" cy="2.86" r="0.3" />
      <circle cx="6.65" cy="2.86" r="0.3" />
      <circle cx="1.9" cy="3.81" r="0.3" />
      <circle cx="3.8" cy="3.81" r="0.3" />
      <circle cx="5.7" cy="3.81" r="0.3" />
      <circle cx="0.95" cy="4.77" r="0.3" />
      <circle cx="2.85" cy="4.77" r="0.3" />
      <circle cx="4.75" cy="4.77" r="0.3" />
      <circle cx="6.65" cy="4.77" r="0.3" />
    </g>
  </svg>
);

