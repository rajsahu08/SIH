const mongoose = require('mongoose');
const Title = require('./models/db');

const MONGO_URL = 'mongodb://127.0.0.1:27017/SIH';

main().then(()=>{
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
}
// Soundex Algorithm
function soundex(word) {
    const soundexMap = {
        'B': '1', 'F': '1', 'P': '1', 'V': '1',
        'C': '2', 'G': '2', 'J': '2', 'K': '2', 'Q': '2', 'S': '2', 'X': '2', 'Z': '2',
        'D': '3', 'T': '3',
        'L': '4',
        'M': '5', 'N': '5',
        'R': '6'
    };

    word = word.toUpperCase();
    let firstLetter = word[0];
    let encoded = firstLetter;

    for (let i = 1; i < word.length; i++) {
        let letter = word[i];
        if (soundexMap[letter]) {
            encoded += soundexMap[letter];
        }
    }

    // Removing consecutive duplicates
    let result = firstLetter;
    for (let i = 1; i < encoded.length; i++) {
        if (encoded[i] !== encoded[i - 1]) {
            result += encoded[i];
        }
    }

    // Pad with zeros or trim to length 4
    result = result.substring(0, 4).padEnd(4, '0');
    
    return result;
}

// Metaphone Algorithm
function metaphone(word) {
    word = word.toUpperCase();

    // Replace vowels (except the first letter)
    word = word[0] + word.slice(1).replace(/[AEIOU]/g, '');

    // Common phonetic replacements
    word = word.replace(/PH/g, 'F');
    word = word.replace(/WH/g, 'W');
    word = word.replace(/[BFPV]/g, '1');
    word = word.replace(/[CGJKQSXZ]/g, '2');
    word = word.replace(/[DT]/g, '3');
    word = word.replace(/L/g, '4');
    word = word.replace(/[MN]/g, '5');
    word = word.replace(/R/g, '6');

    // Remove consecutive duplicates
    let result = word[0];
    for (let i = 1; i < word.length; i++) {
        if (word[i] !== word[i - 1]) {
            result += word[i];
        }
    }

    return result;
}

// Levenshtein Distance for Metaphone Comparison
function levenshteinDistance(str1, str2) {
    const lenStr1 = str1.length + 1;
    const lenStr2 = str2.length + 1;

    // Initialize matrix
    const matrix = Array(lenStr1).fill(null).map(() => Array(lenStr2).fill(null));

    // Fill the first row and column
    for (let i = 0; i < lenStr1; i++) {
        matrix[i][0] = i;
    }
    for (let j = 0; j < lenStr2; j++) {
        matrix[0][j] = j;
    }

    // Fill the rest of the matrix
    for (let i = 1; i < lenStr1; i++) {
        for (let j = 1; j < lenStr2; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,       // Deletion
                matrix[i][j - 1] + 1,       // Insertion
                matrix[i - 1][j - 1] + cost // Substitution
            );
        }
    }

    return matrix[lenStr1 - 1][lenStr2 - 1];
}

// Title Verification System
function verifyTitle(newTitle, existingTitles) {
    const newSoundex = soundex(newTitle);
    const newMetaphone = metaphone(newTitle);

    for (const existingTitle of existingTitles) {
        const existingSoundex = soundex(existingTitle);
        const existingMetaphone = metaphone(existingTitle);

        // Soundex comparison (exact match)
        if (newSoundex === existingSoundex) {
            console.log(`Title '${newTitle}' is too similar to '${existingTitle}' based on Soundex.`);
            return false;
        }

        // Metaphone comparison (using similarity threshold)
        const distance = levenshteinDistance(newMetaphone, existingMetaphone);
        const similarityScore = 1 - (distance / Math.max(newMetaphone.length, existingMetaphone.length));

        if (similarityScore > 0.8) {  // Adjust the similarity threshold as needed
            console.log(`Title '${newTitle}' is too similar to '${existingTitle}' based on Metaphone.`);
            return false;
        }
    }

    console.log(`Title '${newTitle}' is unique and can be verified.`);
    return true;
}

const getTitle = async ()=>{
    return await Title.find({},'titleName');
}

// Example Usage

async function getAllTitleNames(newTitle) {
    try {
        const newspapers = await Title.find({}, 'titleName'); // Fetch only titleName field
        const titleNames = newspapers.map(doc => doc.titleName); // Extract titleName into array
        verifyTitle(newTitle, titleNames);
    } catch (error) {
        console.error('Error fetching title names:', error);
    }
}

const newTitle = "crime news";
getAllTitleNames(newTitle);