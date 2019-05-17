
/**
 * Class representing the overarching object that creates the page objects and handles communication between them
 */
class Controller{
    /**
     * Creates a Controller object
     * @param options - object holding the selectors for the related and adjective words buttons
     */
    constructor(options){
        this.newGenerator=null;
        this.relevantWords = null;
        this.board = null;
        this.imageHolder = null;
        this.relatedApps = null;
        this.queue = 0;

        this.displayAreas = {
            relevant:$(options.displayAreas.relevant),
            synonymArea:$(options.displayAreas.synonymArea),
            adjectiveArea:$(options.displayAreas.adjectiveArea),
            appArea:$(options.displayAreas.appArea),
            appTitleArea:$(options.displayAreas.appTitleArea),
            appContainer:$(options.displayAreas.appContainer),
            imageWrapper:$(options.displayAreas.imageWrapper)
        };

        this.buttons={
            relatedWords: $(options.buttons.relatedWords),
            adjectiveWords: $(options.buttons.adjectiveWords),
            startButton: $(options.buttons.start),
            random3: $(options.buttons.random3),
            randomizeBoard: $(options.buttons.randomizeBoard),
            clearBoard:$(options.buttons.clearBoard),
            yesClearBoard:$(options.buttons.yesClearBoard),
            noClearBoard:$(options.buttons.noClearBoard),
            addWordButton:$(options.buttons.addWordButton),
            scrollLeft:$(options.buttons.scrollLeft),
            scrollRight:$(options.buttons.scrollRight),
            imgCloseButton:$(options.buttons.imgCloseButton)
        };

        this.putWordOnBoard = this.putWordOnBoard.bind(this);
        this.addUserInputWord = this.addUserInputWord.bind(this);
        this.addEventListeners = this.addEventListeners.bind(this);
        this.startButton = this.startButton.bind(this);
        this.sendToImageCard = this.sendToImageCard.bind(this);
        this.showApps = this.showApps.bind(this);
        this.showRelatedWords = this.showRelatedWords.bind(this);
        this.select3Images = this.select3Images.bind(this);
        this.decrementQueue = this.decrementQueue.bind(this);
        this.shuffleBoard = this.shuffleBoard.bind(this);
        this.clearBoard = this.clearBoard.bind(this);
        this.checkIfEmpty = this.checkIfEmpty.bind(this);
        this.toggleClearModal = this.toggleClearModal.bind(this);
        this.deleteRelatedApps = this.deleteRelatedApps.bind(this);
    }

    /**
     * Takes a word from IdeaGenerator callback and attempts to put the word on the Board object.
     * Refreshes new words when list of words is empty.
     * @param {string} word - the word to be added to the Board
     */
    putWordOnBoard(word) {
        if (this.board.addWord(word)) {
            $('.image-wrapper').show();
            $('.image-random-div').show();
            let ideaslength = $(".ideaCard").length;
            if(ideaslength === 1)
            {
                this.newGenerator.generateWords();
            }
            return true;
        } else {
            return false;
        }
    }

    /**
     * Adds the typed word from the modal to the spitboard
     */
    addUserInputWord() {
        $(".modal_inner > p").text("Add your own word onto the board");
        let modalValue = $("input[name='word']").val();
        let pattern = /^[a-z]/gmi;

        if(modalValue && pattern.test(modalValue))
        {
            this.putWordOnBoard(modalValue);
            $("input[name='word']").val("");
        }
        else
        {
            $(".modal_inner > p").text("Word must start with a letter");
        }
        this.checkIfEmpty();
    }

    /**
     * Adds click handlers to the related and adjective words buttons
     */
    addEventListeners() {
        this.buttons.relatedWords.on('click', this.toggleRelatedWords);
        this.buttons.adjectiveWords.on('click',this.toggleAdjectives);
        this.buttons.startButton.on('click',this.startButton);
        this.buttons.random3.on('click', this.select3Images);
        this.buttons.randomizeBoard.on('click', this.shuffleBoard);
        this.buttons.addWordButton.on('click', this.addUserInputWord);
        this.buttons.clearBoard.on('click',this.toggleClearModal);
        this.buttons.yesClearBoard.on('click',this.clearBoard);
        this.buttons.noClearBoard.on('click',this.toggleClearModal);
        this.buttons.scrollLeft.on('click',this.relatedApps.scrollBackwards);
        this.buttons.scrollRight.on('click',this.relatedApps.scrollForward);
        this.displayAreas.imageWrapper.on('click', this.buttons.imgCloseButton, this.relatedApps.removeRelatedApps);
        $('.clear-board-modal').on('click',this.toggleClearModal);

        /* ====================== MODAL ======================= */ 
        $(".display-modal-btn[data-target]").click(function() {
            $("#" + this.dataset.target).toggleClass("-open");
            $(".modal_inner > p").text("Add your own word onto the board");
        });

        $(".modal").click(function(e) {
            if (e.target === this) {
                $(this).toggleClass("-open")
            }
        });
    }

    deleteRelatedApps(word = null){
        
        this.relatedApps.removeRelatedApps();
        this.relevantWords.removeRelatedWords();

    }

    /**
     *opens and closes a clear board confirmation modal
     */
    toggleClearModal(){
        $('.clear-board-modal').toggleClass('-open');
    }

    /**
     * hides landing page and makes an API call 
     */
    startButton() {
        $('.landing-page').remove();
        this.newGenerator.generateWords();
    }

    /**
     * Shows the related words div and hides the adjective words div
     */
    toggleRelatedWords(){
        $('.syn i').toggleClass('flipped');
        $('.adj i').removeClass('flipped');
        $('.adjectives').hide();
        $('.synonyms').toggle();
    }

    /**
     * Hides the related words div and shows the adjective words div
     */
    toggleAdjectives(){
        $('.adj i').toggleClass('flipped');
        $('.syn i').addClass('flipped');
        $('.synonyms').hide();
        $('.adjectives').toggle();
    }
    /**
     * Takes a word from the Board and sends it to ImageHolder to be made into an Image
     * @param word - the word to make an Image off of
     */
    sendToImageCard(word) {
        if(this.imageHolder.handleWordClick(word)){
            $('.instructions').hide();
            return true;
        } else {
            return false;
        }
    }

    /**
     * Tells related apps object to make API call for apps
     * @param {string} word - the word to call the API with
     */
    showApps(word) {
        this.relatedApps.getRelatedApps(word);
    }

    /**
     * Tells relevant words object to call API and get related words and adjectives
     * @param {string} word - the word used in the API call
     */
    showRelatedWords(word) {
        this.relevantWords.getAllData(word);
    }
    
    /**
     * Clears the images and selects 3 random words from the board to pin
     */
    select3Images() {
        if (this.queue === 0) {
            this.queue = 3;
            this.imageHolder.clear();
            $('.instructions').hide();
            let imagesToAdd = this.board.selectAtRandom();
            for (let index in imagesToAdd) {
                this.imageHolder.handleWordClick(imagesToAdd[index]);
            }
            $(".app-instructions").show();
        }
    }

    decrementQueue() {
        this.queue = this.queue > 0 ? this.queue - 1 : 0;
    }

    /**
     * Randomizes the board
     */
    shuffleBoard() {
        this.board.randomFillBoard(this.select3Images);
        $('.image-random-div').show();
    };
    /**
     * calls the clear board method in board, will clear the dom elements, and array
     */
    clearBoard() {
        this.board.clearBoard();
        this.toggleClearModal();
        this.imageHolder.clear();
    }
    /**
     * Checks if the board is empty, if so, show instructions
     */
    checkIfEmpty() {
        if (this.board.words.length === 0){
            $('.spit-board>.instructions').show();
        } else {
            $('.spit-board>.instructions').hide();
        }
    }

    /**
     * Instantiates all the page objects and calls the addEventListeners function
     */
    start() {
        this.newGenerator = new IdeaGenerator({
            putWordOnBoard:this.putWordOnBoard,
            checkIfEmpty:this.checkIfEmpty
        });

        this.relevantWords = new RelevantWords({
            synonymArea:$('.syn'),
            adjectiveArea:$('.adj'),
            callbacks:{
                putWordOnBoard:this.putWordOnBoard
            }
        });
        
        this.imageHolder = new imageHolder({
            showApps: this.showApps,
            showRelatedWords: this.showRelatedWords,
            decrementQueue: this.decrementQueue,
            deleteRelatedApps: this.deleteRelatedApps
        });

        $(this.displayAreas.relevant).hide();

        this.board = new Board({
            sendToImageCard: this.sendToImageCard,
            checkIfEmpty: this.checkIfEmpty,
            deleteImage: this.imageHolder.deleteImageFromArray,
        });

        $('.spitboard-container').append(this.board.render());
        $('.spit-board').hide();
        $('.spit-board').sortable();
        
        this.relatedApps = new RelatedApps({
            appArea:this.displayAreas.appArea,
            titleArea:this.displayAreas.appTitleArea,
            appContainer:this.displayAreas.appContainer
        });

        $('.image-random-div').hide();

        /*========================================
            Instructions elements to guide user
        =========================================*/
        $('.image-wrapper').append(
            $('<div>',{
                text:'CLICK AN IDEA FROM THE BOARD',
                class:'instructions'
            })).hide();

        $(this.displayAreas.appContainer).append(
            $('<div>',{
                text:'CLICK AN IMAGE FOR RELATED APPS / WORDS',
                class:'app-instructions'
                })
            );

        $(".app-container>*").hide();

        $('.spit-board').append($('<div>',{
            text:'CLICK AN IDEA FROM THE WORD LIST',
            class:'instructions',
            css:{
                "text-align":"center"
            }
        }));

        this.addEventListeners();
    }
}


