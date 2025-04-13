const GoogleMapLink = ({
  latitude,
  longitude,
}: {
  latitude: string;
  longitude: string;
}) => {
  return (
    <a
      href={`https://www.google.com/maps/search/${latitude}+${longitude}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <code>
        {latitude} {longitude}
      </code>
    </a>
  );
};

export default GoogleMapLink;
