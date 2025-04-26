import Papa from 'papaparse';

import {
  convertGpsListToWkt,
  convertGpsListToWktPoint,
  getColorForSpeed,
} from './utils';

describe('getColorForSpeed', () => {
  it('should return the correct color for a given speed', () => {
    const color = getColorForSpeed(10, 0, 20); // speed=10km/h, minSpeed=0km/h, maxSpeed=20km/h
    expect(color).toEqual('rgba(127, 0, 127, 0.8)');
  });
});

describe('convertGpsListToWkt', () => {
  it('should convert the gps list to WKT', () => {
    const wkt = convertGpsListToWkt([
      { latitude: 39.85489, longitude: 116.22046, rawMessage: '' },
      { latitude: 39.85489, longitude: 116.22046, rawMessage: '' },
    ]);
    expect(wkt).toEqual(
      'WKT,name,description\n"LINESTRING (116.22046 39.85489,116.22046 39.85489)",Line 1,'
    );
  });
});

describe('convertGpsListToWktPoint', () => {
  it('should convert the gps list to WKT point', () => {
    const wkt = convertGpsListToWktPoint([
      { latitude: 39.8869744, longitude: 116.2386613, rawMessage: '' },
      { latitude: 39.8749211, longitude: 116.25454, rawMessage: '' },
    ]);
    expect(wkt).toEqual(
      'WKT,name,description\n"POINT (116.2386613 39.8869744)",Point 1,\n"POINT (116.25454 39.8749211)",Point 2,'
    );
  });
});

// use UT to understand how Papa parse the tsv file
describe('Papa parse for the tsv file', () => {
  it('should parse the tsv file when the input TSV is generate manually', () => {
    const tsvFileContent = `global_index(number)	timestamp(string)	address(string)	function_bits(string)	message_format(string)	message_content(string)	parsed_error_message(null|string)	message_payload(json|null)	related_1234002_row_idx(number|null)
1243	2025-04-10 01:34:29	2048069	0	Alpha	#XPRLl,b	null	null	null
1244	2025-04-10 01:34:29	2048069	0	Skyper	"WOQKk+a	null	null	null
1245	2025-04-10 01:34:36	2048069	0	Numeric	32 24U8 863U48235000]5193	null	null	null`;
    const result = Papa.parse(tsvFileContent, { header: true });
    expect(result.data.length).toEqual(2);
    expect(result.errors[0]).toEqual({
      code: 'MissingQuotes',
      index: 330,
      message: 'Quoted field unterminated',
      row: 2,
      type: 'Quotes',
    });
    expect(result.errors[1]).toEqual({
      code: 'TooFewFields',
      message: 'Too few fields: expected 9 fields but parsed 6',
      row: 1,
      type: 'FieldMismatch',
    });
    expect(result.data[0]).toEqual({
      'global_index(number)': '1243',
      'timestamp(string)': '2025-04-10 01:34:29',
      'address(string)': '2048069',
      'function_bits(string)': '0',
      'message_format(string)': 'Alpha',
      'message_content(string)': '#XPRLl,b',
      'parsed_error_message(null|string)': 'null',
      'message_payload(json|null)': 'null',
      'related_1234002_row_idx(number|null)': 'null',
    });
    expect(result.data[1]).toEqual({
      'global_index(number)': '1244',
      'timestamp(string)': '2025-04-10 01:34:29',
      'address(string)': '2048069',
      'function_bits(string)': '0',
      'message_format(string)': 'Skyper',
      // 1. why: missing quotes `""`
      // 2. why: has line break
      'message_content(string)': `WOQKk+a	null	null	null
1245	2025-04-10 01:34:36	2048069	0	Numeric	32 24U8 863U48235000]5193	null	null	null`,
      // 3. why: missing below fields
      // 'parsed_error_message(null|string)': 'null',
      // 'message_payload(json|null)': 'null',
      // 'related_1234002_row_idx(number|null)': 'null',
    });
  });

  it('should parse the tsv file when the input TSV is generate by PapaParse', () => {
    // copy from pocsag_data.tsv
    const tsvFileContent = `"global_index(number)"	"timestamp(string)"	"address(string)"	"function_bits(string)"	"message_format(string)"	"message_content(string)"	"parsed_error_message(null|string)"	"message_payload(json|null)"	"related_1234002_row_idx(number|null)"
"1243"	"2025-04-10 01:34:29"	"2048069"	"0"	"Alpha"	"#XPRLl,b"	"null"	"null"	"null"
"1244"	"2025-04-10 01:34:29"	"2048069"	"0"	"Skyper"	"""WOQKk+a"	"null"	"null"	"null"
"1245"	"2025-04-10 01:34:36"	"2048069"	"0"	"Numeric"	"32 24U8 863U48235000]5193"	"null"	"null"	"null"`;
    const result = Papa.parse(tsvFileContent, { header: true });
    expect(result.data.length).toEqual(3);
    expect(result.errors.length).toEqual(0);
    expect(result.data[0]).toEqual({
      'global_index(number)': '1243',
      'timestamp(string)': '2025-04-10 01:34:29',
      'address(string)': '2048069',
      'function_bits(string)': '0',
      'message_format(string)': 'Alpha',
      'message_content(string)': '#XPRLl,b',
      'parsed_error_message(null|string)': 'null',
      'message_payload(json|null)': 'null',
      'related_1234002_row_idx(number|null)': 'null',
    });
    expect(result.data[1]).toEqual({
      'global_index(number)': '1244',
      'timestamp(string)': '2025-04-10 01:34:29',
      'address(string)': '2048069',
      'function_bits(string)': '0',
      'message_format(string)': 'Skyper',
      'message_content(string)': `"WOQKk+a`,
      'parsed_error_message(null|string)': 'null',
      'message_payload(json|null)': 'null',
      'related_1234002_row_idx(number|null)': 'null',
    });
  });
});
