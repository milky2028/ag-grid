var listOfCountries = ['United States','Russia','Australia','Canada','Norway','China','Zimbabwe','Netherlands','South Korea','Croatia',
    'France','Japan','Hungary','Germany','Poland','South Africa','Sweden','Ukraine','Italy','Czech Republic','Austria','Finland','Romania',
    'Great Britain','Jamaica','Singapore','Belarus','Chile','Spain','Tunisia','Brazil','Slovakia','Costa Rica','Bulgaria','Switzerland',
    'New Zealand','Estonia','Kenya','Ethiopia','Trinidad and Tobago','Turkey','Morocco','Bahamas','Slovenia','Armenia','Azerbaijan','India',
    'Puerto Rico','Egypt','Kazakhstan','Iran','Georgia','Lithuania','Cuba','Colombia','Mongolia','Uzbekistan','North Korea','Tajikistan',
    'Kyrgyzstan','Greece','Macedonia','Moldova','Chinese Taipei','Indonesia','Thailand','Vietnam','Latvia','Venezuela','Mexico','Nigeria',
    'Qatar','Serbia','Serbia and Montenegro','Hong Kong','Denmark','Portugal','Argentina','Afghanistan','Gabon','Dominican Republic','Belgium',
    'Kuwait','United Arab Emirates','Cyprus','Israel','Algeria','Montenegro','Iceland','Paraguay','Cameroon','Saudi Arabia','Ireland','Malaysia',
    'Uruguay','Togo','Mauritius','Syria','Botswana','Guatemala','Bahrain','Grenada','Uganda','Sudan','Ecuador','Panama','Eritrea','Sri Lanka',
    'Mozambique','Barbados'];

var columnDefs = [
    // this row just shows the row index, doesn't use any data from the row
    {headerName: "#", width: 50,
        cellRenderer: function(params) {
            return params.node.id + 1;
        },
        // we don't want to sort by the row index, this doesn't make sense as the point
        // of the row index is to know the row index in what came back from the server
        suppressSorting: true,
        suppressMenu: true },
    {headerName: "Athlete", field: "athlete", width: 150, suppressMenu: true},
    {headerName: "Age", field: "age", width: 90, filter: 'number', filterParams: {newRowsAction: 'keep'}},
    {headerName: "Country", field: "country", width: 120, filter: 'set', filterParams: {values: listOfCountries, newRowsAction: 'keep'}},
    {headerName: "Year", field: "year", width: 90, filter: 'set', filterParams: {values: ['2000','2004','2008','2012'], newRowsAction: 'keep'}},
    {headerName: "Date", field: "date", width: 110, suppressMenu: true},
    {headerName: "Sport", field: "sport", width: 110, suppressMenu: true},
    {headerName: "Gold", field: "gold", width: 100, suppressMenu: true},
    {headerName: "Silver", field: "silver", width: 100, suppressMenu: true},
    {headerName: "Bronze", field: "bronze", width: 100, suppressMenu: true},
    {headerName: "Total", field: "total", width: 100, suppressMenu: true}
];

var gridOptions = {
    enableServerSideSorting: true,
    enableServerSideFilter: true,
    enableColResize: true,
    paginationPageSize: 500,
    columnDefs: columnDefs,
    rowModelType: 'pagination',
    rowSelection: 'multiple',
    getRowNodeId: function(item) {
        return item.id;
    }
};

// when json gets loaded, it's put here, and  the datasource reads in from here.
// in a real application, the page will be got from the server.
var allOfTheData;

function setRowData(rowData) {
    allOfTheData = rowData;
    // give each row an id
    allOfTheData.forEach( function(data, index) {
        data.id = 'R' + (index + 1);
    });
    createNewDatasource();
}

function createNewDatasource() {
    if (!allOfTheData) {
        // in case user selected 'onPageSizeChanged()' before the json was loaded
        return;
    }
    var dataSource = {
        //rowCount: ???, - not setting the row count, infinite paging will be used
        getRows: function (params) {
            // this code should contact the server for rows. however for the purposes of the demo,
            // the data is generated locally, a timer is used to give the experience of
            // an asynchronous call
            console.log('asking for ' + params.startRow + ' to ' + params.endRow);
            setTimeout( function() {
                // take a chunk of the array, matching the start and finish times
                var dataAfterSortingAndFiltering = sortAndFilter(params.sortModel, params.filterModel);
                var rowsThisPage = dataAfterSortingAndFiltering.slice(params.startRow, params.endRow);
                // see if we have come to the last page. if we have, set lastRow to
                // the very last row of the last page. if you are getting data from
                // a server, lastRow could be returned separately if the lastRow
                // is not in the current page.
                var lastRow = -1;
                if (dataAfterSortingAndFiltering.length <= params.endRow) {
                    lastRow = dataAfterSortingAndFiltering.length;
                }
                params.successCallback(rowsThisPage, lastRow);
            }, 500);
        }
    };

    gridOptions.api.setDatasource(dataSource);
}

function sortAndFilter(sortModel, filterModel) {
    return sortData(sortModel, filterData(filterModel, allOfTheData))
}

function sortData(sortModel, data) {
    var sortPresent = sortModel && sortModel.length > 0;
    if (!sortPresent) {
        return data;
    }
    // do an in memory sort of the data, across all the fields
    var resultOfSort = data.slice();
    resultOfSort.sort(function(a,b) {
        for (var k = 0; k<sortModel.length; k++) {
            var sortColModel = sortModel[k];
            var valueA = a[sortColModel.colId];
            var valueB = b[sortColModel.colId];
            // this filter didn't find a difference, move onto the next one
            if (valueA==valueB) {
                continue;
            }
            var sortDirection = sortColModel.sort === 'asc' ? 1 : -1;
            if (valueA > valueB) {
                return sortDirection;
            } else {
                return sortDirection * -1;
            }
        }
        // no filters found a difference
        return 0;
    });
    return resultOfSort;
}

function filterData(filterModel, data) {
    var filterPresent = filterModel && Object.keys(filterModel).length > 0;
    if (!filterPresent) {
        return data;
    }

    var resultOfFilter = [];
    for (var i = 0; i<data.length; i++) {
        var item = data[i];

        if (filterModel.age) {
            var age = item.age;
            var allowedAge = parseInt(filterModel.age.filter);
            // EQUALS = 1;
            // LESS_THAN = 2;
            // GREATER_THAN = 3;
            if (filterModel.age.type == 1) {
                if (age !== allowedAge) {
                    continue;
                }
            } else if (filterModel.age.type == 2) {
                if (age >= allowedAge) {
                    continue;
                }
            } else {
                if (age <= allowedAge) {
                    continue;
                }
            }
        }

        if (filterModel.year) {
            if (filterModel.year.indexOf(item.year.toString()) < 0) {
                // year didn't match, so skip this record
                continue;
            }
        }

        if (filterModel.country) {
            if (filterModel.country.indexOf(item.country) < 0) {
                // country didn't match, so skip this record
                continue;
            }
        }

        resultOfFilter.push(item);
    }

    return resultOfFilter;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function() {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    // do http request to get our sample data - not using any framework to keep the example self contained.
    // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', '../olympicWinners.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
            var httpResponse = JSON.parse(httpRequest.responseText);
            setRowData(httpResponse);
        }
    };
});
