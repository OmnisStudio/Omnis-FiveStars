ctrl_net_omnis_fivestars.prototype = (function() {

    // Omnis Studio Javascipt component, built using the JSON defined control editor.

    /****** CONSTANTS ******/
    var PROPERTIES = {
        maxrating: "$maxrating",
        currentrating: "$currentrating"
    };

    var EVENTS = {
    };

    /** The control prototype - inherited from base class prototype */
    var ctrl = new ctrl_base();

    /**
     * class initialization, must be called by constructor
     * this function should initialize class variables
     * IMPORTANT:
     * initialization is separated out from the constructor
     * as the base class constructor is not called when a
     * class is subclassed.
     * all subclass constructors must call their own
     * init_class_inst function which in turn must call the
     * superclass.init_class_inst function
     */
    ctrl.init_class_inst = function()
    {
        // install superclass prototype so we can than call superclass methods
        // using this.superclass.method_name.call(this[,...])
        this.superclass = ctrl_base.prototype;

        // call our superclass class initializer
        this.superclass.init_class_inst.call( this );

        // initialize class specific stuff
        this.mDefaultText = "EMPTY";  
        this.mmaxrating = 0;
        this.mcurrentrating = 0
    };

    ctrl.delete_class_inst = function()
    {
        //TODO: Any custom cleanup when control is deleted. Remove function if no custom behaviour required.
        this.superclass.delete_class_inst.call(this); // Call superclass version to perform standard deletion procedure.
    };

    /**
     * Initializes the control instance from element attributes.
     * Must be called after control is constructed by the constructor.
     * @param form      Reference to the parent form.
     * @param elem      The html element the control belongs to.
     * @param rowCtrl   Pointer to a complex grid control if this control belongs to a cgrid.
     * @param rowNumber The row number this control belongs to if it belongs to a cgrid.
     * @returns {boolean}   True if the control is a container.
     */
    ctrl.init_ctrl_inst = function( form, elem, rowCtrl, rowNumber )
    {
        // call our superclass init_ctrl_inst
        this.superclass.init_ctrl_inst.call( this, form, elem, rowCtrl, rowNumber );

        //Control-specific initialization:
        var client_elem = this.getClientElem();
        var dataprops = client_elem.getAttribute('data-props');
        var datapropsobj = JSON.parse(dataprops);

		// add these lines to the javascript generated from the JSON editor
		var maxratingValue = datapropsobj.maxrating;  			// find the max value
	
		var fiveStars = document.createElement('div');  		// create a div for our object

		var html = '<div class="fiveStars__img"></div>' +   	// create the html for our object using the css class
        '<ul class="c-rating"></ul>' +
        '</div>';

		fiveStars.innerHTML = html;           					// apply the html
		client_elem.appendChild(fiveStars);   					// add the div to the client element
		
		var rating_elem = client_elem.querySelector('.c-rating');
		this.ratingObj = rating(rating_elem,0,maxratingValue); 	// initialise the object
		
        this.setProperty(PROPERTIES.maxrating, maxratingValue);	// set the max value
		// end of lines that need to be added to the default javascript
        
		var attValue = datapropsobj.currentrating;
        this.setProperty(PROPERTIES.currentrating, attValue);

        //Add event handler:
        this.addClickHandlers(client_elem);

        this.update();

        // return true if our control is a container and the
        // children require installing via this.form.InstallChildren
        return false
    };

    /**
     * The control's data has changed. The contents may need to be updated.
     *
     * @param {String} what    Specifies which part of the data has changed:
     *                 ""              - The entire data has changed
     *                 "#COL"          - A single column in the $dataname list (specified by 'row' and 'col') or a row's column (specified by 'col')
     *                 "#LSEL"         - The selected line of the $dataname list has changed (specified by 'row')
     *                 "#L"            - The current line of the $dataname list has changed  (specified by 'row')
     *                 "#LSEL_ALL"     - All lines in the $dataname list have been selected.
     *                 "#NCELL"        - An individual cell in a (nested) list. In this case, 'row' is an array of row & column numbers.
     *                                  of the form "row1,col1,row2,col2,..."
     *
     * @param {Number} row             If specified, the row number in a list (range = 1..n) to which the change pertains.
     *                                 If 'what' is "#NCELL", this must be an array of row and col numbers. Optionally, a modifier may be
     *                                 added as the final array element, to change which part of the nested data is to be changed. (Currently only "#L" is supported)
     *
     * @param {Number|String} col      If specified, the column in a list row (range = 1..n or name) to which the change pertains.
     */
    ctrl.updateCtrl = function(what, row, col, mustUpdate)
    {
        var elem = this.getClientElem();

         // center the text vertically:
        elem.style.lineHeight = elem.style.height;
        elem.style.textAlign = "center";

        // read $dataname value and display in control
        var dataname = this.getData();
        if (this.mData != dataname) { // only execute the following code if the value of the $dataname variable has changed.
            this.mData = dataname;
			// update these lines to the javascript generated from the JSON editor
            if (dataname || dataname == 0)  {  		// if value of dataname is 0
            //      elem.innerHTML = this.mData;    // do not show dataname value else it blats over the stars
            }
            else {
                elem.innerHTML = this.mDefaultText;
            }
        }
    };

    /**
     * This is called when an event registered using this.mEventFunction() is triggered.
     *
     * @param event The event object
     */
    ctrl.handleEvent = function( event ) {
        if (!this.isEnabled()) return true; // If the control is disabled, don't process the event.

        switch (event.type) {
            case "click":
				return this.handleClick(event.offsetX, event.offsetY);
            case "touchstart":
                this.lastTouch = new Date().getTime(); // Note the time of the touch start.
                this.touchStartPos = {
                    x: event.changedTouches0.clientX,
                    y: event.changedTouches0.clientY
                }; // Note the starting position of the touch.
                break;
            case "touchend":
                var time = new Date().getTime();
                if (time - this.lastTouch < 500) { //Treat as a click if less than 500ms have elapsed since touchstart
                    if (touchWithinRange(this.touchStartPos, event.changedTouches0, 20)) { //Only treat as a click if less than 20 pixels have been scrolled.
                        return this.handleClick(event.changedTouches0.offsetX, event.changedTouches0.offsetY);
                    }
                }
                break;
        }
        return this.superclass.handleEvent.call( this, event ); //Let the superclass handle the event, if not handled here.
    };

    /**
     * Called to get the value of an Omnis property
     *
     * @param propNumber    The Omnis property number
     * @returns {var}       The property's value
     */
    ctrl.getProperty = function(propNumber)
    {
        switch (propNumber) {
            case eBaseProperties.text:
                return this.mText;
            case PROPERTIES.maxrating:
                return this.mmaxrating;
            case PROPERTIES.currentrating:
                return this.mcurrentrating;
        }
        return this.superclass.getProperty.call(this, propNumber); //Let the superclass handle it,if not handled here.
    };

    /**
     * Function to get $canassign for a property of an object
     * @param propNumber    The Omnis property number
     * @returns {boolean}   Whether the passed property can be assigned to.
     */
    ctrl.getCanAssign = function(propNumber)
    {
        switch (propNumber) {
            case eBaseProperties.text:
            case PROPERTIES.maxrating:
            case PROPERTIES.currentrating:
                return true;
        }
        return this.superclass.getCanAssign.call(this, propNumber); // Let the superclass handle it,if not handled here.
    };

    /**
     * Assigns the specified property's value to the control.
     * @param propNumber    The Omnis property number
     * @param propValue     The new value for the property
     * @returns {boolean}   success
     */
    ctrl.setProperty = function( propNumber, propValue )
    {
        if (!this.getCanAssign(propNumber)) // check whether the value can be assigned to
            return false;

        switch (propNumber) {
            case eBaseProperties.text: // Set the text as appropriate for this control.
                this.mText = propValue;
                var client_elem = this.getClientElem();
                client_elem.innerHTML = propValue;
                return true;
            case PROPERTIES.maxrating:
                this.mmaxrating = propValue;
                return true;
            case PROPERTIES.currentrating:
                this.mcurrentrating = propValue;
				// add this line to the javascript generated from the JSON editor
				this.ratingObj.setRating(this.mcurrentrating);  //update the number of stars displayed
                return true;
        }
        return this.superclass.setProperty.call( this, propNumber, propValue ); // Let the superclass handle it, if not handled here.
    };

    /**
     * Adds a click handler if the device doesn't support touch, or equivalent touch handlers if it does.
     * @param elem Element to add a click/touch handler to
     */
    ctrl.addClickHandlers = function(elem)
    {
        if (!this.usesTouch) {
            elem.onclick = this.mEventFunction;
        }
        else {
            elem.ontouchstart = this.mEventFunction;
            elem.ontouchend = this.mEventFunction;
        }
    };

    ctrl.handleClick = function(pX, pY)
    {
        // send event to Omnis
        if (this.canSendEvent(eBaseEvent.evClick)) {
			
            this.eventParamsAdd("pXPos", pX);  
            this.eventParamsAdd("pYPos",pY);
			// add these lines to the javascript generated from the JSON editor
			numStars = this.ratingObj.getRating();  	//get the selected number of stars from control
			this.eventParamsAdd("pNumStars",numStars);  //send this to Omnis, match the Omnis event parameter name

            this.sendEvent(eBaseEvent.evClick);
        }
    };

    /**
     * Called when the size of the control has changed.
     */
    ctrl.sizeChanged = function ()
    {
        this.superclass.sizeChanged();

        // center any text vertically
        var elem = this.getClientElem();
        elem.style.lineHeight = elem.style.height;
	
    };

    return ctrl;
})();

/**
 * Constructor for our control.
 * @constructor
 */
function ctrl_net_omnis_fivestars()
{
    this.init_class_inst(); // initialize our class
}
