import {getWordsList} from 'most-common-words-by-language';
import fetch from 'node-fetch';

const lang = 'hebrew';
export async function getAllWords(wordsNum = 10000, sLimit = 100) {
    function progress(total, current) {
        return `The word ${current}/${total} is being tested now.`;
    }

    function filter(array, similarityLimit, countLimit) {
        let newArr = array.sort((a, b) => b.similarity - a.similarity);
        newArr = newArr.filter(e => e.similarity > similarityLimit);
        if (typeof countLimit !== 'undefined') {
            newArr = newArr.filter((e, i) => i < countLimit);
        }
        return newArr;
    }

    let count = 1;
    const wordsList = getWordsList(lang, wordsNum);
    let resultList = [];
    for (const word of wordsList) {
        console.log(progress(wordsNum, count++));
        resultList.push(await checkWord(word));
    }

    return filter(resultList, sLimit);
}

export async function checkWord(wordToCheck) {
    let result = await fetch(`https://semantle-he.herokuapp.com/api/distance?word=${wordToCheck}`).then(res => res.json());
    return { word: wordToCheck, similarity: result.similarity };
}

// getAllWords().then(result => {
//     console.log(result);
// });
