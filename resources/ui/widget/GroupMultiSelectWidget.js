( function () {

	OOJSPlus.ui.widget.GroupMultiSelectWidget = function ( config ) {
		config = config || {};
		config.menu = config.menu || {};
		config.menu.filterFromInput = false;
		// Parent constructor
		OOJSPlus.ui.widget.GroupMultiSelectWidget.parent.call( this, Object.assign( {}, config, {} ) );

		if ( !config.hasOwnProperty( 'groupTypes' ) && config.hasOwnProperty( 'groupType' ) ) {
			// B/C
			config.groupTypes = [ config.groupType ];
		}
		this.groupTypes = config.groupTypes || [];
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
			this.$hiddenInput.prop( 'defaultValue', this.getSelectedGroups().join( '\n' ) );
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

	OO.inheritClass( OOJSPlus.ui.widget.GroupMultiSelectWidget, OO.ui.MenuTagMultiselectWidget );
	OO.mixinClass( OOJSPlus.ui.widget.GroupMultiSelectWidget, OO.ui.mixin.PendingElement );

	OOJSPlus.ui.widget.GroupMultiSelectWidget.prototype.getSelectedGroups = function () {
		return this.getValue();
	};

	OOJSPlus.ui.widget.GroupMultiSelectWidget.prototype.setValue = function ( value ) {
		if ( !value ) {
			// Value needs to be an array -> so add empty array if no value is given
			// ERM41355
			return OOJSPlus.ui.widget.GroupMultiSelectWidget.parent.prototype.setValue.call( this, [] );
		}
		this.setDisabled( true );
		this.pushPending();
		value = Array.isArray( value ) ? value : [ value ];
		const promises = [];
		for ( let i = 0; i < value.length; i++ ) {
			promises.push( this.getGroupData( value[ i ] ) );
		}

		const originalAllowArbitrary = this.allowArbitrary;
		Promise.all( promises ).then( ( groups ) => {
			this.allowArbitrary = true;
			for ( let i = 0; i < groups.length; i++ ) {
				if ( !groups[ i ] || $.isEmptyObject( groups[ i ] ) ) {
					continue;
				}
				this.addTag( groups[ i ].group_name, groups[ i ].displayname );
			}
			this.allowArbitrary = originalAllowArbitrary;
			this.emit( 'change', this.getSelectedGroups() );
			this.setDisabled( false );
			this.popPending();
		} );
	};

	OOJSPlus.ui.widget.GroupMultiSelectWidget.prototype.getGroupData = function ( group ) {
		if ( typeof group === 'object' ) {
			if ( group.hasOwnProperty( 'group_name' ) ) {
				group = group.group_name;
			} else {
				group = '';
			}
		}
		if ( !group ) {
			return $.Deferred().resolve().promise();
		}
		const dfd = $.Deferred();
		mws.commonwebapis.group.getByGroupName( group ).done( ( data ) => {
			dfd.resolve( data );
		} ).fail( () => {
			dfd.resolve( { group_name: group } ); // eslint-disable-line camelcase
		} );

		return dfd.promise();
	};

	OOJSPlus.ui.widget.GroupMultiSelectWidget.prototype.onInputFocus = function () {
		this.updateMenuItems();
	};

	/**
	 * Update autocomplete menu with items
	 *
	 * @private
	 */
	OOJSPlus.ui.widget.GroupMultiSelectWidget.prototype.updateMenuItems = function () {
		const inputValue = this.input.getValue();

		if ( inputValue === this.inputValue ) {
			// Do not restart api query if nothing has changed in the input
			return;
		} else {
			this.inputValue = inputValue;
		}

		const filters = [];
		if ( this.groupTypes.length > 0 ) {
			filters.push( {
				type: 'list',
				property: 'group_type',
				value: this.groupTypes,
				operator: 'in'
			} );
		}

		this.pushPending();

		mws.commonwebapis.group.query( {
			query: inputValue,
			filter: JSON.stringify( filters )
		} ).done( ( response ) => {
			const selectedGroups = this.getSelectedGroups();
			// Remove usernames, which are already selected from suggestions
			const suggestions = response.map( ( group ) => {
				if ( selectedGroups.indexOf( group.group_name ) === -1 ) {
					// This is necessary in oder to match actual group names
					return new OO.ui.MenuOptionWidget( {
						data: group.group_name,
						label: group.displayname || group.group_name,
						id: group.group_name
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
		} ).fail( ( e ) => {
			this.popPending();
			console.error( e ); // eslint-disable-line no-console
		} );
	};

	OOJSPlus.ui.widget.GroupMultiSelectWidget.prototype.onInputChange = function () {
		OOJSPlus.ui.widget.GroupMultiSelectWidget.parent.prototype.onInputChange.apply( this, arguments );

		this.updateMenuItems();
	};

	/**
	 * If used inside HTML form, then update hiddenInput with list of
	 * newline-separated usernames.
	 *
	 * @private
	 */
	OOJSPlus.ui.widget.GroupMultiSelectWidget.prototype.updateHiddenInput = function () {
		if ( '$hiddenInput' in this ) {
			this.$hiddenInput.val( this.getSelectedGroups().join( '\n' ) );
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
	OOJSPlus.ui.widget.GroupMultiSelectWidget.prototype.onMultiselectChange = function () {
		this.updateHiddenInput();
		this.input.setValue( '' );
	};

}() );
