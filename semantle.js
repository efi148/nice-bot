import {getWordsList} from 'most-common-words-by-language';
import {Subject} from 'rxjs';
import fetch from 'node-fetch';

const lang = 'hebrew';
export const logging$ = new Subject();

export async function getAllWords(wordsNum = 10000, sMinLimit = 40, sMaxLimit = 70) {
    function progress(total, current) {
        const section = total / 10;
        if (current % section == 0) {
            const progress = current / section;
            const empty = '_';
            const full = '*';
            const progressBar = `${current}/${total}\n[${full.repeat(progress)}${empty.repeat(10 - progress)}]`;
            logging$.next(progressBar);
        }
        // if (current % 10 == 0) logging$.next(`The word ${current}/${total} is being tested now.`);
    }

    function filter(array, similarityMinLimit, similarityMaxLimit, countLimit) {
        let newArr = array.sort((a, b) => b.similarity - a.similarity);
        newArr = newArr.filter(e => e.similarity > similarityMinLimit &&
                                    e.similarity < similarityMaxLimit &&
                                    e.similarity != null);
        if (typeof countLimit !== 'undefined') {
            newArr = newArr.filter((e, i) => i < countLimit);
        }
        return newArr;
    }

    let count = 1;
    const wordsList = getWordsList(lang, wordsNum);
    let resultList = [];
    for (const word of wordsList) {
        await progress(wordsNum, count++);
        resultList.push(await checkWord(word));
    }

    return filter(resultList, sMinLimit, sMaxLimit);
}

export async function checkWord(wordToCheck) {
    let result = await fetch(`https://semantle-he.herokuapp.com/api/distance?word=${wordToCheck}`).then(res => res.json());
    return {word: wordToCheck, similarity: result.similarity, distance: result.distance};
}
