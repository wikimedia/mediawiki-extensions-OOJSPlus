OOJSPlus.ui.widget.UsersMultiselectWidget = function( cfg ) {
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

	var originalAllowArbitrary = this.allowArbitrary;

	this.allowArbitrary = true;
	valueObject.forEach( function ( obj ) {
		var data, label;

		if ( typeof obj === 'string' ) {
			data = label = obj;
		} else {
			data = obj.data;
			label = obj.label;
		}

		// Check if the item is in the menu
		var menuItem = this.menu.getItemFromLabel( label ) || this.menu.findItemFromData( data );
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
	}.bind( this ) );
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
 * Sets the 'invalid' flag appropriately.
 *
 * @param {boolean} [isValid] Optionally override validation result
 */
OOJSPlus.ui.widget.UsersMultiselectWidget.prototype.setValidityFlag = function ( isValid ) {
	var widget = this,
		setFlag = function ( valid ) {
			widget.setFlags( { invalid: !valid } );
		};

	if ( isValid !== undefined ) {
		setFlag( isValid );
	} else {
		this.getValidity().then( function () {
			setFlag( true );
		}, function () {
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
		var deferred = $.Deferred(),
			promise = valid ? deferred.resolve() : deferred.reject();
		return promise.promise();
	}

	if ( !this.validate ) {
		return rejectOrResolve( true );
	}

	// Run our checks if the browser thinks the field is valid
	var result;
	if ( this.validate instanceof Function ) {
		result = this.validate( this.getValue() );
		if ( result && typeof result.promise === 'function' ) {
			return result.promise().then( function ( valid ) {
				return rejectOrResolve( valid );
			} );
		}
	} else {
		// The only other type we accept is a RegExp, see #setValidation
		result = this.validate.test( this.getValue() );
	}
	return rejectOrResolve( result );
};
