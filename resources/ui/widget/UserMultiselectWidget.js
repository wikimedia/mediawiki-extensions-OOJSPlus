OOJSPlus.ui.widget.UsersMultiselectWidget = function ( cfg ) {
	cfg = cfg || {};

	OOJSPlus.ui.widget.UsersMultiselectWidget.parent.call( this, cfg );

	OO.ui.mixin.RequiredElement.call( this, cfg );

	this.setValidation( cfg.validate || 'non-empty' );

	this.$element.addClass( 'oojsplus-userMultiSelect-widget' );
};

OO.inheritClass( OOJSPlus.ui.widget.UsersMultiselectWidget, mw.widgets.UsersMultiselectWidget );
OO.mixinClass( OOJSPlus.ui.widget.UsersMultiselectWidget, OO.ui.mixin.RequiredElement );

OOJSPlus.ui.widget.UsersMultiselectWidget.static.validationPatterns = {
	'non-empty': /.+/,
	integer: /^\d+$/
};

/**
 * @inheritdoc
 */
OOJSPlus.ui.widget.UsersMultiselectWidget.prototype.setValue = function ( valueObject ) {
	valueObject = Array.isArray( valueObject ) ? valueObject : [ valueObject ];

	// We override this method from the parent, to make sure we are adding proper
	// menu items, and are accounting for cases where we have this widget with
	// a menu but also 'allowArbitrary'
	if ( !this.menu ) {
		return;
	}

	this.clearItems();

	const originalAllowArbitrary = this.allowArbitrary;

	this.allowArbitrary = true;
	valueObject.forEach( ( obj ) => {
		let data, label;

		if ( typeof obj === 'string' ) {
			data = label = obj;
		} else {
			data = obj.data;
			label = obj.label;
		}

		// Check if the item is in the menu
		const menuItem = this.menu.getItemFromLabel( label ) || this.menu.findItemFromData( data );
		if ( menuItem ) {
			// Menu item found, add the menu item
			this.addTag( menuItem.getData(), menuItem.getLabel() );
			// Make sure that item is also selected
			this.menu.selectItem( menuItem );
		} else if ( this.allowArbitrary ) {
			// If the item isn't in the menu, only add it if we
			// allow for arbitrary values
			this.addTag( data, label );
		}
	} );
	this.allowArbitrary = originalAllowArbitrary;
};

/**
 * Set the validation pattern.
 *
 * The validation pattern is either a regular expression, a function, or the symbolic name of a
 * pattern defined by the class: 'non-empty' (the value cannot be an empty string) or 'integer' (the
 * value must contain only numbers).
 *
 * @param {RegExp|Function|string|null} validate Regular expression, function, or the symbolic name
 *  of a pattern (either ‘integer’ or ‘non-empty’) defined by the class.
 */
OOJSPlus.ui.widget.UsersMultiselectWidget.prototype.setValidation = function ( validate ) {
	this.validate = validate instanceof RegExp || validate instanceof Function ?
		validate :
		this.constructor.static.validationPatterns[ validate ];
};

/**
 * Update autocomplete menu with items.
 *
 * @private
 */
OOJSPlus.ui.widget.UsersMultiselectWidget.prototype.updateMenuItems = function () {
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

		this.getLookupRequest().done( ( response ) => {
			let suggestions = response;
			const selected = this.getSelectedUsernames();

			// Remove usernames, which are already selected from suggestions
			suggestions = suggestions.map( ( user ) => {
				if ( selected.indexOf( user.user_name ) === -1 ) {
					return new OO.ui.MenuOptionWidget( {
						data: user.user_name,
						label: user.user_real_name || user.user_name,
						id: user.user_name
					} );
				}
				return undefined;
			} ).filter( ( item ) => item !== undefined );

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
		} ).fail( this.popPending.bind( this ) );
	} else {
		this.menu.clearItems();
	}
};

OOJSPlus.ui.widget.UsersMultiselectWidget.prototype.getLookupRequest = function () {
	const inputValue = this.inputValue;
		filters = [ {
			type: 'boolean',
			value: true,
			operator: '==',
			property: 'enabled'
		} ];

	if ( this.excludeGroups ) {
		filters.push( {
			type: 'list',
			value: this.excludeGroups,
			operator: 'nct',
			property: 'groups'
		} );
	}
	if ( this.groups ) {
		filters.push( {
			type: 'list',
			value: this.groups,
			operator: 'in',
			property: 'groups'
		} );
	}

	return this.makeLookup( {
		query: inputValue,
		filter: JSON.stringify( filters ),
		limit: inputValue !== '' ? 10 : 5
	} );
};

OOJSPlus.ui.widget.UsersMultiselectWidget.prototype.makeLookup = function ( data ) {
	return mws.commonwebapis.user.query( data );
};

/**
 * Sets the 'invalid' flag appropriately.
 *
 * @param {boolean} [isValid] Optionally override validation result
 */
OOJSPlus.ui.widget.UsersMultiselectWidget.prototype.setValidityFlag = function ( isValid ) {
	const widget = this,
		setFlag = function ( valid ) {
			widget.setFlags( { invalid: !valid } );
		};

	if ( isValid !== undefined ) {
		setFlag( isValid );
	} else {
		this.getValidity().then( () => {
			setFlag( true );
		}, () => {
			setFlag( false );
		} );
	}
};

/**
 * Get the validity of current value.
 *
 * This method returns a promise that resolves if the value is valid and rejects if
 * it isn't. Uses the {@link #validate validation pattern}  to check for validity.
 *
 * @return {jQuery.Promise} A promise that resolves if the value is valid, rejects if not.
 */
OOJSPlus.ui.widget.UsersMultiselectWidget.prototype.getValidity = function () {
	function rejectOrResolve( valid ) {
		const deferred = $.Deferred(),
			promise = valid ? deferred.resolve() : deferred.reject();
		return promise.promise();
	}

	if ( !this.validate ) {
		return rejectOrResolve( true );
	}

	// Run our checks if the browser thinks the field is valid
	let result;
	if ( this.validate instanceof Function ) {
		result = this.validate( this.getValue() );
		if ( result && typeof result.promise === 'function' ) {
			return result.promise().then( ( valid ) => rejectOrResolve( valid ) );
		}
	} else {
		// The only other type we accept is a RegExp, see #setValidation
		result = this.validate.test( this.getValue() );
	}
	return rejectOrResolve( result );
};
