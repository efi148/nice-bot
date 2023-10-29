import { getWordsList } from 'most-common-words-by-language';
import { Subject } from 'rxjs';
import fetch from 'node-fetch';

const lang = 'hebrew';
const baseURL = 'https://semantle.ishefi.com';
export const logging$ = new Subject();

export async function getAllWords(wordsNum = 10000, sMinLimit = 40, sMaxLimit = 70) {
    function progress(total, current) {
        const fracion = total / 100;
        if (current % fracion == 0) {
            const progressBar = `${current * 100 / total}% passed...`;
            logging$.next(progressBar);
        }
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
    const resultList = [];
    let wordsListIndex = 0;

    function getSemantleWordsList() {
        return new Promise((resolve, reject) => {
            async function processNextWord() {
                if (wordsListIndex < wordsList.length) {
                    try {
                        const currentWord = await checkWord(wordsList[wordsListIndex]);
                        resultList.push(currentWord);
                        wordsListIndex++;
                        progress(wordsNum, count++);
                        setTimeout(processNextWord, 2000);
                    } catch (error) {
                        reject(error);
                    }
                } else {
                    logging$.next('DONE!');
                    resolve(resultList);
                }
            }

            processNextWord();
        });
    }

    try {
        const returnData = await getSemantleWordsList().then(result => {
            return filter(result, sMinLimit, sMaxLimit);
        });

        return returnData;
    } catch (err) {
        throw err;
    }

}

async function checkWord(wordToCheck) {
    let result = await fetch(`${baseURL}/api/distance?word=${wordToCheck}`).then(res => res.json());
    return { word: wordToCheck, similarity: result.similarity, distance: result.distance };
}
