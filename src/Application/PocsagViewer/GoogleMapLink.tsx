const GoogleMapLink = ({ wgs84Str }: { wgs84Str: string }) => {
  return (
    <a
      href={`https://www.google.com/maps/search/${wgs84Str}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <code>{wgs84Str}</code>
    </a>
  );
};

export default GoogleMapLink;
