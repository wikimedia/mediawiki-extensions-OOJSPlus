( function () {

	OOJSPlus.ui.widget.UserGroupPickerWidget = function ( config ) {
		config = config || {};
		config.tagLimit = 1;

		OOJSPlus.ui.widget.UserGroupPickerWidget.parent.call( this, Object.assign( {}, config, {} ) );
	};

	OO.inheritClass( OOJSPlus.ui.widget.UserGroupPickerWidget, OOJSPlus.ui.widget.UserGroupMultiselectWidget );

	OOJSPlus.ui.widget.UserGroupPickerWidget.prototype.getValue = function () {
		const values = this.getInternalValue().map(
			this.deserializeValue.bind( this )
		).filter( ( value ) => value !== null );

		return values[ 0 ] || null;
	};

	OOJSPlus.ui.widget.UserGroupPickerWidget.prototype.setValue = function ( value ) {
		if ( Array.isArray( value ) ) {
			let singleValue = null;
			for ( let i = 0; i < value.length; i++ ) {
				if ( this.normalizeValueItem( value[ i ] ) !== null ) {
					singleValue = value[ i ];
					break;
				}
			}
			value = singleValue;
		}

		return OOJSPlus.ui.widget.UserGroupPickerWidget.parent.prototype.setValue.call( this, value || null );
	};

	OOJSPlus.ui.widget.UserGroupPickerWidget.prototype.onMultiselectChange = function () {
		const values = this.getInternalValue();

		if ( values.length > 1 ) {
			OOJSPlus.ui.widget.UserGroupMultiselectWidget.parent.prototype.setValue.call(
				this,
				[ values[ values.length - 1 ] ]
			);
			return;
		}

		this.updateHiddenInput();

		const currentTagValue = values[ 0 ] || '';
		if ( currentTagValue !== this.previousTagValue ) {
			const value = this.deserializeValue( currentTagValue );
			if ( value && value.type === 'user' ) {
				this.decorateUserTag( currentTagValue, { user_name: value.key } );
			} else if ( value && value.type === 'group' ) {
				this.decorateGroupTag( currentTagValue );
			}
			this.input.setValue( '' );
		}

		this.previousTagValue = currentTagValue;
	};

}() );
