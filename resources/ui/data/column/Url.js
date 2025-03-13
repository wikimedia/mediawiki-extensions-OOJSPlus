OOJSPlus.ui.data.column.Url = function ( cfg ) {
	OOJSPlus.ui.data.column.Url.parent.call( this, cfg );

	this.urlProperty = cfg.urlProperty;
	this.urlExternal = cfg.urlExternal || null;
	this.limitShownData = cfg.limitShownData || false;
	this.limitValue = cfg.limitValue || 2;

	this.$element.addClass( 'url-column' );
};

OO.inheritClass( OOJSPlus.ui.data.column.Url, OOJSPlus.ui.data.column.Column );

OOJSPlus.ui.data.column.Url.prototype.renderCell = function ( value, row ) {
	const $cell = OOJSPlus.ui.data.column.Url.parent.prototype.renderCell.call( this, value, row );
	$cell.addClass( 'url-cell' );
	return $cell;
};

OOJSPlus.ui.data.column.Url.prototype.getViewControls = function ( value, row ) {
	let url = row[ this.urlProperty ];
	if ( !Array.isArray( value ) ) {
		value = [ value ];
		if ( !Array.isArray( url ) ) {
			url = [ url ];
		}
	}

	if ( url.length === 1 ) {
		return this.getViewSingleControl( value[ 0 ], url[ 0 ] );
	}

	const items = [];
	for ( let i = 0; i < value.length; i++ ) {
		if ( this.limitShownData &&
				i > this.limitValue ) {
			items.push( this.getDataPopup( value, url ) );
			break;
		}
		items.push( this.getViewSingleControl( value[ i ], url[ i ] ) );
	}

	return new OO.ui.FieldsetLayout( { items: items } );
};

OOJSPlus.ui.data.column.Url.prototype.getViewSingleControl = function ( label, url ) {
	const btn = new OOJSPlus.ui.widget.LinkWidget( {
		href: url,
		label: label,
		target: this.urlExternal,
		classes: [ 'oojsplus-data-gridWidget-url-button' ]
	} );
	return btn;
};

OOJSPlus.ui.data.column.Url.prototype.sort = function ( a, b ) {
	return a.localeCompare( b );
};

OOJSPlus.ui.data.column.Url.prototype.getDataPopup = function ( value, url ) {
	return new OO.ui.PopupButtonWidget( {
		icon: 'ellipsis',
		label: mw.message( 'oojsplus-data-grid-widget-popup-title' ).plain(),
		invisibleLabel: true,
		$overlay: false,
		framed: false,
		popup: {
			$content: this.getPopupContent( value, url ),
			padded: true
		}
	} );
};

OOJSPlus.ui.data.column.Url.prototype.getPopupContent = function ( value, url ) {
	const $list = $( '<ul>' ).addClass( 'oojsplus-data-gridWidget-popup-list' );
	for ( let i = 0; i < value.length; i++ ) {
		$list.append( $( '<li>' )
			.append( $( '<a>' ).text( value[ i ] ).attr( {
				href: url[ i ]
			} ) ) );
	}
	return $list;
};

OOJSPlus.ui.data.registry.columnRegistry.register( 'url', OOJSPlus.ui.data.column.Url );
