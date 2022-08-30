( function () {

	OOJSPlus.ui.widget.CategoryMultiSelectWidget = function( config ) {
		config = config || {};
		config.menu = config.menu || {};
		config.menu.filterFromInput = false;

		// Parent constructor
		OOJSPlus.ui.widget.CategoryMultiSelectWidget.parent.call( this, $.extend( {}, config, {} ) );

		// Mixin constructors
		OO.ui.mixin.PendingElement.call( this, $.extend( {}, config, { $pending: this.$handle } ) );

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
			this.$hiddenInput.prop( 'defaultValue', this.getSelectedCategories().join( '\n' ) );
		}

		// Events
		// When list of selected usernames changes, update hidden input
		this.connect( this, {
			change: 'onMultiselectChange'
		} );

		// API init
		this.api = config.api || new mw.Api();
		this.menu.filterFromInput = false;
	};

	OO.inheritClass( OOJSPlus.ui.widget.CategoryMultiSelectWidget, OO.ui.MenuTagMultiselectWidget );
	OO.mixinClass( OOJSPlus.ui.widget.CategoryMultiSelectWidget, OO.ui.mixin.PendingElement );

	OOJSPlus.ui.widget.CategoryMultiSelectWidget.prototype.getSelectedCategories = function () {
		return this.getValue();
	};

	/**
	 * Update autocomplete menu with items
	 *
	 * @private
	 */
	OOJSPlus.ui.widget.CategoryMultiSelectWidget.prototype.updateMenuItems = function () {
		var inputValue = this.input.getValue();

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
				action: 'query',
				list: 'allcategories',
				accontains: inputValue,
				aclimit: 255
			} ).done( function ( response ) {
				var suggestions = response.query.allcategories,
					selected = this.getSelectedCategories();

				// Remove usernames, which are already selected from suggestions
				suggestions = suggestions.map( function ( category ) {
					if ( selected.indexOf( category['*'] ) === -1 ) {
						// This is necessary in oder to match actual group names
						return new OO.ui.MenuOptionWidget( {
							data: category['*'],
							label: category['*']
						} );
					}
					return undefined;
				} ).filter( function ( item ) {
					return item !== undefined;
				} );

				// Remove all items from menu add fill it with new
				this.menu.clearItems();
				this.menu.addItems( suggestions );

				if ( suggestions.length ) {
					// Enable Narrator focus on menu item, see T250762.
					this.menu.$focusOwner.attr( 'aria-activedescendant', suggestions[ 0 ].$element.attr( 'id' ) );
				}

				// Make the menu visible; it might not be if it was previously empty
				this.menu.toggle( true );

				this.popPending();
			}.bind( this ) ).fail( this.popPending.bind( this ) );

		} else {
			this.menu.clearItems();
			this.menu.toggle( false );
		}
	};


	OOJSPlus.ui.widget.CategoryMultiSelectWidget.prototype.onInputChange = function () {
		OOJSPlus.ui.widget.CategoryMultiSelectWidget.parent.prototype.onInputChange.apply( this, arguments );

		this.updateMenuItems();
	};

	/**
	 * If used inside HTML form, then update hiddenInput with list of
	 * newline-separated usernames.
	 *
	 * @private
	 */
	OOJSPlus.ui.widget.CategoryMultiSelectWidget.prototype.updateHiddenInput = function () {
		if ( '$hiddenInput' in this ) {
			this.$hiddenInput.val( this.getSelectedCategories().join( '\n' ) );
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
	OOJSPlus.ui.widget.CategoryMultiSelectWidget.prototype.onMultiselectChange = function () {
		this.updateHiddenInput();
		this.input.setValue( '' );
	};

}() );
