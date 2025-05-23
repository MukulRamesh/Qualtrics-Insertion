Qualtrics.SurveyEngine.addOnload(function() {
    var qthis = this;  
  
    //=============================================
    // settings you can change
    //=============================================
    
    // sentence to be displayed
    var sentence = "Health inspection that found rat infestation forces busy supermarket in Surrey to shut";
    
    // instruction texts
    var instructionTitle = "Self-Paced Reading Test";
    var instructionText1 = "You will see a sentence with most words hidden (shown as underscores).";
    var instructionText2 = "Click to reveal one new word at a time.";
    var instructionText3 = "After reading the entire sentence, you'll see five digits, then be asked if a spelled-out digit was among them.";
    var instructionText4 = "Finally, you'll be asked to type out what you remember from the sentence.";
    var fullscreenInstructionText = "This experiment requires full-screen mode for optimal performance. Please click the button below to enter full-screen mode. If you exit full-screen during the experiment, it will pause.";
    var fullscreenManualText = "You can also press F11 on your keyboard to enter full-screen mode.";
    var fullscreenButtonText = "Enter Full-Screen Mode";
    var fullscreenExitedText = "You have exited full-screen mode. Please click the button below to return to full-screen and continue the experiment.";
    var returnToFullscreenText = "Return to Full-Screen";
    var startButtonText = "Click to Start";
    var clickToAdvanceText = "Click to advance";
    
    // question prompts
    var digitQuestionText = "Was the word \"{spelled}\" among the digits you saw?";
    var yesButtonText = "Yes";
    var noButtonText = "No";
    var freeRecallTitle = "Free Recall";
    var freeRecallPrompt = "Please type the sentence you saw as exactly as you can:";
    var submitButtonText = "Submit";
    var continueText = "Continue";
    
    // end screen
    var endTitle = "All Done!";
    var endText = "Thank you for completing the reading task.";
    var resultsTitle = "Your Responses:";
    var digitResponseLabel = "Digit Question Response:";
    var recallLabel = "Your Recalled Sentence:";
    var originalSentenceLabel = "Original Sentence:";
    
    // digits for the distractor task
    var digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
    var spelledDigits = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
    
    // sliding window params
    var windowSize = 1;                // max words visible at once
    
    // timing stuff (all in ms)
    var asterisksDuration = 200;       // fixation at start
    var blankDuration = 100;           // blank screen before words
    var maskDuration = 100;            // #### mask after words
    var digitsDuration = 533;          // how long to show digits
    var percentDuration = 100;         // %%% signs duration
    var spelledDuration = 500;         // how long to show spelled digit
    
    // display stuff
    var containerHeight = "300px";
    var fontSize = "22px";             // text size
    var fixationSymbol = "*****";      // five asterisks
    var maskSymbol = "####";           // mask after words
    var percentSymbol = "%%%%%";       // five percent signs
    var debugOn = false;               // set true to see debug by default
    
    //=============================================
    // setup code (don't change unless needed)
    //=============================================
    
    // break sentence into words
    var words = sentence.split(" ");
    
    // keep track of stuff
    var state = "instructions";
    var windowPosition = 0;            // position of first visible word
    var displayedDigits = null;        // store the 5 displayed digits
    var spelledDigit = null;           // the spelled digit to show
    var isDigitPresent = null;         // if spelled digit was in the 5 digits
    var userResponse = null;           // track yes/no response
    var userRecall = "";               // track free recall response
    var isFullscreenActive = false;    // track fullscreen state
    var experimentPaused = false;      // track if experiment is paused due to fullscreen exit
    
    // setup ui
    
    // make container
    var container = document.createElement("div");
    container.id = "rsvp-container";
    container.style.width = "100%";
    container.style.height = containerHeight;
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.fontSize = fontSize;
    container.style.fontFamily = "monospace"; // monospace font
    container.style.fontWeight = "bold";
    container.style.margin = "40px 0";
    container.style.cursor = "pointer";       // pointer cursor for clicking
    // disable text selection
    container.style.webkitUserSelect = "none"; // safari
    container.style.msUserSelect = "none";     // ie/edge
    container.style.userSelect = "none";       // standard syntax
    container.style.webkitTouchCallout = "none"; // ios safari
    qthis.getQuestionContainer().appendChild(container);
    
    // remove default text
    qthis.getQuestionTextContainer().innerHTML = "";
    
    // debug panel (ctrl+d to toggle)
    var debug = document.createElement("div");
    debug.id = "debug-area";
    debug.style.width = "80%";
    debug.style.margin = "20px auto";
    debug.style.padding = "10px";
    debug.style.border = "1px solid #ccc";
    debug.style.fontSize = "14px";
    debug.style.display = debugOn ? "block" : "none"; // hidden by default
    qthis.getQuestionContainer().appendChild(debug);
    
    // mobile/tablet detection and warning
    function isMobileDevice() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobi/i.test(navigator.userAgent);
    }
  
    if (isMobileDevice()) {
      // Display device warning
      container.innerHTML = 
        '<div style="text-align: center; max-width: 600px;">' +
        '<h1 style="font-size: 28px; color: black; margin-bottom: 20px;">Desktop Device Required</h1>' +
        '<p style="font-size: 18px; color: black; margin-bottom: 15px;">This experiment requires a laptop or desktop computer.</p>' +
        '<p style="font-size: 18px; color: black; margin-bottom: 15px;">Please access this survey using a non-mobile device.</p>' +
        '</div>';
      
      // prevent experiment from starting
      return;
    }
    
    function requestFullscreen() {
      var elem = document.documentElement;
      
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) { // Firefox
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) { // Chrome, Safari
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { // IE/Edge
        elem.msRequestFullscreen();
      }
      
      log("Fullscreen requested");
    }
    
    function exitFullscreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) { // Firefox
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) { // Chrome, Safari
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { // IE/Edge
        document.msExitFullscreen();
      }
      
      log("Fullscreen exited");
    }
    
    function isFullscreen() {
      return !!(document.fullscreenElement || document.mozFullScreenElement || 
                document.webkitFullscreenElement || document.msFullscreenElement);
    }
    
    // fullscreen change events
    function handleFullscreenChange() {
      isFullscreenActive = isFullscreen();
      log("Fullscreen state changed: " + isFullscreenActive);
      
      // if experiment is running and user exits fullscreen, pause the experiment
      if (!isFullscreenActive && state !== "instructions" && state !== "end" && !experimentPaused) {
        pauseExperiment();
      }
    }
    
    // add fullscreen change event listeners
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);
    
    // pause experiment if fullscreen is exited
    function pauseExperiment() {
      experimentPaused = true;
      log("Experiment paused - fullscreen exited");
      
      // store current state to resume later
      var previousState = state;
      state = "paused";
      
      // show message to return to fullscreen
      container.innerHTML = 
        '<div style="text-align: center; max-width: 600px;">' +
        '<h2 style="font-size: 28px; color: black; margin-bottom: 20px;">Experiment Paused</h2>' +
        '<p style="font-size: 18px; color: black; margin-bottom: 15px;">' + fullscreenExitedText + '</p>' +
        '<button id="return-fullscreen-button" style="margin-top: 20px; padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 20px;">' + returnToFullscreenText + '</button>' +
        '</div>';
      
      // handle button click
      document.getElementById('return-fullscreen-button').onclick = function() {
        requestFullscreen();
        // wait for fullscreen to activate before resuming
        var checkFullscreenInterval = setInterval(function() {
          if (isFullscreen()) {
            clearInterval(checkFullscreenInterval);
            experimentPaused = false;
            state = previousState;
            
            // resume experiment based on previous state
            switch (previousState) {
              case "sliding_window":
                renderSlidingWindow();
                break;
              case "digit_question":
                showDigitQuestion();
                break;
              case "free_recall":
                showFreeRecall();
                break;
              default:
                // for timing-sensitive states, restart from asterisks
                showAsterisks();
                break;
            }
          }
        }, 100);
      };
    }
    
    // hide buttons
    qthis.hideNextButton();
    
    // log stuff
    function log(msg) {
      console.log(msg);
      if (debug.style.display !== "none") {
        debug.innerHTML += "<div>" + msg + "</div>";
      }
    }
    
    // toggle debug w/ ctrl+d
    document.addEventListener("keydown", function(e) {
      if (e.ctrlKey && e.key === "d") {
        e.preventDefault();
        debug.style.display = debug.style.display === "none" ? "block" : "none";
      }
    });
    
    // make random 5 digits for distractor
    function generateDistractorDigits() {
      // shuffle digits array
      var shuffled = [...digits].sort(() => 0.5 - Math.random());
      
      // take first 5 for display
      displayedDigits = shuffled.slice(0, 5);
      
      // decide if spelled digit will be among displayed digits
      isDigitPresent = Math.random() > 0.5;
      
      if (isDigitPresent) {
        // pick one of displayed digits to spell
        var randomIndex = Math.floor(Math.random() * 5);
        var selectedDigit = displayedDigits[randomIndex];
        spelledDigit = spelledDigits[digits.indexOf(selectedDigit)];
      } else {
        // pick a digit not in displayed digits
        var remainingDigits = shuffled.slice(5); // digits not selected for display
        var randomIndex = Math.floor(Math.random() * remainingDigits.length);
        var selectedDigit = remainingDigits[randomIndex];
        spelledDigit = spelledDigits[digits.indexOf(selectedDigit)];
      }
      
      log("Displayed digits: " + displayedDigits.join(" "));
      log("Spelled digit: " + spelledDigit);
      log("Is digit present: " + isDigitPresent);
    }
    
    // make underscores matching word length
    function getUnderscores(word) {
      return '_'.repeat(word.length);
    }
    
    // show sliding window view of the sentence
    function renderSlidingWindow() {
      var displayText = [];
      
      for (var i = 0; i < words.length; i++) {
        // if word is in current window, show it
        if (i >= windowPosition && i < windowPosition + windowSize) {
          displayText.push(words[i]);
        } else {
          // otherwise replace with underscores
          displayText.push(getUnderscores(words[i]));
        }
      }
      
      // join with spaces and display
      var textContainer = document.createElement("div");
      textContainer.style.textAlign = "center";
      textContainer.style.padding = "20px";
      textContainer.style.whiteSpace = "pre"; // keep spaces
      textContainer.style.color = "black"; // Make sentence text black
      textContainer.textContent = displayText.join(" ");
      
      // disable text selection here too
      textContainer.style.webkitUserSelect = "none";
      textContainer.style.msUserSelect = "none";
      textContainer.style.userSelect = "none";
      textContainer.style.webkitTouchCallout = "none";
      
      container.innerHTML = '';
      container.appendChild(textContainer);
      
      // add instruction below
      var instruction = document.createElement("div");
      instruction.style.marginTop = "15px";
      instruction.style.fontSize = "16px";
      instruction.style.color = "#666";
      instruction.textContent = clickToAdvanceText;
      container.appendChild(instruction);
      
      log("Window position: " + windowPosition + " / " + (words.length - windowSize));
    }
    
    // show instructions screen with fullscreen button
   function showInstructions() {
    log("showing instructions");
    container.innerHTML = 
      '<div style="text-align: center; max-width: 600px;">' +
      '<h1 style="font-size: 28px; color: black; margin-bottom: 15px;">' + instructionTitle + '</h1>' +
      
      // Combined instruction text in a more compact format
      '<div style="text-align: left; margin-bottom: 15px; border: 1px solid #ddd; padding: 12px; border-radius: 5px; background-color: #fafafa;">' +
      '<ul style="margin: 0; padding-left: 25px; color: black; font-size: 16px; line-height: 1.3;">' +
      '<li style="margin-bottom: 8px;">' + instructionText1 + '</li>' +
      '<li style="margin-bottom: 8px;">' + instructionText2 + '</li>' +
      '<li style="margin-bottom: 8px;">' + instructionText3 + '</li>' +
      '<li style="margin-bottom: 0;">' + instructionText4 + '</li>' +
      '</ul>' +
      '</div>' +
      
      // More compact fullscreen box
      '<div style="margin: 10px 0; padding: 10px; border: 1px solid #2196F3; border-radius: 5px; background-color: #e3f2fd;">' +
      '<p style="font-size: 16px; margin-bottom: 5px; color: black;">' + fullscreenInstructionText + '</p>' +
      '<div style="display: flex; justify-content: center; align-items: center; margin-top: 10px;">' +
      '<span style="font-size: 14px; color: #555; margin-right: 15px;">' + fullscreenManualText + '</span>' +
      '<button id="fullscreen-button" style="padding: 8px 15px; background-color: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">' + fullscreenButtonText + '</button>' +
      '</div>' +
      '</div>' +
      
      '<button id="start-button" style="margin-top: 10px; padding: 8px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; display: none;">' + startButtonText + '</button>' +
      '</div>';
    
    state = "instructions";
    
    // handle fullscreen button click
    document.getElementById('fullscreen-button').onclick = function() {
      requestFullscreen();
      
      // show start button after entering fullscreen
      setTimeout(function() {
        if (isFullscreen()) {
          document.getElementById('fullscreen-button').style.display = 'none';
          document.getElementById('start-button').style.display = 'inline-block';
        }
      }, 500);
    };
    
    // handle start button click
    document.getElementById('start-button').onclick = function() {
      log("button clicked");
      if (isFullscreen()) {
        startSlidingWindow();
      } else {
        // if not in fullscreen, show message
        alert("Please enter full-screen mode before starting the experiment.");
        document.getElementById('fullscreen-button').style.display = 'inline-block';
        document.getElementById('start-button').style.display = 'none';
      }
    };
  }
    
    // show asterisks
    function showAsterisks() {
      log("showing asterisks");
      container.innerHTML = '<div style="font-size: 36px; color: black;">' + fixationSymbol + '</div>';
      state = "asterisks";
      
      setTimeout(function() {
        showBlankBeforeWords();
      }, asterisksDuration);
    }
    
    // blank screen before words
    function showBlankBeforeWords() {
      log("showing blank");
      container.innerHTML = '';
      state = "blank";
      
      setTimeout(function() {
        showSlidingWindow();
      }, blankDuration);
    }
    
    // show sliding window view
    function showSlidingWindow() {
      log("showing sliding window");
      state = "sliding_window";
      windowPosition = 0;
      renderSlidingWindow();
      
      // handle clicks to advance window
      container.onclick = function() {
        advanceWindow();
      };
    }
    
    // advance the sliding window
    function advanceWindow() {
      if (state !== "sliding_window") return;
      
      // advance window if not at end
      if (windowPosition < words.length - windowSize) {
        windowPosition++;
        renderSlidingWindow();
      } else {
        // at end of sentence, move to mask
        container.onclick = null; // remove click handler
        showMask();
      }
    }
    
    // mask after words
    function showMask() {
      log("showing mask");
      container.innerHTML = '<div style="font-size: 36px; color: black;">' + maskSymbol + '</div>';
      state = "mask";
      
      setTimeout(function() {
        showDistractorDigits();
      }, maskDuration);
    }
    
    // show five random digits
    function showDistractorDigits() {
      log("showing digits");
      state = "distractor_digits";
      
      // generate digits for this trial
      generateDistractorDigits();
      
      container.textContent = displayedDigits.join(" ");
      container.style.color = "black"; // Make digits black
      log("digits: " + displayedDigits.join(" "));
      
      setTimeout(function() {
        showPercentSigns();
      }, digitsDuration);
    }
    
    // percent signs
    function showPercentSigns() {
      log("showing percent signs");
      container.innerHTML = '<div style="font-size: 36px; color: black;">' + percentSymbol + '</div>';
      state = "percent_signs";
      
      setTimeout(function() {
        showSpelledDigit();
      }, percentDuration);
    }
    
    // spelled out digit
    function showSpelledDigit() {
      log("showing spelled digit");
      state = "spelled_digit";
      
      container.textContent = spelledDigit;
      container.style.color = "black"; // Make spelled digit black
      
      setTimeout(function() {
        showDigitQuestion();
      }, spelledDuration);
    }
    
    // show digit question first
    function showDigitQuestion() {
      log("showing digit question");
      state = "digit_question";
      userResponse = null; // reset user response
      
      container.innerHTML = 
        '<div style="text-align: center; max-width: 600px;">' +
        '<h2 style="font-size: 32px; margin-bottom: 20px; color: black;">' + digitQuestionText.replace("{spelled}", spelledDigit) + '</h2>' +
        '<div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 30px;">' +
        '<button id="yes-button" style="padding: 10px 30px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 20px; transition: all 0.3s ease;">' + yesButtonText + '</button>' +
        '<button id="no-button" style="padding: 10px 30px; background-color: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 20px; transition: all 0.3s ease;">' + noButtonText + '</button>' +
        '</div>' +
        '</div>';
      
      var yesButton = document.getElementById('yes-button');
      var noButton = document.getElementById('no-button');
      
      yesButton.onclick = function() {
        // visual feedback for button
        yesButton.style.backgroundColor = "#2E7D32"; // darker green
        yesButton.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
        yesButton.style.transform = "scale(1.05)";
        noButton.style.backgroundColor = "#aaa"; // gray out other button
        noButton.style.opacity = "0.5";
        
        // disable both buttons
        yesButton.disabled = true;
        noButton.disabled = true;
        
        // set response
        userResponse = "yes";
        
        log("user responded: yes (correct: " + isDigitPresent + ")");
        
        // add continue button to proceed
        var continueButton = document.createElement("button");
        continueButton.textContent = continueText;
        continueButton.style.marginTop = "15px";
        continueButton.style.padding = "10px 20px";
        continueButton.style.backgroundColor = "#2196F3";
        continueButton.style.color = "white";
        continueButton.style.border = "none";
        continueButton.style.borderRadius = "5px";
        continueButton.style.cursor = "pointer";
        continueButton.style.fontSize = "20px";
        
        continueButton.onclick = function() {
          showFreeRecall();
        };
        
        container.querySelector("div").appendChild(continueButton);
      };
      
      noButton.onclick = function() {
        // visual feedback for button
        noButton.style.backgroundColor = "#b71c1c"; // darker red
        noButton.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
        noButton.style.transform = "scale(1.05)";
        yesButton.style.backgroundColor = "#aaa"; // gray out other button
        yesButton.style.opacity = "0.5";
        
        // disable both buttons
        yesButton.disabled = true;
        noButton.disabled = true;
        
        // set response
        userResponse = "no";
        
        log("user responded: no (correct: " + !isDigitPresent + ")");
        
        // add continue button to proceed
        var continueButton = document.createElement("button");
        continueButton.textContent = continueText;
        continueButton.style.marginTop = "15px";
        continueButton.style.padding = "10px 20px";
        continueButton.style.backgroundColor = "#2196F3";
        continueButton.style.color = "white";
        continueButton.style.border = "none";
        continueButton.style.borderRadius = "5px";
        continueButton.style.cursor = "pointer";
        continueButton.style.fontSize = "20px";
        
        continueButton.onclick = function() {
          showFreeRecall();
        };
        
        container.querySelector("div").appendChild(continueButton);
      };
    }
    
    // show free recall question second
    function showFreeRecall() {
      log("showing free recall question");
      state = "free_recall";
      
      container.innerHTML = 
        '<div style="text-align: center; max-width: 600px;">' +
        '<h3 style="font-size: 28px; margin-bottom: 15px; color: black;">' + freeRecallTitle + '</h3>' +
        '<p style="font-size: 20px; margin-bottom: 15px; color: black;">' + freeRecallPrompt + '</p>' +
        '<textarea id="recall-textarea" style="width: 100%; height: 120px; padding: 10px; font-size: 16px; border: 1px solid #ccc; border-radius: 5px; resize: vertical;"></textarea>' +
        '<button id="submit-button" style="margin-top: 15px; padding: 10px 20px; background-color: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 20px;">' + submitButtonText + '</button>' +
        '</div>';
      
      var recallTextarea = document.getElementById('recall-textarea');
      var submitButton = document.getElementById('submit-button');
      
      submitButton.onclick = function() {
        // get recall text
        userRecall = recallTextarea.value.trim();
        log("user recall: " + userRecall);
        
        showEnd();
      };
    }
    
  // all done screen
  function showEnd() {
    log("showing end");
    state = "end";
    
    // user response summary
    var userResponseSummary = 
      '<div style="text-align: left; border: 1px solid #ccc; padding: 6px 8px; margin-top: 8px; background-color: #f5f5f5; font-size: 14px; border-radius: 3px;">' +
      '<div style="display: flex; justify-content: space-between; align-items: center;">' +
      '<strong style="font-size: 16px;">' + resultsTitle + '</strong>' +
      '</div>' +
      
      // digit details
      '<div style="font-size: 13px; color: #555; margin: 5px 0;">' +
      'Digits: ' + displayedDigits.join(" ") + ' | Spelled: ' + spelledDigit + ' | Present: ' + (isDigitPresent ? "Yes" : "No") +
      '</div>' +
      
      // digit response
      '<div style="margin: 5px 0;">' +
      '<strong style="font-size: 14px;">Digit Response:</strong> ' + 
      '<span style="display: inline-block; padding: 2px 6px; margin: 0 3px; ' + 
      'background-color: ' + (userResponse === "yes" && isDigitPresent || userResponse === "no" && !isDigitPresent ? "#e8f5e9" : "#ffebee") + '; ' +
      'border-radius: 3px; font-weight: bold; font-size: 14px; color: ' + (userResponse === "yes" && isDigitPresent || userResponse === "no" && !isDigitPresent ? "#2E7D32" : "#b71c1c") + ';">' + 
      (userResponse === "yes" && isDigitPresent || userResponse === "no" && !isDigitPresent ? "Correct" : "Incorrect") + 
      '</span>' +
      '</div>' +
      
      // both sentences in two columns
      '<div style="display: flex; gap: 8px; margin-top: 5px;">' +
      // left column - recalled sentence
      '<div style="flex: 1; max-width: 50%;">' +
      '<span style="font-size: 14px; font-weight: bold; display: block; margin-bottom: 2px;">Your Recall:</span>' +
      '<div style="padding: 5px; background-color: #fff; border: 1px solid #ddd; border-radius: 3px; font-family: monospace; height: 65px; overflow-y: auto; font-size: 13px;">' + 
      (userRecall || '<em style="color: #999;">No recall</em>') + 
      '</div>' +
      '</div>' +
      
      // right column - original sentence
      '<div style="flex: 1; max-width: 50%;">' +
      '<span style="font-size: 14px; font-weight: bold; display: block; margin-bottom: 2px;">Original:</span>' +
      '<div style="padding: 5px; background-color: #e3f2fd; border: 1px solid #bbdefb; border-radius: 3px; font-family: monospace; height: 65px; overflow-y: auto; font-size: 13px;">' + 
      sentence + 
      '</div>' +
      '</div>' +
      '</div>' +
      
      '</div>';
    
    // params summary
    var paramSummary = 
      '<div style="text-align: left; border: 1px solid #ccc; padding: 5px 8px; margin-top: 8px; background-color: #f9f9f9; font-size: 13px; border-radius: 3px;">' +
      'Distractor: digits (' + digitsDuration + 'ms) → percent signs (' + percentDuration + 'ms) → spelled digit (' + spelledDuration + 'ms)<br>Words: ' + words.length +
      '</div>';
    
    container.innerHTML = 
      '<div style="text-align: center; max-width: 600px; padding: 3px 0;">' +
      '<h2 style="font-size: 22px; color: #4CAF50; margin: 3px 0;">' + endTitle + '</h2>' +
      userResponseSummary +
      paramSummary +
      '<button id="continue-button" style="margin-top: 15px; padding: 8px 15px; background-color: #2196F3; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">' + continueText + '</button>' +
      '</div>';
    
    // continue button
    document.getElementById('continue-button').onclick = function() {
      log("continuing");
      
      // exit fullscreen mode
      if (isFullscreen()) {
        exitFullscreen();
      }
      
      // small delay to allow fullscreen to exit before proceeding
      setTimeout(function() {
        qthis.showNextButton();
        qthis.clickNextButton();
      }, 300);
    };
  }
    
    // start the experiment
    function startSlidingWindow() {
      showAsterisks();
    }
    
    // initialize
    showInstructions();
    log("waiting for user input");
  });