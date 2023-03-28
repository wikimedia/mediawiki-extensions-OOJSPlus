// Local store
var up_url = 'http://url-to-user';
var store = new OOJSPlus.ui.data.store.Store( {
	data: [
		{ firstName: "John", lastName: "Doe", address: "Main street 22", userpage: "JD1", up_url: up_url, active: true },
		{ firstName: "Stephen", lastName: "Adams", address: "That street 1", userpage: "SA1", up_url: up_url, active: false },
		{ firstName: "Adriana", lastName: "C. Ocampo Uria", address: "8702 Victoria Street", userpage: "AC1", up_url: up_url, active: true },
		{ firstName: "Caroline", lastName: "Herschel", address: "849 Princeton Drive ", userpage: "CH", up_url: up_url, active: true },
		{ firstName: "Chien-Shiung", lastName: "Wu", address: "8017 Peg Shop St. ", userpage: "CSW", up_url: up_url, active: true },
		{ firstName: "Dorothy", lastName: "Hodgkin", address: "850 Princeton Drive", userpage: "DH", up_url: up_url, active: false },
		{ firstName: "Elizabeth", lastName: "Blackburn", address: "628 Heather St. ", userpage: "EB", up_url: up_url, active: true },
		{ firstName: "Geraldine", lastName: "Seydoux", address: "11 Acacia Ave.", userpage: "GS", up_url: up_url, active: true },
		{ firstName: "Gertrude", lastName: "B. Elion", address: "9542 Silver Spear Avenue ", userpage: "GBE", up_url: up_url, active: false }
	],
	remoteFilter: false,
	remoteSort: false
} );

/**
 * Column definition:
 * dataKey : {
 *     headerText: "Column header text",
 *     type: "text" | "number" | "boolean" | "url" | "user" | "date" | "icon" | "action",
 *     align: "left" | "center" | "right",
 *     // Optional properties:
 *     sortable: true | false,
 *     filter: {
 *          type: "text" | "number" | "boolean" | "list" | "user"
 *     },
 *     sticky: true | false, // Only on first column
 *     width: {number},
 *     // If you want to display a different value than the one in the data model, you can specify the "display" property
 *     display: {string},
 *     valueParser: function ( value, row ) {
 *          //return {string} | {OO.ui.Widget} | {OO.ui.HtmlSnippet}
 *     },
 *     urlProperty: {string}, // Only for type "url", data key that holds the URL
 *     onlyShowTrue: true | false, // Only for type "boolean", if true, only show true values, show nothing for false
 *
 * }
 * @type {OOJSPlus.ui.data.GridWidget}
 */

var grid = new OOJSPlus.ui.data.GridWidget( {
	pageSize: 10,
	columns: {
		firstName: {
			// For grids with a lot of columns that might extends outside the viewport,
			// you can specify the first column to be sticky. It means that even if you scroll the table, the first
			// column will always be visible. If `sticky` is specified, column must have a width specified as well
			sticky: true,
			width: 200,
			headerText: "First name",
			type: "text",
			sortable: true,
			filter: {
				type: 'text'
			}
		},
		lastName: {
			headerText: "Last name",
			type: "text",
			sortable: true
		},
		address: {
			headerText: "Address",
			type: "text"
		},
		userpage: {
			headerText: "User page",
			type: "url",
			urlProperty: "up_url"
		},
		active: {
			width: 30,
			headerText: "Active",
			type: "boolean"
		}
	},
	store: store,
} );

// Remote store
var remoteGrid = new OOJSPlus.ui.data.GridWidget( {
	columns: {
		firstName: {
			headerText: "First name",
			type: "text",
			sortable: true,
			// You can change the field that will be used for display of this column
			// This is useful if you want to perform filtering/sorting on a "raw" field value,
			// but want to display a "formatted" value.
			// In that case, you can specify the formatted value as the "display" property
			display: 'firstName_formatted'
		},
		lastName: {
			headerText: "Last name",
			type: "text",
			sortable: true,
			filter: {
				type: 'text'
			}
		},
		address: {
			headerText: "Address",
			type: "text",
			valueParser: function ( value, row ) {
				// value is the current field, equal to row.address in this case
				// Can return a string, an OOJS ui widget, or OO.ui.HtmlSnippet
				return value + ',' + row.zip + ' ' + row.city;
			}
		},
		userpage: {
			headerText: "User page",
			type: "url",
			urlProperty: "up_url",
		},
		active: {
			width: 30,
			headerText: "Active",
			type: "boolean",
			filter: {
				type: 'list',
				list: [
					// Specification for checkbox multiselect options
					{ data: false, label: 'No' },
					{ data: true, label: 'Yes' },
				]
			}
		},
		// Action field, not part of the data model, but triggers a certain action on the row
		detailsAction: {
			type: "action",
			actionId: 'details',
			title: 'Show more info',
			icon: 'infoFilled'
		}

	},
	store: new OOJSPlus.ui.data.store.RemoteStore( {
		action: 'my-api-store',
		pageSize: 25,
		filter: {
			firstName: {
				operator: 'ct',
				value: 'John',
				type: 'text'
			}
		},
		sorter: {
			firstName: {
				direction: 'ASC'
			}
		}
	} )
} );

remoteGrid.connect( this, {
	action: function( action, row ) {
		if ( action !== 'details' ) {
			return;
		}
		// Action "details" triggered for row
		console.log( "action triggered" );
	}
} );
