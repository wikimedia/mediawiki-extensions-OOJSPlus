OOJSPlus.ui.widget.NumberInputWidget = function ( cfg ) {
	cfg = cfg || {};
	OOJSPlus.ui.widget.NumberInputWidget.super.call( this, cfg );

	this.checkRangeForButtons();
};

OO.inheritClass( OOJSPlus.ui.widget.NumberInputWidget, OO.ui.NumberInputWidget );

OOJSPlus.ui.widget.NumberInputWidget.prototype.onButtonClick = function ( dir ) {
	this.adjustValue( dir * this.buttonStep );
	this.checkRangeForButtons();
};

OOJSPlus.ui.widget.NumberInputWidget.prototype.checkRangeForButtons = function () {
	if ( this.minusButton ) {
		if ( this.getNumericValue() === this.min ) {
			this.minusButton.setDisabled( true );
		} else {
			this.minusButton.setDisabled( false );
		}
	}
	if ( this.plusButton ) {
		if ( this.getNumericValue() === this.max ) {
			this.plusButton.setDisabled( true );
		} else {
			this.plusButton.setDisabled( false );
		}
	}
};
