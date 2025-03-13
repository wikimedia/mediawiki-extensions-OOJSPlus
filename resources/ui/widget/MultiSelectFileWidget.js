( function () {

	OOJSPlus.ui.widget.MultiSelectFileWidget = function ( config ) {
		config = config || {};

		this.uploadFiles = [];
		// Parent constructor
		OOJSPlus.ui.widget.MultiSelectFileWidget.parent.call( this, Object.assign( {}, config, {} ) );
		$( this.$input ).attr( 'multiple', 'true' );
	};

	OO.inheritClass( OOJSPlus.ui.widget.MultiSelectFileWidget, OO.ui.SelectFileInputWidget );
	OO.mixinClass( OOJSPlus.ui.widget.MultiSelectFileWidget, OO.ui.mixin.PendingElement );

	OOJSPlus.ui.widget.MultiSelectFileWidget.prototype.setValue = function ( files ) {
		if ( files === undefined ) {
			return;
		}

		if ( files ) {
			for ( const key in files ) {
				this.uploadFiles.push( files[ key ] );
			}
		} else {
			this.uploadFiles = [];
		}

		this.emit( 'change', this.uploadFiles );
	};

	OOJSPlus.ui.widget.MultiSelectFileWidget.prototype.getValue = function () {
		return this.uploadFiles;
	};

	/**
	 * if tiff file is added reader.onload is not triggered and
	 * deferred object is never resolved or rejected in parent.
	 * So its necessary to override this
	 * ERM40697
	 *
	 * @param {File} file
	 * @return {jQuery.Promise}
	 */
	OOJSPlus.ui.widget.MultiSelectFileWidget.prototype.loadAndGetImageUrl = function ( file ) {
		const deferred = $.Deferred(),
			reader = new FileReader();

		if (
			( OO.getProp( file, 'type' ) || '' ).indexOf( 'image/' ) === 0 &&
			file.size < this.thumbnailSizeLimit * 1024 * 1024
		) {
			reader.onload = function ( event ) {
				const img = document.createElement( 'img' );
				img.addEventListener( 'load', () => {
					if (
						img.naturalWidth === 0 ||
						img.naturalHeight === 0 ||
						img.complete === false
					) {
						deferred.reject();
					} else {
						deferred.resolve( event.target.result );
					}
				} );
				img.src = event.target.result;
			};
			reader.readAsDataURL( file );
			if ( file.type === 'image/tiff' ) {
				deferred.resolve( file );
			}
		} else {
			deferred.reject();
		}

		return deferred.promise();
	};

}() );
