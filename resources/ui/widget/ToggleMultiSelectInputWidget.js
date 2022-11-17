( function( mw, $ ) {
	OOJSPlus.ui.widget.ToggleMultiSelectInputWidget = function( cfg ) {
		cfg = cfg || {};

		this.optionWidgets = [];
		OOJSPlus.ui.widget.ToggleMultiSelectInputWidget.parent.call( this, cfg );
		this.$input.remove();

		this.addOptions( cfg.options || [] );
	};

	OO.inheritClass( OOJSPlus.ui.widget.ToggleMultiSelectInputWidget, OO.ui.InputWidget );

	OOJSPlus.ui.widget.ToggleMultiSelectInputWidget.prototype.addOptions = function( options ) {
		var i, len, option, optionWidget;

		for ( i = 0, len = options.length; i < len; i++ ) {
			option = options[i];
			optionWidget = new OO.ui.ToggleSwitchWidget( {
				data: option.data,
				classes: [ 'oojsplus-ui-widget-togglemultiselectinputwidget-option' ],
			} );
			this.optionWidgets.push( optionWidget );
			optionWidget.connect( this, {
				change: 'onOptionChange'
			} );

			this.$element.append( new OO.ui.FieldLayout( optionWidget, {
				align: 'left',
				label: option.label,
			} ).$element );
		}
	};

	OOJSPlus.ui.widget.ToggleMultiSelectInputWidget.prototype.getValue = function() {
		var i, len, value = [];
		for ( i = 0, len = this.optionWidgets.length; i < len; i++ ) {
			if ( this.optionWidgets[i].getValue() ) {
				value.push( this.optionWidgets[i].getData() );
			}
		}
		return value;
	};

	OOJSPlus.ui.widget.ToggleMultiSelectInputWidget.prototype.setValue = function( value ) {
		if ( !value ) {
			return;
		}
		var i, len;
		for ( i = 0, len = this.optionWidgets.length; i < len; i++ ) {
			this.optionWidgets[i].setValue( $.inArray( this.optionWidgets[i].getData(), value ) !== -1 );
		}
	};

	OOJSPlus.ui.widget.ToggleMultiSelectInputWidget.prototype.onOptionChange = function() {
		this.emit( 'change', this.getValue() );
	};
} ) ( mediaWiki, jQuery );
