OOJSPlus.ui.widget.UserWidget = function ( cfg ) {
	this.user = cfg || {};
	this.user._exists = false;

	OOJSPlus.ui.widget.UserWidget.parent.call( this, cfg );
	OO.ui.mixin.PendingElement.call( this, {} );

	this.showRawUsername = cfg.showRawUsername || false;
	this.showImage = cfg.showImage === undefined ? true : cfg.showImage;
	this.showLink = cfg.showLink === undefined ? true : cfg.showLink;
	this.showProfileOnHover = typeof cfg.showProfileOnHover === 'undefined' ? true : cfg.showProfileOnHover;

	this.$element.addClass( 'oojsplus-user-widget' );
	this.$nameBox = $( '<div>' ).addClass( 'user-name-cnt' );
	this.assertUserData().done( () => {
		this.render();
	} );
};

OO.inheritClass( OOJSPlus.ui.widget.UserWidget, OO.ui.Widget );
OO.mixinClass( OOJSPlus.ui.widget.UserWidget, OO.ui.mixin.PendingElement );

OOJSPlus.ui.widget.UserWidget.static.tagName = 'div';

OOJSPlus.ui.widget.UserWidget.prototype.render = function () {
	if ( !this.user._exists ) {
		this.$element.addClass( 'user-not-found' );
	}
	this.$nameBox.append( $( '<span>' ).addClass( 'user-display' ).text( this.getDisplayName() ) );
	if ( this.showRawUsername && this.getDisplayName() !== this.user.user_name ) {
		this.$nameBox.append( $( '<span>' ).addClass( 'user-username' ).text( this.user.user_name ) );
	}
	let $link = null;
	if ( this.showImage ) {
		const $userImage = $( '<span>' ).addClass( 'user-image' );
		if ( this.user.hasOwnProperty( 'user_image' ) && this.user.user_image ) {
			$userImage.html( this.user.user_image );
			if ( this.showLink ) {
				$link = $userImage.find( 'a' ).first();
				$link.append( this.$nameBox );
				this.$element.append( $userImage );
			} else {
				this.$element.append( $userImage );
				this.$element.append( this.$nameBox );
			}
		} else {
			const $defaultImage = $( '<div>' ).addClass( 'user-image-default' );
			if ( this.showLink && this.user.hasOwnProperty( 'page_url' ) ) {
				$link = $( '<a>' ).attr( 'href', this.user.page_url ).append( this.$nameBox );
				$defaultImage.append( $link );
				$userImage.append( $defaultImage );
				this.$element.append( $userImage );
			} else {
				$userImage.append( $defaultImage );
				this.$element.append( $userImage );
				this.$element.append( this.$nameBox );
			}
		}
	} else if ( this.showLink && this.user.hasOwnProperty( 'page_url' ) ) {
		$link = $( '<a>' ).attr( 'href', this.user.page_url ).append( this.$nameBox );
		this.$element.html( $link );
	} else {
		this.$element.append( this.$nameBox );
	}

	if (
		$link &&
		this.showProfileOnHover &&
		ext.userProfile &&
		typeof ext.userProfile.openUserInfoPopup === 'function'
	) {
		// This is not handled by the generic mechanism that uses data-bs-username,
		// because we want to control whether the popup is opened on hover, depending on the context the widget is in
		$link.on( 'mouseenter', () => {
			ext.userProfile.openUserInfoPopup( this.user.user_name, $link );
		} );
		$link.on( 'mouseleave', () => {
			ext.userProfile.closeUserInfoPopup( this.user.user_name );
		} );
	} else if ( !this.showProfileOnHover && $link ) {
		// Prevent automatic profile popup if not requested
		$link.removeAttr( 'data-bs-username' );
	}
	this.emit( 'loaded' );
};

OOJSPlus.ui.widget.UserWidget.prototype.getDisplayName = function () {
	return this.user.user_real_name || this.user.user_name;
};

OOJSPlus.ui.widget.UserWidget.prototype.assertUserData = function () {
	const dfd = $.Deferred();
	const required = [ 'user_name', 'user_real_name' ];
	let misses = false;

	if ( this.showImage ) {
		required.push( 'user_image' );
	}
	if ( this.showLink ) {
		required.push( 'page_url' );
	}
	for ( let i = 0; i < required.length; i++ ) {
		if ( !this.user.hasOwnProperty( required[ i ] ) ) {
			misses = true;
		}
	}
	if ( misses ) {
		this.pushPending();
		mws.commonwebapis.user.getByUsername( this.user.user_name ).done( ( data ) => {
			if ( !$.isEmptyObject( data ) ) {
				this.user = data;
				this.user._exists = true;
			}
			this.popPending();
			dfd.resolve();
		} ).fail( () => {
			this.popPending();
			dfd.resolve();
		} );
		return dfd.promise();
	}

	return dfd.resolve().promise();
};
