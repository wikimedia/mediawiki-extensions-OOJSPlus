( function () {

	OOJSPlus.ui.widget.MultiSelectFileWidget = function( config ) {
		config = config || {};

		this.uploadFiles = [];
		// Parent constructor
		OOJSPlus.ui.widget.MultiSelectFileWidget.parent.call( this, $.extend( {}, config, {} ) );
		$( this.$input ).attr( 'multiple', 'true' );
	}

	OO.inheritClass( OOJSPlus.ui.widget.MultiSelectFileWidget, OO.ui.SelectFileWidget );
	OO.mixinClass( OOJSPlus.ui.widget.MultiSelectFileWidget, OO.ui.mixin.PendingElement );

	OOJSPlus.ui.widget.MultiSelectFileWidget.prototype.setValue = function ( files ) {
		if ( files === undefined ) {
			return;
		}

		if ( files ) {
			for ( var key in files ) {
				this.uploadFiles.push( files[ key ] );
			}
		} else {
			this.uploadFiles = [];
		}

		this.emit( 'change', this.uploadFiles );
	}

	OOJSPlus.ui.widget.MultiSelectFileWidget.prototype.getValue = function() {
		return this.uploadFiles;
	}

}() );
