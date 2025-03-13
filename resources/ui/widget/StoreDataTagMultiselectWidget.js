OOJSPlus.ui.widget.StoreDataTagMultiselectWidget = function ( config ) {
	config = config || {};
	config.menu = config.menu || {};
	config.menu.filterFromInput = false;
	// Parent constructor
	OOJSPlus.ui.widget.StoreDataTagMultiselectWidget.parent.call( this, Object.assign( {}, config, {} ) );
	// Mixin constructors
	OO.ui.mixin.PendingElement.call( this, Object.assign( {}, config, { $pending: this.$handle } ) );

	if ( 'name' in config ) {
		// Use this instead of <input type="hidden">, because hidden inputs do not have separate
		// 'value' and 'defaultValue' properties. The script on Special:Preferences
		// (mw.special.preferences.confirmClose) checks this property to see if a field was changed.
		this.$hiddenInput = $( '<textarea>' )
			.addClass( 'oo-ui-element-hidden' )
			.attr( 'name', config.name )
			.appendTo( this.$element );
		// Update with preset values
		this.updateHiddenInput();
		// Set the default value (it might be different from just being empty)
		this.$hiddenInput.prop( 'defaultValue', this.getVaue().join( '\n' ) );
	}

	// Events
	// When list of selected usernames changes, update hidden input
	this.connect( this, {
		change: 'onMultiselectChange'
	} );
	// API init
	this.api = config.api || new mw.Api();
	this.queryAction = config.queryAction;
	this.labelField = config.labelField;
	this.filter = config.filter || [];
	this.sort = config.sort || [];
	this.limit = config.limit || 25;
	this.menu.filterFromInput = false;
};

OO.inheritClass( OOJSPlus.ui.widget.StoreDataTagMultiselectWidget, OO.ui.MenuTagMultiselectWidget );
OO.mixinClass( OOJSPlus.ui.widget.StoreDataTagMultiselectWidget, OO.ui.mixin.PendingElement );

OOJSPlus.ui.widget.StoreDataTagMultiselectWidget.prototype.setValue = function ( value ) {
	if ( !value ) {
		return OOJSPlus.ui.widget.StoreDataTagMultiselectWidget.parent.prototype.setValue.call( this, value );
	}
	if ( typeof value === 'string' ) {
		value = [ value ];
	}

	for ( let i = 0; i < value.length; i++ ) {
		this.addTag( value[ i ], value[ i ] );
	}
	this.emit( 'change', this.getValue() );
};

/**
 * Update autocomplete menu with items
 *
 * @private
 */
OOJSPlus.ui.widget.StoreDataTagMultiselectWidget.prototype.updateMenuItems = function () {
	const inputValue = this.input.getValue();

	if ( inputValue === this.inputValue ) {
		// Do not restart api query if nothing has changed in the input
		return;
	} else {
		this.inputValue = inputValue;
	}

	this.api.abort(); // Abort all unfinished api requests

	if ( inputValue.length > 0 ) {
		this.pushPending();

		this.api.get( {
			action: this.queryAction,
			filter: JSON.stringify( this.filter ),
			sort: JSON.stringify( this.sort ),
			limit: this.limit,
			query: inputValue
		} ).done( ( response ) => {
			const selected = this.getValue();
			let results = response.results || [];
			// Remove usernames, which are already selected from suggestions
			results = results.map( ( item ) => {
				if ( selected.indexOf( item[ this.labelField ] ) === -1 ) {
					// This is necessary in oder to match actual group names
					return new OO.ui.MenuOptionWidget( {
						data: item[ this.labelField ],
						label: item[ this.labelField ]
					} );
				}
				return undefined;
			} ).filter( ( item ) => item !== undefined );

			// Remove all items from menu add fill it with new
			this.menu.clearItems();
			this.menu.addItems( results );

			if ( results.length ) {
				// Enable Narrator focus on menu item, see T250762.
				this.menu.$focusOwner.attr( 'aria-activedescendant', results[ 0 ].$element.attr( 'id' ) );
			}

			// Make the menu visible; it might not be if it was previously empty
			this.menu.toggle( true );

			this.popPending();
		} ).fail( this.popPending.bind( this ) );

	} else {
		this.menu.clearItems();
		this.menu.toggle( false );
	}
};

OOJSPlus.ui.widget.StoreDataTagMultiselectWidget.prototype.onInputChange = function () {
	OOJSPlus.ui.widget.StoreDataTagMultiselectWidget.parent.prototype.onInputChange.apply( this, arguments );

	this.updateMenuItems();
};

/**
 * If used inside HTML form, then update hiddenInput with list of
 * newline-separated usernames.
 *
 * @private
 */
OOJSPlus.ui.widget.StoreDataTagMultiselectWidget.prototype.updateHiddenInput = function () {
	if ( '$hiddenInput' in this ) {
		this.$hiddenInput.val( this.getValue().join( '\n' ) );
		// Trigger a 'change' event as if a user edited the text
		// (it is not triggered when changing the value from JS code).
		this.$hiddenInput.trigger( 'change' );
	}
};

/**
 * React to the 'change' event.
 *
 * Updates the hidden input and clears the text from the text box.
 */
OOJSPlus.ui.widget.StoreDataTagMultiselectWidget.prototype.onMultiselectChange = function () {
	this.updateHiddenInput();
	this.input.setValue( '' );
};
