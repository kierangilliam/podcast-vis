export const COLORS = {
    white: '#FFFFFF',
    black: '#181818',
    gray: '#D9D7E0',
    lightGray: '#F1F0F2',
    darkGray: '#9089A5',
    // Primary
    lightOrange: '#FFBEA4',
    orange: '#EF8D63',
    darkOrange: '#70371F',
    // Secondaries
    red: '#DE7272',
    green: '#91D89C',
    yellow: '#EFBF63',
    pink: '#EF6395',
    purple: '#7663EF',
    blue: '#558DE0',
}

// Videos where the video segmentation did not go as planned
export const JRE_BLACKLIST = [
    ...[
        1520,
        1521,
        1529, // whitney cummings & annie
        1547, // Colin Quinn
        1549, // Tom Papa
        1498, // jon stewart
        1562, // dave smith
        1563, // tony hinchcliffe
        1567,
    ],
    // MAYBE BLACKLIST (TO VERIFY)
    ...[
        1555, // alex jones and tim dillon
        1497, // joe schilling
        1487, // Janet Zuccarini & Evan Funke
        1481, // adam eget
        1466, // Jessimae Peluso
        1463, // Tom Green
        1459, // Tom ONell
        1446, // Bert Kreischer
        1440, // Fortune Feimster
        1433, // Michael Yo
        1421, // Jim Norton
        1420, // Mark Normand
        1405, // Sober October 3 Recap
        1400, // Tony Hinchcliffe
    ]
]

const LEX_BLACKLIST = [
    125, // Ryan Hall 
    124, // Stephen Wolfram
    123, // Manolis Kellis
    119, // David Eagleman
    116, // Sara Seager
    113, // Manolis Kellis 
    111, // Richard Karp
    109, // Brian Kernighan
    107, // Peter Singer
    106, // Matt Botvinick
    105, // Robert Langer
    91, // Jack Dorsey
    89, // Stephen Wolfram
    84, // William MacAskill
    // ... would rather whitelist this one
]

export const LEX_WHITELIST = [
    140, // Lisa Feldman Barrett
    139, // Andrew Huberman **
    138, // Yaron Brook ***
    136, // Dan Carlin
    135, // Charles Isbell
    134, // Eric Weinstein
    132, // George Hotz
    130, // Scott Aaronson
    129, // Lisa Feldman Barrett *
    128, // Michael Malice ***
    127, // Joe Rogan        
    121, // Eugenia Kuyda **
    117, // Sheldon Solomon    
    114, // Russ Tedrake
    112, // Ian Hutchinson
    110, // Jitendra Malik 
    101, // Joscha Bach ***
    98, // Kate Darling
    94, // Ilya Sutskever
    88, // Eric Weinstein **
    81, // Anca Dragan *
    80, // Vitalik Buterin **
    73, // Andrew Ng ***
    71, // Vladimir Vapnik *
    49, // Elon Musk **
]