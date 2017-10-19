let isNetworkOnline = false;

let ROUND_CURRENT_INDEX = 1;
let Answer_Pass_Index = 0;
let QuizDetail;
let canGoNext = false;
let totalCorrectNum = 0;
let current_round_correct_num = 0;

let currentRoundAnswerIDs = [ 0, 0, 0, 0 ];



const arrayMenuForGSK = [
    {img: 'answer_none.png', text: 'NO VACCINATION REQUIRED' },
    {img: 'answer_ped.png', text: 'PEDIARIX' },
    {img: 'answer_inf.png', text: 'INFANRIX' },
    {img: 'answer_kin.png', text: 'KINRIX' },
];
let dropMenu;

let correctGSKAnswerIndexes = [];
let correctSanofiAnswerIndexes = [];
let answerArray = [];
let currentRound = 0;

/* Refresh the question  */
refreshBoardWithInfo = (qInfo) => {
    //Hide the correct & incorrect label
    $('.correct-container').css('display', 'none');
    $('.incorrect-container').css('display', 'none');

    //Display the check schedule button instead of next button
    $('.pt-btn-check').css('display', 'block');
    $('.pt-btn-next').css('display', 'none');

    //Disable check answer button
    $('.pt-btn-check').toggleClass('pt-btn-check-inactive');

    //Clear the remediation box
    if ($('.answer-container-fixed')){
        $('.answer-container-fixed').remove();
    }

    //Get the answer container div
    $answerContainer = $('.answer-container');

    //Clear inside it
    $answerContainer.empty();

    //Clear answer array
    answerArray = [];

    //Create the touch-div
    const countTouchDiv = 16;
    const answerDivWidth = 64;
    for (i = 0; i < countTouchDiv; i ++) {
        answerArray.push(-1);

        $answerDiv = $( "<div class='answer-element' data-menu-index=" + i + "></div>" );
        $touchTextDiv = $( "<div class='touch-text'>Touch to Assign</div>" );

        $answerDiv.css('left', i * answerDivWidth);
        $answerDiv.append($touchTextDiv);

        $dropdownMenu = createDropdownMenu(arrayMenuForGSK);
        $answerDiv.append($dropdownMenu);

        $answerContainer.append($answerDiv);
        
    }

    //Init dropbox
    dropMenu = new cbpTooltipMenu( document.getElementById( 'answer-container' ) );
}

/* Create the dropdown menu */
createDropdownMenu = (menuArray) => {
    $divEl = $('<div class="drop-temp"></div>');
    $ulElement = $("<ul class='cbp-tm-submenu'></ul>");

    $.each(menuArray, function( index, menuObj ) {
        $liEl = $("<li data-answer-index=" + index + " data-img='" + menuObj.img + "'><a class='dropdown-menu-item'>" + menuObj.text + "</a></li>");
        $ulElement.append($liEl);
    });

    $divEl.append($ulElement);

    return $divEl;
}

/* Document Event Handler : Touch to document for drop menu close*/
$(document).click(function(e) {
    let targetClassName = $(e.target).attr('class');
    // console.log('target class', targetClassName);
    if (targetClassName && !targetClassName.includes('touch-text') && !targetClassName.includes('answer-element')) {
        dropMenu._closeOpenMenu();
    }
    
});

createRemediation = (correntAnswerArray) => {
    //Get the answer container div
    $answerContainer = $('<div class="answer-container answer-container-fixed"></div>');

    //Add the background image
    $divBgIm = $('<div class="bg-img"></div>');
    $answerContainer.append($divBgIm);


    //Create the touch-div
    const countTouchDiv = 16;
    const answerDivWidth = 64;
    for (i = 0; i < countTouchDiv; i ++) {
        correctAnswerIndex = correntAnswerArray[i];

        $answerDiv = $( "<div class='answer-element'></div>" );
        $answerDiv.css('left', i * answerDivWidth);

        $imgEl = $('<img src="images/buttons/' + arrayMenuForGSK[correctAnswerIndex].img + '"></img>');
        $answerImgDiv = $( "<div class='answer-image-div'></div>" );
        $answerImgDiv.append($imgEl);

        $answerDiv.append($answerImgDiv);

        $answerContainer.append($answerDiv);
    }

    return $answerContainer;
}

/* Event Handler : Clicked on the one answer on the dropdown */
onSelectedAnswer = ($answerEl, answerIndex, imgSrc) => {
    const menuIndex = $answerEl.attr('data-menu-index');

    //Update the content according to the answer
    $divEl = $('<div class="answer-image-div"></div>');
    $imgEl = $('<img src="images/buttons/' + imgSrc + '"></img>');
    $divEl.append($imgEl);

    $answerEl.find(':first-child').first().replaceWith($divEl);

    //Update the answer array
    answerArray[menuIndex * 1] = answerIndex;

    //Check if all are picked
    checkResult = $.inArray(-1, answerArray);
    if (checkResult == -1) { 
        $('.pt-btn-check').removeClass('pt-btn-check-inactive');
    }
}

/* Check the answer result */

checkAnswersResult = () => {

    const countAnswerCountsPerRound = 16;
    let correctAnswerIndexes;
    if (currentRound == 0) correctAnswerIndexes = correctGSKAnswerIndexes;  //GSK
    else correctAnswerIndexes = correctSanofiAnswerIndexes;  //Sanofi

    let correctNum = 0;
    for (i = 0; i < countAnswerCountsPerRound; i ++) {
        if (answerArray[i] != correctAnswerIndexes[i]) break;
        correctNum ++;
    }

    if (correctNum == countAnswerCountsPerRound)
        return true;
    else
        return false;
}

/* Event Handler : Check button clicked */
$('.pt-btn-check').click(function() {
    //Display the next schedule button instead of check button
    $('.pt-btn-next').css('display', 'block');
    $('.pt-btn-check').css('display', 'none');

    //Check answers
    if(checkAnswersResult() == true) {
        //Show correct label
        $('.correct-container').css('display', 'block');
    }
    else{
        //Show incorrect label
        $('.incorrect-container').css('display', 'block');

        //Show correct answer
        let correctAnswerIndexes;
        if (currentRound == 0) correctAnswerIndexes = correctGSKAnswerIndexes;  //GSK
        else correctAnswerIndexes = correctSanofiAnswerIndexes;  //Sanofi
        $remediationBox = createRemediation(correctAnswerIndexes);
        $('.pt-page').append($remediationBox);
    }
});

/* Event Handler : Next button clicked */
$('.pt-btn-next').click(function() {
    if (currentRound == 0) {
        currentRound ++;
        refreshBoardWithInfo();
    }
});


/* Document Ready for initial work */

$(document ).ready(function() {
    
    //At first, refresh the board
    refreshBoardWithInfo();

    if (navigator.onLine) {
        //Send the responses reporting to server if exists
        sendStoredReportToServer();
    }

    if (loadLastState() == false) { //Tried to load the last state first. If failed~~~~~~~~~~~
    
        if (navigator.onLine) { // ------------- Online mode -----------
            isNetworkOnline = true;

            //Get Activity JSON
            $.post("https://gsk.mc3tt.com/tabletop/activities/getactivity/", { activity_id: 129 }, function(data){

                //Get the quiz info
                QuizDetail = $.parseJSON(data);

                //Store browser support
                localStorage.setItem("activity_json", data);

                //Update the screens with queries
                updateQuestionsAndAnswers(QuizDetail['Activity129']);
                
            })
                .fail(function() {
                    console.log('Something went wrong!');
                });
        }
        else { // ---------------- Offline mode-------------
            isNetworkOnline = false;

            //Check if browser supports the local storage
            if (typeof(Storage) !== "undefined") {
                let activity_json = localStorage.getItem("activity_json");
                if (!activity_json) {
                    $('#popup-alert-internet-div').css('display', 'block');
                    return;
                }
                else {
                    QuizDetail = $.parseJSON(activity_json);
                    //Update the screens with queries
                    updateQuestionsAndAnswers(QuizDetail['Activity129']);

                    //Enable Start Button
                    $('.pt-btn-begin').removeClass('pt-btn-begin-inactive');
                    $('.pt-btn-begin').toggleClass('pulse-button');

                }
            } else {
                alert('Sorry! No Web Storage support..');
            }
            
        }
    }

});

/* Update the questions and answers with activity json info */

updateQuestionsAndAnswers = (quizInfo) => {

    //Get the GSK answers
    correctGSKAnswerIndexes = [];
    for (i = 1; i <= 16; i ++) {
        correctAnswerID = quizInfo['Question' + i][4][1];

        answers = quizInfo['Question' + i][5][1].split('&&');
        $.each(answers, function( index, answerObj ) {
            answerID = answerObj.split('||')[0];
            if (answerID == correctAnswerID) {
                correctGSKAnswerIndexes.push(index);
            }
        });
    }

    //Get Sanofi answers
    correctSanofiAnswerIndexes = [];
    for (i = 17; i <= 32; i ++) {
        correctAnswerID = quizInfo['Question' + i][4][1];

        answers = quizInfo['Question' + i][5][1].split('&&');
        $.each(answers, function( index, answerObj ) {
            answerID = answerObj.split('||')[0];
            if (answerID == correctAnswerID) {
                correctSanofiAnswerIndexes.push(index);
            }
        });
    }

    console.log('=======correct answer indexes:', correctGSKAnswerIndexes);
    console.log('=======correct answer indexes:', correctSanofiAnswerIndexes);

}

/* Store the reports to localStorage */

storeReportToLocalStorage = (question_id, answer_id, score) => {
    console.log('-----------Locally Stored the report : ', question_id, answer_id, score);
    var storedReport = JSON.parse(localStorage.getItem("reports"));
    if (!storedReport) storedReport = [];

    storedReport.push({
        question_id: question_id,
        answer_id: answer_id,
        score: score
    });

    localStorage.setItem("reports", JSON.stringify(storedReport));
}

/* Send the stored answering report to server */

sendStoredReportToServer = () => {
    var storedReport = JSON.parse(localStorage.getItem("reports"));

    if (storedReport) {
        $.each(storedReport, function( index, reportObj ) {
            var { question_id, answer_id, score } = reportObj;
            sendReportToServer(question_id, answer_id, score);
        });

        //Remove the reports in local storage
        localStorage.removeItem('reports');
    }
    
}

/* Send the answering report to server */

sendReportToServer = (question_id, answer_id, score) => {
    let localInfo = $.parseJSON(currentJSONString);
    let eventID = localInfo.TTInfoDictionary.TTInfo[0][1];
    let userID = localInfo.TTInfoDictionary.TTInfo[1][1];

    $.post("https://gsk.mc3tt.com/tabletop/activities/addactivitycompetition/", 
            { 
                activity_id: 124,
                user_id: userID,
                event_id: eventID,
                question_id: question_id,
                answer_id: answer_id,
                answer_text: ' ',
                score: score
            }, function(data){

            console.log('====== Successfully Reported ========', question_id, answer_id);
            
        })
            .fail(function() {
                console.log('+++++++++ Error reporting testing result +++++');
            });
}

/* 
- Check if all answers are selected
- Calculate the score
- Update the Answer Review screen elements
- Post or store the answer report
- Display the final Correct or Incorrect symbol
*/
checkCanGoNext = () => {
    let quizInfo = QuizDetail['Activity124'];
    var isAllSelected = true;
    
    
    //Check if all answers are selected
    for (index = 1; index <= 4; index ++) {
        let questionIndex = (ROUND_CURRENT_INDEX - 1) * 4 + index;
        let nameValue = 'answersGroup-' + questionIndex;
        let checkedIDValue = $('input:radio[name=' + nameValue + ']:checked').val();

        if (isAllSelected && checkedIDValue == 'answer-id-default-' + questionIndex){
            //Show the alert view
            $('#popup-alert-div').css('display', 'block');
            isAllSelected = false;

            return false;
        }
    }

    //Calculate the correct answers
    current_round_correct_num = 0;
    for (index = 1; index <= 4; index ++) {
        let questionIndex = (ROUND_CURRENT_INDEX - 1) * 4 + index;
        let nameValue = 'answersGroup-' + questionIndex;
        let checkedIDValue = $('input:radio[name=' + nameValue + ']:checked').val();
        let correctAnswerID = quizInfo['Question' + questionIndex][4][1];
        let answerID = checkedIDValue.split('-').pop();
        let score = 0;
        if (correctAnswerID == answerID) {
            //Increase the total correct count
            totalCorrectNum ++;

            //Save the correct number for this round
            current_round_correct_num ++;

            //Set the score
            score = 100;

            //Remove the correct answer label
            $targetCorrectAnswerLabel = $('#round-' + ROUND_CURRENT_INDEX + '-' + index + '-correct-answer');
            $targetCorrectAnswerLabel.css('display', 'none');
        }

        //Update the contents on Answer Review Screen (Dropdown menu and correct answers underneath the incorrect answer)
        let strTargetID = 'round-' + ROUND_CURRENT_INDEX + '-' + index + '-dropdown';
        $targetDropDownAnswer = $('#' + strTargetID + '-answer');
        nameValue = 'answersGroup-' + questionIndex + '-answer';
        IDValue = 'answer-id-default-' + questionIndex + '-answer';
        selectedAnswerValue = $('label[for=' + checkedIDValue + ']').text();

        $newRadio = $( "<input type='radio' name='" + nameValue + "' value='" + IDValue + "' checked='checked' id='" + IDValue + "'>" );
        $newLabel = $( "<label for='answer-id-0'>" + selectedAnswerValue + "</label>" );
        $targetDropDownAnswer.append($newRadio);
        $targetDropDownAnswer.append($newLabel);

        //Send the report to server
        let questionID = quizInfo['Question' + questionIndex][0][1];
        if (navigator.onLine) {  //Sending to server
            sendReportToServer(questionID, answerID, score);
        }
        else { //Store it in local storage
            storeReportToLocalStorage(questionID, answerID, score);
        }
    }

    if(current_round_correct_num == 4) {  //Display Correct
        $('#pt-btn-check-result-' + ROUND_CURRENT_INDEX).toggleClass('pt-btn-check-result-correct');
    }
    else{ //Display Incorrect
        $('#pt-btn-check-result-' + ROUND_CURRENT_INDEX).toggleClass('pt-btn-check-result-incorrect');
    }

    //Update the score board
    $('.pt-score-label .number-score').text(totalCorrectNum * 100);

    //Increase the answer index
    Answer_Pass_Index ++;

    //Save the state
    saveCurrentState();

    //Refresh the selected answers
    currentRoundAnswerIDs = [0, 0, 0, 0];

    return isAllSelected;
}

/* Update answer section */
updateAnswerDropdown = (answerIDs) => {
    if (answerIDs) {
        $.each(answerIDs, function( index, idValue ) {
            if (idValue == 0) return;
            $('#round-' + ROUND_CURRENT_INDEX + '-' + (index + 1) + '-dropdown ' + idValue).prop("checked", true)
        });
    }
}


/* Save the current state */

saveCurrentState = () => {
    currentRound = Answer_Pass_Index;
    currentCorrentNum = totalCorrectNum;

    // if (currentRound >= 3) {
    //     localStorage.removeItem("lastState");
    //     return;
    // }

    state = {
        currentRound: currentRound,
        currentCorrectNum: totalCorrectNum,
        currentAnswerSelection: currentRoundAnswerIDs
    }
    localStorage.setItem("lastState", JSON.stringify(state));
}

/* Load the last state */

loadLastState = () => {
    if (typeof(Storage) !== "undefined") {
        let activity_json = localStorage.getItem("activity_json");
        if (!activity_json)
            return false;

        lastState = JSON.parse(localStorage.getItem("lastState"));
        if (!lastState)
            return false;

        QuizDetail = $.parseJSON(activity_json);

        //Enable Start Button
        $('.pt-btn-begin').removeClass('pt-btn-begin-inactive');
        $('.pt-btn-begin').toggleClass('pulse-button');

        //Reset the app 
        resetWithState(lastState);

        return true;
    }

    return false;
}

/* Reset the app with state */
resetWithState = (state) => {
    //Initialize the global variables
    if (navigator.onLine) isNetworkOnline = true;
    else isNetworkOnline = false;
    canGoNext = false;

    currentRoundAnswerIDs = lastState.currentAnswerSelection;
    if (!currentRoundAnswerIDs) currentRoundAnswerIDs = [0, 0, 0, 0];

    ROUND_CURRENT_INDEX = lastState.currentRound + 1;
    Answer_Pass_Index = lastState.currentRound;
    totalCorrectNum = lastState.currentCorrectNum;
    current_round_correct_num = 0;

    //Update the screens with queries
    updateQuestionsAndAnswers(QuizDetail['Activity129']);

    //Go to the corresponding screen
    PageTransitions.gotoPage(Answer_Pass_Index * 2 + 1);

    //Update the score board
    $('.pt-score-label .number-score').text(totalCorrectNum * 100);

    //Update the result page
    if(Answer_Pass_Index >= 3) {
        //Display the total earned points
        $('#final-earned-points').text(totalCorrectNum * 100 + ' POINTS');

        //Display the count of correct answers
        $('#result-text').text(totalCorrectNum + '/12');
    }

    //Set the current round answer section with saved one
    updateAnswerDropdown(currentRoundAnswerIDs);
}




/* Event Handler : Close button clicked */

$('.pt-btn-close').click(function() {
    window.location.href = "../index.html";
});

/* Event Handler : OK button clicked in all answer request popup */

$('.pt-btn-popup-ok').click(function() {
    $('#popup-alert-div').css('display', 'none');
});

/* Event Handler : Continue button clicked on Answer review screen for each round */

$('.pt-btn-continue').click(function() {
    ROUND_CURRENT_INDEX ++;
});

/* Event Handler : Result(Continue) button clicked on final 3th round's Answer Review*/
$('.pt-btn-result').click(function() {
    ROUND_CURRENT_INDEX ++;

    //Display the total earned points
    $('#final-earned-points').text(totalCorrectNum * 100 + ' POINTS');

    //Display the count of correct answers
    $('#result-text').text(totalCorrectNum + '/12');
    
});





