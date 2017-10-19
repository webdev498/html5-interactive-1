$(document ).ready(function() {

    if (navigator.onLine) {
        //Send the responses reporting to server if exists
        sendStoredReportToServer();
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

    console.log('asdfasdfasdf', localInfo);
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

            console.log('====== Successfully Reported ========', question_id, answer_id);
            
        })
            .fail(function() {
                console.log('+++++++++ Error reporting testing result +++++');
            });
}


/* Save the current state */

saveCurrentState = () => {
    currentRound = currentRound;

    state = {
        currentRound: currentRound,
        currentAnswerSelection: answerArray
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

    answerArray = lastState.currentAnswerSelection;
    if (!answerArray) answerArray = [];

    currentRound = lastState.currentRound;

    //Update the screens with queries
    updateQuestionsAndAnswers(QuizDetail['Activity129']);

    //Go to the corresponding screen
    

    //Set the current round answer section with saved one
    
}
