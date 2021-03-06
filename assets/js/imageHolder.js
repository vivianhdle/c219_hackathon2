/**
 * Class representing the entire images section
 */
class imageHolder {
    /**
     * Creates an ImageHolder object
     * @param callbacks - object that holds callbacks for it and child objects
     */
    constructor(callbacks) {
        this.imageCards = [];

        this.handleWordClick = this.handleWordClick.bind(this);
        this.deleteImageFromArray = this.deleteImageFromArray.bind(this);
        this.clear = this.clear.bind(this);
        this.checkInstructions = this.checkInstructions.bind(this);

        this.callbacks = {
            showApps: callbacks.showApps,
            showRelatedWords: callbacks.showRelatedWords,
            decrementQueue: callbacks.decrementQueue,
            deleteImageFromArray: this.deleteImageFromArray,
            deleteRelatedAppsAndWords: callbacks.deleteRelatedAppsAndWords,
            checkIfLoadingApps: callbacks.checkIfLoadingApps,
            changeAppLoadingStatus: callbacks.changeAppLoadingStatus
        }
    }

    /**
     * Handler for clicks on word objects on the board
     * If there is room, create a new Image and add it to the image array
     * @param {string} word - the word used to create a new Image
     */
    handleWordClick(word) {
        if (this.imageCards.length < 3 && this.indexOfCard(word) === null) {
            const newCard = new Image(word, this.callbacks);
            this.imageCards.push(newCard);
            return true;
        }
        return false;
    }

    /**
     * Deletes an Image from the image array
     * @param {string} word - the word associated with the Image to be deleted
     */
    deleteImageFromArray(word) {
        const indexToBeDeleted = this.indexOfCard(word);
        if (indexToBeDeleted !== null) {
            this.imageCards[indexToBeDeleted].domElement.remove();
            this.imageCards.splice(indexToBeDeleted, 1);
            this.callbacks.deleteRelatedAppsAndWords(word);
        }
    }

    /**
     * Toggles the instructions on imageHolder based on whether or not images are present
     */
    checkInstructions() {
        if (this.imageCards.length === 0) {
            $('.image-wrapper>.instructions').show();
        } else {
            $('.image-wrapper>.instructions').hide();
        }
    }

    /**
     * Searches the image array for an image associated with a given word
     * @param {string} word - the word associated with the Image to search for
     * @returns {number} - the index of the Image whose word matches the given word, or -1 if none is found
     */
    indexOfCard(word) {
        let indexToBeDeleted = null;
        for (let index = 0; index < this.imageCards.length; index++) {
            if (this.imageCards[index].word === word) {
                indexToBeDeleted = index;
            }
        }
        return indexToBeDeleted;
    }

    /**
     * Clears the images on page and the image storage array
     */
    clear() {
        this.imageCards = [];
        $('.images-container').remove();
    }
}
