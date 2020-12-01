importScripts("https://unpkg.com/comlink/dist/umd/comlink.js");

// https://github.com/d3/d3-array/blob/master/src/min.js
function min(values, valueof) {
    let min;
    if (valueof === undefined) {
        for (const value of values) {
            if (value != null
                && (min > value || (min === undefined && value >= value))) {
                min = value;
            }
        }
    } else {
        let index = -1;
        for (let value of values) {
            if ((value = valueof(value, ++index, values)) != null
                && (min > value || (min === undefined && value >= value))) {
                min = value;
            }
        }
    }
    return min;
}

// https://github.com/d3/d3-array/blob/master/src/max.js
function max(values, valueof) {
    let max;
    if (valueof === undefined) {
        for (const value of values) {
            if (value != null
                && (max < value || (max === undefined && value >= value))) {
                max = value;
            }
        }
    } else {
        let index = -1;
        for (let value of values) {
            if ((value = valueof(value, ++index, values)) != null
                && (max < value || (max === undefined && value >= value))) {
                max = value;
            }
        }
    }
    return max;
}

const chunk = (arr, chunkSize) => {
    if (chunkSize <= 0) throw "Invalid chunk size";
    var R = [];
    for (var i = 0, len = arr.length; i < len; i += chunkSize)
        R.push(arr.slice(i, i + chunkSize));
    return R;
}

/**
 * Calculating TF-IDF for the bins in "Topics over time"
 * is a costly function and needs to be done off the main thread
 */
function binTFIDF(binLength, data) {
    const bins /* type: Omit<Bin, 'tfidf'>[] */ = chunk(data, binLength)
        .map((bin /* type: (Episode & { topWords: object })[] */) => {
            // Sum items in bin
            const cfd = bin.reduce((prev, curr) => {
                Object.entries(curr.topWords).forEach(([key, value]) => {
                    prev[key] = (prev[key] || 0) + value
                })

                return prev
            }, ({}))

            return {
                cfd,
                start: min(bin, d => d.number),
                end: max(bin, d => d.number),
                startDate: min(bin, d => d.published),
                endDate: max(bin, d => d.published),
                episodeIDs: bin.map(({ id }) => id)
            }
        })

    const allWords = bins.reduce((prev, curr) =>
        Array.from(new Set(prev.concat(Object.keys(curr.cfd))))
        , [])

    // Document frequency of a word
    let binFrequency = {}
    allWords.forEach(word => {
        bins.forEach(bin => {
            if (word in bin.cfd) {
                binFrequency[word] = (binFrequency[word] || 0) + 1
            }
        })
    })

    const result = bins
        .filter(({ start }) => start != 0)
        .reverse()
        .map(bin => {
            const tfidf = {}

            Object.entries(bin.cfd).forEach(([word, tf]) => {
                const idf = bins.length / (binFrequency[word] + 1)
                tfidf[word] = tf * Math.log(idf)
            })

            return {
                ...bin,
                cfd: null,
                tfidf: Object.entries(tfidf).sort((a, b) => b[1] - a[1])
            }
        })

    return result
}

Comlink.expose(binTFIDF);