// Остальные крупные города США для полного покрытия
// Топ города из остальных штатов (не русскоязычных приоритетов)

export const OTHER_MAJOR_CITIES = [
  // OHIO - Крупные города Среднего Запада
  { name: "Columbus", population: 913175, latitude: 39.9612, longitude: -82.9988, stateId: "OH" },
  { name: "Cleveland", population: 362656, latitude: 41.4993, longitude: -81.6944, stateId: "OH" },
  { name: "Cincinnati", population: 311097, latitude: 39.1031, longitude: -84.5120, stateId: "OH" },
  { name: "Toledo", population: 265304, latitude: 41.6528, longitude: -83.5379, stateId: "OH" },
  { name: "Akron", population: 188701, latitude: 41.0814, longitude: -81.5190, stateId: "OH" },
  { name: "Dayton", population: 137644, latitude: 39.7589, longitude: -84.1916, stateId: "OH" },

  // NORTH CAROLINA - Растущий регион
  { name: "Charlotte", population: 911311, latitude: 35.2271, longitude: -80.8431, stateId: "NC" },
  { name: "Raleigh", population: 482295, latitude: 35.7796, longitude: -78.6382, stateId: "NC" },
  { name: "Greensboro", population: 302296, latitude: 36.0726, longitude: -79.7920, stateId: "NC" },
  { name: "Durham", population: 296186, latitude: 35.9940, longitude: -78.8986, stateId: "NC" },
  { name: "Winston-Salem", population: 252975, latitude: 36.0999, longitude: -80.2442, stateId: "NC" },
  { name: "Fayetteville", population: 209468, latitude: 35.0527, longitude: -78.8784, stateId: "NC" },

  // GEORGIA - Юг
  { name: "Atlanta", population: 510823, latitude: 33.7490, longitude: -84.3880, stateId: "GA" },
  { name: "Augusta", population: 205414, latitude: 33.4735, longitude: -82.0105, stateId: "GA" },
  { name: "Columbus", population: 201877, latitude: 32.4609, longitude: -84.9877, stateId: "GA" },
  { name: "Macon", population: 156512, latitude: 32.8407, longitude: -83.6324, stateId: "GA" },
  { name: "Savannah", population: 147748, latitude: 32.0835, longitude: -81.0998, stateId: "GA" },
  { name: "Athens", population: 128864, latitude: 33.9519, longitude: -83.3576, stateId: "GA" },

  // ARIZONA - Запад
  { name: "Phoenix", population: 1650070, latitude: 33.4484, longitude: -112.0740, stateId: "AZ" },
  { name: "Tucson", population: 548073, latitude: 32.2226, longitude: -110.9747, stateId: "AZ" },
  { name: "Mesa", population: 504258, latitude: 33.4152, longitude: -111.8315, stateId: "AZ" },
  { name: "Chandler", population: 275987, latitude: 33.3062, longitude: -111.8413, stateId: "AZ" },
  { name: "Scottsdale", population: 258069, latitude: 33.4942, longitude: -111.9261, stateId: "AZ" },

  // NEVADA - Запад
  { name: "Las Vegas", population: 660929, latitude: 36.1699, longitude: -115.1398, stateId: "NV" },
  { name: "Henderson", population: 320189, latitude: 36.0395, longitude: -114.9817, stateId: "NV" },
  { name: "Reno", population: 264165, latitude: 39.5296, longitude: -119.8138, stateId: "NV" },
  { name: "North Las Vegas", population: 262527, latitude: 36.1989, longitude: -115.1175, stateId: "NV" },

  // COLORADO - Запад
  { name: "Denver", population: 716577, latitude: 39.7392, longitude: -104.9903, stateId: "CO" },
  { name: "Colorado Springs", population: 486935, latitude: 38.8339, longitude: -104.8214, stateId: "CO" },
  { name: "Aurora", population: 386261, latitude: 39.7294, longitude: -104.8319, stateId: "CO" },
  { name: "Fort Collins", population: 169810, latitude: 40.5853, longitude: -105.0844, stateId: "CO" },
  { name: "Lakewood", population: 155984, latitude: 39.7047, longitude: -105.0814, stateId: "CO" },

  // OREGON - Запад
  { name: "Portland", population: 630498, latitude: 45.5152, longitude: -122.6784, stateId: "OR" },
  { name: "Eugene", population: 176654, latitude: 44.0521, longitude: -123.0868, stateId: "OR" },
  { name: "Salem", population: 175535, latitude: 44.9429, longitude: -123.0351, stateId: "OR" },
  { name: "Gresham", population: 114247, latitude: 45.5001, longitude: -122.4302, stateId: "OR" },

  // TENNESSEE - Юг
  { name: "Nashville", population: 689447, latitude: 36.1627, longitude: -86.7816, stateId: "TN" },
  { name: "Memphis", population: 633104, latitude: 35.1495, longitude: -90.0490, stateId: "TN" },
  { name: "Knoxville", population: 190740, latitude: 35.9606, longitude: -83.9207, stateId: "TN" },
  { name: "Chattanooga", population: 181099, latitude: 35.0456, longitude: -85.2672, stateId: "TN" },

  // KENTUCKY - Юг
  { name: "Louisville", population: 622981, latitude: 38.2527, longitude: -85.7585, stateId: "KY" },
  { name: "Lexington", population: 327924, latitude: 38.0406, longitude: -84.5037, stateId: "KY" },
  { name: "Bowling Green", population: 72294, latitude: 36.9685, longitude: -86.4808, stateId: "KY" },

  // INDIANA - Средний Запад
  { name: "Indianapolis", population: 888578, latitude: 39.7684, longitude: -86.1581, stateId: "IN" },
  { name: "Fort Wayne", population: 270402, latitude: 41.0793, longitude: -85.1394, stateId: "IN" },
  { name: "Evansville", population: 118414, latitude: 37.9716, longitude: -87.5710, stateId: "IN" },
  { name: "South Bend", population: 103395, latitude: 41.6764, longitude: -86.2520, stateId: "IN" },

  // MISSOURI - Средний Запад
  { name: "Kansas City", population: 510704, latitude: 39.0997, longitude: -94.5786, stateId: "MO" },
  { name: "St. Louis", population: 301578, latitude: 38.6270, longitude: -90.1994, stateId: "MO" },
  { name: "Springfield", population: 169176, latitude: 37.2153, longitude: -93.2982, stateId: "MO" },
  { name: "Columbia", population: 126254, latitude: 38.9517, longitude: -92.3341, stateId: "MO" },

  // MINNESOTA - Средний Запад
  { name: "Minneapolis", population: 425115, latitude: 44.9778, longitude: -93.2650, stateId: "MN" },
  { name: "St. Paul", population: 311527, latitude: 44.9537, longitude: -93.0900, stateId: "MN" },
  { name: "Rochester", population: 121395, latitude: 44.0121, longitude: -92.4802, stateId: "MN" },
  { name: "Duluth", population: 86697, latitude: 46.7867, longitude: -92.1005, stateId: "MN" },

  // WISCONSIN - Средний Запад
  { name: "Milwaukee", population: 561385, latitude: 43.0389, longitude: -87.9065, stateId: "WI" },
  { name: "Madison", population: 269840, latitude: 43.0731, longitude: -89.4012, stateId: "WI" },
  { name: "Green Bay", population: 107395, latitude: 44.5133, longitude: -88.0133, stateId: "WI" },
  { name: "Kenosha", population: 99986, latitude: 42.5847, longitude: -87.8212, stateId: "WI" },

  // VIRGINIA - Юг
  { name: "Virginia Beach", population: 453649, latitude: 36.8529, longitude: -75.9780, stateId: "VA" },
  { name: "Norfolk", population: 238005, latitude: 36.8468, longitude: -76.2852, stateId: "VA" },
  { name: "Chesapeake", population: 249422, latitude: 36.7682, longitude: -76.2875, stateId: "VA" },
  { name: "Richmond", population: 230436, latitude: 37.5407, longitude: -77.4360, stateId: "VA" },
  { name: "Newport News", population: 186247, latitude: 37.0871, longitude: -76.4730, stateId: "VA" },

  // Другие важные города
  { name: "Albuquerque", population: 564559, latitude: 35.0844, longitude: -106.6504, stateId: "NM" },
  { name: "Tucson", population: 548073, latitude: 32.2226, longitude: -110.9747, stateId: "AZ" },
  { name: "Oklahoma City", population: 695724, latitude: 35.4676, longitude: -97.5164, stateId: "OK" },
  { name: "Tulsa", population: 413066, latitude: 36.1540, longitude: -95.9928, stateId: "OK" },
  { name: "New Orleans", population: 383997, latitude: 29.9511, longitude: -90.0715, stateId: "LA" },
  { name: "Baton Rouge", population: 227470, latitude: 30.4515, longitude: -91.1871, stateId: "LA" },
  { name: "Little Rock", population: 198541, latitude: 34.7465, longitude: -92.2896, stateId: "AR" },
  { name: "Birmingham", population: 200733, latitude: 33.5186, longitude: -86.8104, stateId: "AL" },
  { name: "Mobile", population: 187041, latitude: 30.6954, longitude: -88.0399, stateId: "AL" },
  { name: "Jackson", population: 153701, latitude: 32.2988, longitude: -90.1848, stateId: "MS" },
  { name: "Charleston", population: 150227, latitude: 32.7767, longitude: -79.9311, stateId: "SC" },
  { name: "Columbia", population: 131674, latitude: 34.0007, longitude: -81.0348, stateId: "SC" },
  { name: "Wilmington", population: 70166, latitude: 39.7391, longitude: -75.5398, stateId: "DE" },
  { name: "Baltimore", population: 585708, latitude: 39.2904, longitude: -76.6122, stateId: "MD" },
  { name: "Annapolis", population: 40812, latitude: 38.9717, longitude: -76.5010, stateId: "MD" }
];
