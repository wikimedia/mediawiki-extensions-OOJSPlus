( function () {
	OOJSPlus.ui.widget.GroupInputWidget = function ( config ) {
		config = config || {};

		OOJSPlus.ui.widget.GroupInputWidget.parent.call( this, Object.assign( {}, config, { autocomplete: false } ) );

		OO.ui.mixin.LookupElement.call( this, config );

		this.allowEveryoneOption = config.allowEveryoneOption || false;

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
		this.selectedGroup = item.getData();
		this.setValue( item.getData() );
		this.setLookupsDisabled( false );
	};

	/**
	 * @inheritdoc
	 */
	OOJSPlus.ui.widget.GroupInputWidget.prototype.focus = function () {
		// Prevent programmatic focus from opening the menu
		this.setLookupsDisabled( true );

		// Parent method
		const retval = OOJSPlus.ui.widget.GroupInputWidget.parent.prototype.focus.apply( this, arguments );

		this.setLookupsDisabled( false );

		return retval;
	};

	OOJSPlus.ui.widget.GroupInputWidget.prototype.onEdit = function () {
		this.emit( 'change', this.$input.val() );
	}

	/**
	 * @inheritdoc
	 */
	OOJSPlus.ui.widget.GroupInputWidget.prototype.getLookupRequest = function () {
		const inputValue = this.$input.val();

		return mws.commonwebapis.group.query( {
			query: inputValue,
			allowEveryone: this.allowEveryoneOption
		} );
	};

	OOJSPlus.ui.widget.GroupInputWidget.prototype.getLookupCacheDataFromResponse = function ( response ) {
		return response || {};
	};

	OOJSPlus.ui.widget.GroupInputWidget.prototype.getLookupMenuOptionsFromData = function ( data ) {
		const items = [];
		let i, groupData;

		for ( i = 0; i < data.length; i++ ) {
			groupData = data[ i ];
			items.push( new OO.ui.MenuOptionWidget( {
				label: groupData.displayname || groupData.group_name,
				data: groupData.group_name
			} ) );
		}

		return items;
	};

	OOJSPlus.ui.widget.GroupInputWidget.prototype.getValue = function () {
		return this.selectedGroup || this.$input.val();
	};

	OOJSPlus.ui.widget.GroupInputWidget.prototype.setValue = async function ( value ) {
		if ( !value ) {
			OOJSPlus.ui.widget.GroupInputWidget.parent.prototype.setValue.call( this, '' );
			return;
		}
		mws.commonwebapis.group.getByGroupName( value ).done( ( data ) => {
			if ( data && data.displayname ) {
				this.$input.val( data.displayname );
			} else {
				this.$input.val( value );
			}
			this.selectedGroup = value;
		} );
	};

}() );
