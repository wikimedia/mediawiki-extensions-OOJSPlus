( function( mw, $ ) {
	OOJSPlus.ui.data.column.Action = function ( grid, cfg ) {
		cfg.editable = false;

		OOJSPlus.ui.data.column.Action.parent.call( this, cfg );
		this.grid = grid;
		this.icon = cfg.icon || '';
		this.title = cfg.title || '';
		this.id = cfg.actionId;
		this.label = cfg.label || '';

		this.$element.addClass( 'action-column' );
	};

	OO.inheritClass( OOJSPlus.ui.data.column.Action, OOJSPlus.ui.data.column.Column );

	OOJSPlus.ui.data.column.Action.prototype.renderCell = function( value, row ) {
		var $cell = $( '<td>' ).addClass( 'oojsplus-data-gridWidget-cell' );
		$cell.addClass( 'action-cell' );
		$cell.append( this.getViewControls( row ).$element );
		return $cell;
	};

	OOJSPlus.ui.data.column.Action.prototype.getViewControls = function( row ) {
		var button =  new OO.ui.ButtonWidget( {
			label: this.label,
			icon: this.icon,
			title: this.title,
			framed: false
		} );
		button.connect( this, {
			click: function() {
				this.grid.onAction( this.id, row );
			}
		} );
		return button;
	};

	OOJSPlus.ui.data.column.Action.prototype.getHeader = function() {
		return $( '<td>' ).addClass( 'oojsplus-data-gridWidget-cell oojsplus-data-gridWidget-column-header' );
	};

} )( mediaWiki, jQuery );