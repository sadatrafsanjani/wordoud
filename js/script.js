$(function(){

    /*  ======================= SETUP ======================= */
    let config = {
        trace: true,
        spiralResolution: 1,
        spiralLimit: 360 * 5,
        lineHeight: 0.8,
        xWordPadding: 0,
        yWordPadding: 3,
        font: "sans-serif"
    }

    let words = ["words", "are", "cool", "and", "so", "are", "you", "inconstituent", "funhouse!", "apart", "from", "Steve", "fish"].map(function(word) {
        return {
            word: word,
            freq: Math.floor(Math.random() * 50) + 10
        }
    })

    words.sort(function(a, b) {
        return -1 * (a.freq - b.freq);
    });

    let cloud = document.getElementById("word-cloud");
    cloud.style.position = "relative";
    cloud.style.fontFamily = config.font;

    let traceCanvas = document.createElement("canvas");
    traceCanvas.width = cloud.offsetWidth;
    traceCanvas.height = cloud.offsetHeight;
    let traceCanvasCtx = traceCanvas.getContext("2d");
    cloud.appendChild(traceCanvas);

    let startPoint = {
        x: cloud.offsetWidth / 2,
        y: cloud.offsetHeight / 2
    };

    let wordsDown = [];
    /* ======================= END SETUP ======================= */





    /* =======================  PLACEMENT FUNCTIONS =======================  */
    function createWordObject(word, freq) {
        let wordContainer = document.createElement("div");
        wordContainer.style.position = "absolute";
        wordContainer.style.fontSize = freq + "px";
        wordContainer.style.lineHeight = config.lineHeight;
        /*    wordContainer.style.transform = "translateX(-50%) translateY(-50%)";*/
        wordContainer.appendChild(document.createTextNode(word));

        return wordContainer;
    }

    function placeWord(word, x, y) {

        cloud.appendChild(word);
        word.style.left = x - word.offsetWidth/2 + "px";
        word.style.top = y - word.offsetHeight/2 + "px";

        wordsDown.push(word.getBoundingClientRect());
    }

    function trace(x, y) {
//     traceCanvasCtx.lineTo(x, y);
//     traceCanvasCtx.stroke();
        traceCanvasCtx.fillRect(x, y, 1, 1);
    }

    function spiral(i, callback) {
        angle = config.spiralResolution * i;
        x = (1 + angle) * Math.cos(angle);
        y = (1 + angle) * Math.sin(angle);
        return callback ? callback() : null;
    }

    function intersect(word, x, y) {
        cloud.appendChild(word);

        word.style.left = x - word.offsetWidth/2 + "px";
        word.style.top = y - word.offsetHeight/2 + "px";

        let currentWord = word.getBoundingClientRect();

        cloud.removeChild(word);

        for(let i = 0; i < wordsDown.length; i+=1){
            let comparisonWord = wordsDown[i];

            if(!(currentWord.right + config.xWordPadding < comparisonWord.left - config.xWordPadding ||
                currentWord.left - config.xWordPadding > comparisonWord.right + config.wXordPadding ||
                currentWord.bottom + config.yWordPadding < comparisonWord.top - config.yWordPadding ||
                currentWord.top - config.yWordPadding > comparisonWord.bottom + config.yWordPadding)){

                return true;
            }
        }

        return false;
    }
    /* =======================  END PLACEMENT FUNCTIONS =======================  */





    /* =======================  LETS GO! =======================  */
    (function placeWords() {
        for (let i = 0; i < words.length; i += 1) {

            let word = createWordObject(words[i].word, words[i].freq);

            for (let j = 0; j < config.spiralLimit; j++) {
                //If the spiral function returns true, we've placed the word down and can break from the j loop
                if (spiral(j, function() {
                    if (!intersect(word, startPoint.x + x, startPoint.y + y)) {
                        placeWord(word, startPoint.x + x, startPoint.y + y);
                        return true;
                    }
                })) {
                    break;
                }
            }
        }
    })();




    document.getElementById('btn').addEventListener('click', function (){

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {

            const tab = tabs[0];

            chrome.scripting.executeScript({

                target : {tabId: tab.id},

                func: function () {

                    let text =  document.body.innerText;

                    if((text === null) || (text === "")){
                        console.error("No data found!")
                    }
                    else{
                        text = text.replace(/(<([^>]+)>)/ig, "").replace(/[0-9]/g, '').replace(/\s+/, "\s");
                        text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
                    }

                    console.log(text);
                }
            });
        });

    });

});
//
// package org.city.rtgs;
//
//
// import java.util.*;
//
// public class App {
//
//     public static double tf(List<String> doc, String term) {
//     double result = 0;
//     for (String word : doc) {
//     if (term.equalsIgnoreCase(word))
//     result++;
// }
// return result / doc.size();
// }
//
// public static double idf(List<List<String>> docs, String term) {
//     double n = 0;
//     for (List<String> doc : docs) {
//         for (String word : doc) {
//             if (term.equalsIgnoreCase(word)) {
//                 n++;
//                 break;
//             }
//         }
//     }
//     return Math.log(docs.size() / n);
// }
//
// public static double tfIdf(List<String> doc, List<List<String>> docs, String term) {
//     return tf(doc, term) * idf(docs, term);
//
// }
//
// public static void main(String[] args) {
//
//     String data[] = {"the", "a", "an", "am", "is", "are", "was", "were",
//         "have", "has", "had", "shall", "will", "be", "each", "many",
//         "much", "i","we", "he","she","they", "us", "for", "in", "of",
//         "to", "can", "could", "would", "this", "that", "with", "which",
//         "when", "what", "it", "there", "therefore"};
//     Set<String> set = new HashSet<>(Arrays.asList(data));
//
//     String text = "In document d, the frequency represents the number of instances of a given word t. " +
//         "Therefore, we can see that it becomes more relevant when a word appears in the text, " +
//         "which is rational. Since the ordering of terms is not " +
//         "significant, we can use a vector to describe the text in the bag of term models. " +
//         "For each specific term in the paper, there is an entry with the value being the term frequency.";
//
//
//     StringTokenizer stringTokenizer = new StringTokenizer(text, ".");
//
//     List<List<String>> docs = new ArrayList<>();
//
//     while(stringTokenizer.hasMoreTokens()){
//
//         String doc = stringTokenizer.nextToken().trim().replace(",", "");
//
//         StringTokenizer tokenizer = new StringTokenizer(doc, " ");
//
//         List<String> t = new ArrayList<>();
//
//         while(tokenizer.hasMoreTokens()){
//
//             String token = tokenizer.nextToken().toLowerCase();
//
//             if(!set.contains(token) && token.length() > 2){
//                 t.add(token);
//             }
//         }
//
//         docs.add(t);
//         t = new ArrayList<>();
//     }
//
//     Map<String, Double> map = new HashMap<>();
//
//     docs.forEach(doc -> {
//
//         doc.forEach(word ->{
//
//             double tfidf = tfIdf(doc, docs, word)*100;
//
//             if(map.containsKey(word)){
//
//                 double value = map.get(word);
//
//                 if(tfidf > value){
//                     map.replace(word, tfidf);
//                 }
//             }
//             else{
//                 map.put(word, tfidf);
//             }
//         });
//     });
//
//     for(String v : map.keySet()){
//         System.out.println(v + " = " + map.get(v));
//     }
// }
// }
