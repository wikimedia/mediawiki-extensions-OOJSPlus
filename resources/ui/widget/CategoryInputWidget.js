( function () {
	OOJSPlus.ui.widget.CategoryInputWidget = function( config ) {
		config = config || {};
		config.$overlay = true;

		OOJSPlus.ui.widget.CategoryInputWidget.parent.call( this, $.extend( {}, config, { autocomplete: false } ) );

		OO.ui.mixin.LookupElement.call( this, config );

		this.$element.addClass( 'oojsplus-widget-categoryInputWidget' );
		this.lookupMenu.$element.addClass( 'oojsplus-widget-categoryInputWidget-menu' );
	};

	/* Setup */

	OO.inheritClass( OOJSPlus.ui.widget.CategoryInputWidget, OO.ui.TextInputWidget );
	OO.mixinClass( OOJSPlus.ui.widget.CategoryInputWidget, OO.ui.mixin.LookupElement );

	/* Methods */

	/**
	 * Handle menu item 'choose' event, updating the text input value to the value of the clicked item.
	 *
	 * @param {OO.ui.MenuOptionWidget} item Selected item
	 */
	OOJSPlus.ui.widget.CategoryInputWidget.prototype.onLookupMenuChoose = function ( item ) {
		this.closeLookupMenu();
		this.setLookupsDisabled( true );
		this.setValue( item.getData() );
		this.setLookupsDisabled( false );
	};

	/**
	 * @inheritdoc
	 */
	OOJSPlus.ui.widget.CategoryInputWidget.prototype.focus = function () {
		var retval;

		// Prevent programmatic focus from opening the menu
		this.setLookupsDisabled( true );

		// Parent method
		retval = OOJSPlus.ui.widget.CategoryInputWidget.parent.prototype.focus.apply( this, arguments );

		this.setLookupsDisabled( false );

		return retval;
	};

	/**
	 * @inheritdoc
	 */
	OOJSPlus.ui.widget.CategoryInputWidget.prototype.getLookupRequest = function () {
		var inputValue = this.value;

		return new mw.Api().get( {
			action: 'query',
			list: 'allcategories',
			acccontains: inputValue,
			acclimit: 255
		} );
	};

	OOJSPlus.ui.widget.CategoryInputWidget.prototype.getLookupCacheDataFromResponse = function ( response ) {
		return response.query.allcategories || {};
	};

	OOJSPlus.ui.widget.CategoryInputWidget.prototype.getLookupMenuOptionsFromData = function ( data ) {
		var i, items = [];

		for ( i = 0; i < data.length; i++ ) {
			items.push( new OO.ui.MenuOptionWidget( {
				label: data[i]['*'],
				data: data[i]['*']
			} ) );
		}

		return items;
	};

}() );
