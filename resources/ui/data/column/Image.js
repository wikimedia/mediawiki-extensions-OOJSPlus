OOJSPlus.ui.data.column.Image = function ( cfg ) {
	OOJSPlus.ui.data.column.Image.parent.call( this, cfg );

	this.filenameProperty = cfg.filenameProperty || '';
	this.$element.addClass( 'image-column' );
};

OO.inheritClass( OOJSPlus.ui.data.column.Image, OOJSPlus.ui.data.column.Column );

OOJSPlus.ui.data.column.Image.prototype.renderCell = function( value, row ) {
	var $cell = OOJSPlus.ui.data.column.Image.parent.prototype.renderCell.call( this, value, row );
	$cell.addClass( 'image-cell' );
	return $cell;
};

OOJSPlus.ui.data.column.Image.prototype.getViewControls = function( value, row ) {
	this.filename = row[ this.filenameProperty ];
	this.thumbUrl = '';
	if ( row.hasOwnProperty( 'thumb_url' ) ) {
		this.thumbUrl = row.thumb_url;
	}
	var imageWidget =  new OOJSPlus.ui.widget.ImageWidget( {
		fileName: this.filename,
		fileUrl: this.thumbUrl
	} );
	imageWidget.connect( this, {
		preview: function( name ) {
			this.emit( 'preview', name, row );
			this.grid.emit( 'preview', name, row );
		}
	} );
	return imageWidget;
};

OOJSPlus.ui.data.column.Image.prototype.bindToGrid = function( grid ) {
	this.grid = grid;
};

OOJSPlus.ui.data.registry.columnRegistry.register( 'image', OOJSPlus.ui.data.column.Image );
