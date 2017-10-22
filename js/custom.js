let isNetworkOnline = false;

let QuizDetail;
const MAX_ROUND = 2;
const MAX_ATTEMP_COUNT = 2;
let currentAttempCount = 0;

const arrayBgImgs = [
    'images/backgrounds/gsk_bg.png',
    'images/backgrounds/sanofi_bg.png',
];

const arrayRemBgImgs = [
    'images/backgrounds/remediation_bg.png',
    'images/backgrounds/remediation_sanofi_bg.png',
];

const arrayMenus = [
    [
        {img: 'answer_none.png', text: 'NO VACCINATION REQUIRED' },
        {img: 'answer_ped.png', text: 'PEDIARIX' },
        {img: 'answer_inf.png', text: 'INFANRIX' },
        {img: 'answer_kin.png', text: 'KINRIX' },
    ],

    [
        {img: 'answer_none.png', text: 'NO VACCINATION REQUIRED' },
        {img: 'answer_pen.png', text: 'PENTACEL' },
        {img: 'answer_dap.png', text: 'DAPTACEL' },
    ]
];
let dropMenu;

let correctGSKAnswerIndexes = [];
let correctSanofiAnswerIndexes = [];
let answerArray = [];
let currentRound = 0;

/* Refresh the question  */
refreshBoardWithInfo = (isRefreshAnswer = true) => {
    console.log('refresh called');

    //Change background according to round
    $('.pt-page').css('background-image', "url(" + arrayBgImgs[currentRound] + ")");

    //Update the check and next buttons according to the round
    $('.pt-btn-check').addClass('pt-btn-check-' + currentRound);
    $('.pt-btn-next').addClass('pt-btn-next-' + currentRound);
    $('.pt-btn-try').addClass('pt-btn-try-' + currentRound);

    //Hide the correct & incorrect label
    $('.correct-container').css('display', 'none');
    $('.incorrect-container').css('display', 'none');

    //Display the check schedule button instead of next button
    $('.pt-btn-check').css('display', 'block');
    $('.pt-btn-next').css('display', 'none');
    $('.pt-btn-try').css('display', 'none');

    //Disable check answer button
    $('.pt-btn-check').addClass('pt-btn-check-inactive');
    $('.pt-btn-check').addClass('pt-btn-check-inactive-' + currentRound);

    //Clear the remediation box
    if ($('.answer-container-fixed')){
        $('.answer-container-fixed').remove();
    }

    //Enable the answer dropdown 
    $('.answer-container').css('pointer-events', 'auto');

    if (isRefreshAnswer) { 
        //Get the answer container div
        $answerContainer = $('.answer-container');

        //Clear inside it
        $answerContainer.empty();

        //Clear answer array
        answerArray = [];

        //Set const variable for dropdown menu touch area
        const countTouchDiv = 16;
        const answerDivWidth = 64;  

        //Create the touch-div
        for (i = 0; i < countTouchDiv; i ++) {
            answerArray.push(-1);

            $answerDiv = $( "<div class='answer-element' data-menu-index=" + i + "></div>" );
            $touchTextDiv = $( "<div class='touch-text'>Touch to Assign</div>" );

            $answerDiv.css('left', i * answerDivWidth);
            $answerDiv.append($touchTextDiv);

            $dropdownMenu = createDropdownMenu(arrayMenus[currentRound]);
            $answerDiv.append($dropdownMenu);

            $answerContainer.append($answerDiv);
            
        }

        //Init dropbox
        dropMenu = new cbpTooltipMenu( document.getElementById( 'answer-container' ) );
    }
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

        $imgEl = $('<img src="images/buttons/' + arrayMenus[currentRound][correctAnswerIndex].img + '"></img>');
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
        $('.pt-btn-check').removeClass('pt-btn-check-inactive-' + currentRound);
    }

    //Save state
    saveCurrentState();

}

/* Fill the answers of last state */
loadLastAnswers = (lastAnswerArray) => {

    $("#answer-container .answer-element").each(function(index) {
        correctAnswerIndex = lastAnswerArray[index];
        if (correctAnswerIndex < 0) return;

        //Update the content according to the answer
        $divEl = $('<div class="answer-image-div"></div>');
        $imgEl = $('<img src="images/buttons/' + arrayMenus[currentRound][correctAnswerIndex].img + '"></img>');
        $divEl.append($imgEl);

        $(this).find(':first-child').first().replaceWith($divEl);

        //Update the answer array
        answerArray[index] = lastAnswerArray[index];
    });

    //Check if all are picked
    checkResult = $.inArray(-1, answerArray);
    if (checkResult == -1) { 
        $('.pt-btn-check').removeClass('pt-btn-check-inactive');
        $('.pt-btn-check').removeClass('pt-btn-check-inactive-' + currentRound);
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
        if (answerArray[i] == correctAnswerIndexes[i]) correctNum ++;

        //Post answer result to server or localstorage
        score = 0;
        questionInfo = QuizDetail['Activity129']['Question' + ((i * 1 + 1) + (currentRound * countAnswerCountsPerRound))];       
        questionID = questionInfo[0][1];
        answerID = questionInfo[5][1].split('&&')[answerArray[i]].split('||')[0];
        if (navigator.onLine) {  //Sending to server
            sendReportToServer(questionID, answerID, score);
        }
        else { //Store it in local storage
            storeReportToLocalStorage(questionID, answerID, score);
        }
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
    $('.pt-btn-try').css('display', 'none');

    //Disable the dropdown when remediation
    $('.answer-container').css('pointer-events', 'none');

    //Check answers
    if(checkAnswersResult() == true) {
        //Show correct label
        $('.correct-container').css('display', 'block');
    }
    else{
        currentAttempCount ++;
        if (currentAttempCount >= MAX_ATTEMP_COUNT) {
            //Update the incorrect description
            $('.incorrect-container .incorrect-description').html('Please review the correct immunization schedule below.<br/>Touch the Next Schedule button to continue');
            //Show incorrect label
            $('.incorrect-container').css('display', 'block');
        
            //Show correct answer remediation
            let correctAnswerIndexes;
            if (currentRound == 0) correctAnswerIndexes = correctGSKAnswerIndexes;  //GSK
            else correctAnswerIndexes = correctSanofiAnswerIndexes;  //Sanofi
            $remediationBox = createRemediation(correctAnswerIndexes);
            $('.pt-page').append($remediationBox);
    
            //Update the background of remediation bg according to round
            $('.answer-container-fixed .bg-img').css('background-image', "url(" + arrayRemBgImgs[currentRound] + ")");
        }
        else
        {
            //Display the try again button instead of next button
            $('.pt-btn-next').css('display', 'none');
            $('.pt-btn-check').css('display', 'none');
            $('.pt-btn-try').css('display', 'block');

            //Update the incorrect description
            $('.incorrect-container .incorrect-description').html('Touch Try Again. <br/>Review/reassign your responses and then touch Check Answer.');
            //Show incorrect label
            $('.incorrect-container').css('display', 'block');

        }
        
    }
});

/* Event Handler : Next button clicked */
$('.pt-btn-next').click(function() {
    if (currentRound + 1 < MAX_ROUND) {
        currentRound ++;
        currentAttempCount = 0;

        refreshBoardWithInfo();

        //Save state
        saveCurrentState();
    }
    else {
        $('.congret-container').css('display', 'block');
    }
});

/* Event Handler : Try Again button clicked */
$('.pt-btn-try').click(function() {
    refreshBoardWithInfo(false); //Don't refresh the answers

    //Save state
    saveCurrentState();
});

/* Event Handler : Close button clicked */

$('.pt-btn-close').click(function() {
    window.location.href = "../index.html";
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

