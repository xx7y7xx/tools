import Code from '../PocsagSignalViewer/Code';

const GoogleMapLink = ({ wgs84Str }: { wgs84Str: string }) => {
  return (
    <a
      href={`https://www.google.com/maps/search/${wgs84Str}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Code>{wgs84Str}</Code>
    </a>
  );
};

export default GoogleMapLink;
