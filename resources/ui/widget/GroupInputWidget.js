( function () {
	OOJSPlus.ui.widget.GroupInputWidget = function( config ) {
		config = config || {};
		config.$overlay = true;

		OOJSPlus.ui.widget.GroupInputWidget.parent.call( this, $.extend( {}, config, { autocomplete: false } ) );

		OO.ui.mixin.LookupElement.call( this, config );

		this.$element.addClass( 'oojsplus-widget-groupInputWidget' );
		this.lookupMenu.$element.addClass( 'oojsplus-widget-groupInputWidget-menu' );
	};

	/* Setup */

	OO.inheritClass( OOJSPlus.ui.widget.GroupInputWidget, OO.ui.TextInputWidget );
	OO.mixinClass( OOJSPlus.ui.widget.GroupInputWidget, OO.ui.mixin.LookupElement );

	/* Methods */

	/**
	 * Handle menu item 'choose' event, updating the text input value to the value of the clicked item.
	 *
	 * @param {OO.ui.MenuOptionWidget} item Selected item
	 */
	OOJSPlus.ui.widget.GroupInputWidget.prototype.onLookupMenuChoose = function ( item ) {
		this.closeLookupMenu();
		this.setLookupsDisabled( true );
		this.setValue( item.getData() );
		this.setLookupsDisabled( false );
	};

	/**
	 * @inheritdoc
	 */
	OOJSPlus.ui.widget.GroupInputWidget.prototype.focus = function () {
		var retval;

		// Prevent programmatic focus from opening the menu
		this.setLookupsDisabled( true );

		// Parent method
		retval = OOJSPlus.ui.widget.GroupInputWidget.parent.prototype.focus.apply( this, arguments );

		this.setLookupsDisabled( false );

		return retval;
	};

	/**
	 * @inheritdoc
	 */
	OOJSPlus.ui.widget.GroupInputWidget.prototype.getLookupRequest = function () {
		var inputValue = this.value;

		return new mw.Api().get( {
			action: 'query',
			list: 'allgroups',
			agcontains: inputValue,
			agprop: 'displaytext'
		} );
	};

	OOJSPlus.ui.widget.GroupInputWidget.prototype.getLookupCacheDataFromResponse = function ( response ) {
		return response.query.allgroups || {};
	};

	OOJSPlus.ui.widget.GroupInputWidget.prototype.getLookupMenuOptionsFromData = function ( data ) {
		var i, groupData,
			items = [];

		for ( i = 0; i < data.length; i++ ) {
			groupData = data[i];
			items.push( new OO.ui.MenuOptionWidget( {
				label: groupData.displaytext,
				data: groupData.name
			} ) );
		}

		return items;
	};

}() );
