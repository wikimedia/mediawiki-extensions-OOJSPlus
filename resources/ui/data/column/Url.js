( function( mw, $ ) {
	OOJSPlus.ui.data.column.Url = function ( cfg ) {
		cfg.editable = false;

		OOJSPlus.ui.data.column.Url.parent.call( this, cfg );

		this.urlProperty = cfg.urlProperty;
		this.urlExternal = cfg.urlExternal || null;

		this.$element.addClass( 'url-column' );
	};

	OO.inheritClass( OOJSPlus.ui.data.column.Url, OOJSPlus.ui.data.column.Column );

	OOJSPlus.ui.data.column.Url.prototype.renderCell = function ( value, row ) {
		var $cell = $( '<td>' ).addClass( 'oojsplus-data-gridWidget-cell' );
		$cell.attr( 'data-column', this.id );
		$cell.attr( 'data-value', value );
		$cell.addClass( 'url-cell' );
		$cell.append( this.getViewControls( value, row ).$element );
		return $cell;
	};

	OOJSPlus.ui.data.column.Url.prototype.getViewControls = function( value, row ) {
		var url = row[this.urlProperty];
		if ( !Array.isArray( value ) ) {
			value = [ value ];
			if ( !Array.isArray( url ) ) {
				url = [ url ];
			}
		}

		if ( url.length === 1 ){
			return this.getViewSingleControl( value[0], url[0] );
		}

		var items = [];
		for ( var i = 0; i < value.length; i++ ) {
			items.push( this.getViewSingleControl( value[i], url[i] ) );
		}

		return new OO.ui.FieldsetLayout( { items: items } );
	};

	OOJSPlus.ui.data.column.Url.prototype.getViewSingleControl = function ( label, url ) {
		return new OO.ui.ButtonWidget( {
			href: url,
			label: label,
			framed: false,
			target: this.urlExternal
		} );
	};

	OOJSPlus.ui.data.column.Url.prototype.sort = function( a, b ) {
		return a.localeCompare( b );
	};

} )( mediaWiki, jQuery );
