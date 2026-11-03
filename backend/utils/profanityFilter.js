
const { Filter } = require('bad-words')

const filter = new Filter({
    placeHolder: '*'
})

// Common Tagalog / Filipino profanity and variations.
// Add more words here based on your review policy.
const tagalogBadWords = [
    'putangina',
    'putang ina',
    'putanginamo',
    'putang ina mo',
    'tangina',
    'tang ina',
    'tanginamo',
    'tangina mo',
    'potangina',
    'potang ina',
    'pota',
    'punyeta',
    'punyemas',
    'pakyu',
    'gago',
    'gaga',
    'gagu',
    'gag0',
    'tanga',
    'bobo',
    'inutil',
    'ulol',
    'tarantado',
    'leche',
    'letse',
    'lintik',
    'bwisit',
    'buwisit',
    'yawa',
    'peste',
    'kingina',
    'kupal',
    'burat',
    'tite',
    'etits',
    'pekpek',
    'puke',
    'kantot',
    'kantutan',
    'iyot',
    'hinayupak'
]

// Register words with the package too
filter.addWords(...tagalogBadWords)

// Escape special regex characters
const escapeRegex = (word) =>
    word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Match longer phrases first
const patterns = [...new Set(tagalogBadWords)]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegex)

// Match whole words or phrases, ignoring capitalization.
// Flexible spaces allow phrases with repeated spaces.
const tagalogPattern = new RegExp(
    `(^|[^\\p{L}\\p{N}_])(${patterns
        .join('|')
        .replace(/\\ /g, '\\s+')})(?=$|[^\\p{L}\\p{N}_])`,
    'giu'
)

const maskBadWords = (text) => {
    if (typeof text !== 'string') {
        return text
    }

    // Apply the custom Tagalog filter first
    const tagalogFiltered = text.replace(
        tagalogPattern,
        (match, prefix, word) =>
            prefix + '*'.repeat(word.length)
    )

    // Then apply the package's built-in word list
    return filter.clean(tagalogFiltered)
}

module.exports = maskBadWords
