/**
 * Usage:
 * new OOJSPlus.ui.widget.TitleMultiselectWidget( {
 *  namespaces: [ 0, 6 ], // Limit search to only NS_MAIN and NS_FILE
 *  contentPagesOnly: false, // Whether to only search in pages in ContentNamespaces (default: true)
 *  mustExist: false, // Whether to only allow existing pages (default: true): Use with `false` to allow creating new pages
 *  prefix: '', // Prefix to add to the query (default: ''). Can be used to limit the search to eg. subpages of particular page
 *  contentModels: [ 'wikitext', 'css' ] // Limit search to only pages with these content models
 * } );
 *
 * Limitations:
 * - cannot set value manually, only though picker itself (setValue will not work)
 *
 * @param {Object} config
 * @constructor
 */
OOJSPlus.ui.widget.TitleMultiselectWidget = function ( config ) {
	config = config || {};
	config.menu = config.menu || {};
	config.menu.filterFromInput = false;

	OOJSPlus.ui.mixin.TitleQuery.call( this, config );

	// Parent constructor
	OOJSPlus.ui.widget.TitleMultiselectWidget.parent.call( this, Object.assign( {}, config, {} ) );

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
		this.$hiddenInput.prop( 'defaultValue', this.getValue().join( '\n' ) );
	}

	// Events
	// When list of selected usernames changes, update hidden input
	this.connect( this, {
		change: 'onMultiselectChange'
	} );

	// API init
	this.menu.filterFromInput = false;
};

OO.inheritClass( OOJSPlus.ui.widget.TitleMultiselectWidget, OO.ui.MenuTagMultiselectWidget );
OO.mixinClass( OOJSPlus.ui.widget.TitleMultiselectWidget, OO.ui.mixin.PendingElement );
OO.mixinClass( OOJSPlus.ui.widget.TitleMultiselectWidget, OOJSPlus.ui.mixin.TitleQuery );

OOJSPlus.ui.widget.TitleMultiselectWidget.prototype.getValue = function () {
	const titles = OOJSPlus.ui.widget.TitleMultiselectWidget.parent.prototype.getValue.call( this );
	if ( !titles ) {
		return [];
	}
	const selected = [];
	for ( let i = 0; i < titles.length; i++ ) {
		if ( typeof titles[ i ] === 'string' ) {
			selected.push( titles[ i ] );
		} else {
			selected.push( titles[ i ].prefixed );
		}
	}
	return selected;
};

/**
 * Update autocomplete menu with items
 *
 * @private
 */
OOJSPlus.ui.widget.TitleMultiselectWidget.prototype.updateMenuItems = function () {
	const inputValue = this.input.getValue();

	if ( inputValue === this.inputValue ) {
		// Do not restart api query if nothing has changed in the input
		return;
	} else {
		this.inputValue = inputValue;
	}

	if ( inputValue.length > 0 ) {
		this.pushPending();

		this.getLookupRequest().done( ( response ) => {
			const selected = this.getValue();

			const items = this.getLookupMenuOptionsFromData( response );
			for ( let i = 0; i < items.length; i++ ) {
				if ( selected.indexOf( items[ i ].data.prefixed ) !== -1 ) {
					// Remove item if already selected
					items.splice( i, 1 );
				}
			}

			// Remove all items from menu add fill it with new
			this.menu.clearItems();
			this.menu.addItems( items );

			if ( items.length ) {
				// Enable Narrator focus on menu item, see T250762.
				this.menu.$focusOwner.attr( 'aria-activedescendant', items[ 0 ].$element.attr( 'id' ) );
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

OOJSPlus.ui.widget.TitleMultiselectWidget.prototype.onInputChange = function () {
	OOJSPlus.ui.widget.TitleMultiselectWidget.parent.prototype.onInputChange.apply( this, arguments );

	this.updateMenuItems();
};

/**
 * If used inside HTML form, then update hiddenInput with list of
 * newline-separated usernames.
 *
 * @private
 */
OOJSPlus.ui.widget.TitleMultiselectWidget.prototype.updateHiddenInput = function () {
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
OOJSPlus.ui.widget.TitleMultiselectWidget.prototype.onMultiselectChange = function () {
	this.updateHiddenInput();
	this.input.setValue( '' );
};

OOJSPlus.ui.widget.TitleMultiselectWidget.prototype.getRawValue = function () {
	return this.inputValue;
};
