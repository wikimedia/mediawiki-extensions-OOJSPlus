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

var grid = new OOJSPlus.ui.data.GridWidget( {
	pageSize: 10,
	columns: {
		columns: {
			firstName: {
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
	},
	store: store,
} );

// Remote store
var remoteGrid = new OOJSPlus.ui.data.GridWidget( {
	columns: {
		columns: {
			firstName: {
				headerText: "First name",
				type: "text",
				sortable: true
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
				urlProperty: "up_url"
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
