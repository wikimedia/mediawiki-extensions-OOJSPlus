( function( mw, $ ) {
	OOJSPlus.ui.data.column.Delete = function ( cfg ) {
		cfg = cfg || {};

		cfg.id = 'delete';
		cfg.headerText = '';
		cfg.editable = false;
		cfg.width = 20;
		cfg.sortable = false;

		OOJSPlus.ui.data.column.Delete.parent.call( this, cfg );

		this.$element.addClass( 'delete-column' );
	};

	OO.inheritClass( OOJSPlus.ui.data.column.Delete, OOJSPlus.ui.data.column.Column );

	OOJSPlus.ui.data.column.Delete.prototype.renderCell = function( rowIndex ) {
		var $cell = $( '<td>' ).addClass( 'oojsplus-data-gridWidget-cell' );
		if( this.width ) {
			$cell.css( 'width', this.width + 'px' );
		}
		$cell.append( this.getDeleteButton().$element );
		return $cell;
	};

	OOJSPlus.ui.data.column.Delete.prototype.getDeleteButton = function() {
		var button = new OO.ui.ButtonWidget( {
			indicator: 'clear',
			framed: false,
			title: 'Delete',
			flags: [
				'destructive'
			]
		} );
		button.$element.addClass( 'oojsplus-data-gridWidget-delete' );
		return button;
	};
} )( mediaWiki, jQuery );