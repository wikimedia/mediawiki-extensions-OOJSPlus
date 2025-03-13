OOJSPlus.ui.widget.ContributionWidget = function ( timestamp, cfg ) {
	this.timestamp = timestamp;

	OOJSPlus.ui.widget.ContributionWidget.parent.call( this, cfg );
	this.$element.addClass( 'oojsplus-contribution-widget' );
};

OO.inheritClass( OOJSPlus.ui.widget.ContributionWidget, OOJSPlus.ui.widget.UserWidget );

OOJSPlus.ui.widget.ContributionWidget.prototype.render = function () {
	this.$nameBox.append( $( '<span>' ).addClass( 'user-display' ).text( this.getDisplayName() ) );
	if ( this.showRawUsername && this.getDisplayName() !== this.user.user_name ) {
		this.$nameBox.append( $( '<span>' ).addClass( 'user-username' ).text( this.user.user_name ) );
	}

	if ( this.showImage ) {
		const $userImage = $( '<span>' ).addClass( 'user-image' );
		if ( this.user.hasOwnProperty( 'user_image' ) && this.user.user_image ) {
			$userImage.html( this.user.user_image );
		} else {
			$userImage.append( $( '<div>' ).addClass( 'user-image-default' ) );
		}
		this.$element.append( $userImage );
	}
	if ( this.showLink && this.user.hasOwnProperty( 'page_url' ) ) {
		const $link = $( '<a>' ).attr( 'href', this.user.page_url );
		this.$nameBox.find( '.user-display' ).wrap( $link );
	}
	this.$nameBox.append( $( '<span>' ).addClass( 'action-timestamp' ).text( this.timestamp ) );
	this.$element.append( this.$nameBox );
	this.emit( 'loaded' );
};
