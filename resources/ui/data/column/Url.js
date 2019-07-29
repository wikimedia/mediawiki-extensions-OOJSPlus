( function( mw, $ ) {
	OOJSPlus.ui.data.column.Url = function ( cfg ) {
		cfg.editable = false;

		OOJSPlus.ui.data.column.Url.parent.call( this, cfg );

		this.urlProperty = cfg.urlProperty;

		this.$element.addClass( 'url-column' );
	};

	OO.inheritClass( OOJSPlus.ui.data.column.Url, OOJSPlus.ui.data.column.Column );

	OOJSPlus.ui.data.column.Url.prototype.renderCell = function( value, row ) {
		var $cell = $( '<td>' ).addClass( 'oojsplus-data-gridWidget-cell' );
		$cell.attr( 'data-column', this.id );
		$cell.attr( 'data-value', value );
		$cell.addClass( 'boolean-cell' );
		$cell.append( this.getViewControls( value, row ).$element );
		return $cell;
	};

	OOJSPlus.ui.data.column.Url.prototype.getViewControls = function( value, row ) {
		var url = row[this.urlProperty];
		var linkButton = new OO.ui.ButtonWidget( {
			href: url,
			label: value,
			framed: false
		} );
		return linkButton;
	};

	OOJSPlus.ui.data.column.Url.prototype.sort = function( a, b ) {
		return a.localeCompare( b );
	};

} )( mediaWiki, jQuery );