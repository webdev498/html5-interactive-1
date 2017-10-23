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
                }
            } else {
                alert('Sorry! No Web Storage support..');
            }
            
        }
    }

});

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
                activity_id: 129,
                user_id: userID,
                event_id: eventID,
                question_id: question_id,
                answer_id: answer_id,
                answer_text: ' ',
                score: score
            }, function(data){

            // console.log('====== Successfully Reported ========', question_id, answer_id);
            
        })
            .fail(function() {
                console.log('+++++++++ Error reporting testing result +++++');
            });
}


/* Save the current state */

saveCurrentState = (stageIndex) => {
    currentRound = currentRound;

    state = {
        currentRound: currentRound,
        currentAnswerSelection: answerArray,
        currentAttempt: currentAttempCount,
        answerStageIndex: currentAnswerStage,
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

    lastAnswerArray = lastState.currentAnswerSelection;
    if (!lastAnswerArray) lastAnswerArray = [];

    currentRound = lastState.currentRound;
    currentAttempCount = lastState.currentAttempt;
    currentAnswerStage = lastState.answerStageIndex;

    //Update the screens with queries
    updateQuestionsAndAnswers(QuizDetail['Activity129']);

    if (currentRound < MAX_ROUND) {
        //Go to the corresponding screen
        refreshBoardWithInfo();

        //Load the last answer selection
        loadLastAnswers(lastAnswerArray);

        //Load the attempt status
        loadAttemptStatus();
    }
    else 
    {
        goToCongret();
    }

    
}
