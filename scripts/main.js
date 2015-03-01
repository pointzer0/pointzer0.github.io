/* global $ */
var SpreadSheet = (function(url, pledgedCell, depositedCell, min, max) {
    'use strict';
    return {
        totalPledged: null,
        totalDeposited: null,
        totalPledgedCell: pledgedCell || 'https://spreadsheets.google.com/feeds/cells/1byCDo37nZNdmEXYtog8k24XcE3hO-Y9WWeOrrbmy3Go/od6/public/basic/R3C4',
        totalDepositedCell: depositedCell || 'https://spreadsheets.google.com/feeds/cells/1byCDo37nZNdmEXYtog8k24XcE3hO-Y9WWeOrrbmy3Go/od6/public/basic/R3C5',
        min: min || 0,
        max: max || 10000,
        options: {
            url: url || 'https://spreadsheets.google.com/feeds/cells/1byCDo37nZNdmEXYtog8k24XcE3hO-Y9WWeOrrbmy3Go/od6/public/basic?hl=en_US&alt=json',
            type: 'GET',
            dataType: 'json',
            contentType: 'application/json;'
        },
        getTotals: function(data) {
            if (data.feed.entry && data.feed.entry.length > 0) {
                var totalPledged = this.totalPledged = this.getCellContent(data.feed.entry, this.totalPledgedCell);
                var totalDeposited = this.totalDeposited = this.getCellContent(data.feed.entry, this.totalDepositedCell);
                return {
                    totalPledged: this.parseContent(totalPledged),
                    totalPledgedNormalized: this.normalize(this.parseContent(totalPledged)),
                    totalDeposited: this.parseContent(totalDeposited),
                    totalDepositedNormalized: this.normalize(this.parseContent(totalDeposited))
                };
            }
        },
        parseContent: function(content) {
            return parseInt(content.replace(/\u20ac/g, '').replace(/,/g, ''));
        },
        getCellContent: function(data, cellId) {
            return $.grep(data, function(cell) {
                return cell.id.$t === cellId;
            })[0].content.$t;
        },
        fetchData: function() {
            return $.ajax(this.options);
        },
        normalize: function(total) {
            return (total - this.min) / (this.max - this.min) * 100;
        }
    };
}());


SpreadSheet.fetchData().then(function(data) {
    'use strict';
    var totals = SpreadSheet.getTotals(data);
    $({totalPledged: 0, totalPledgedNormalized: 0})
        .animate({totalPledged: totals.totalPledged,totalPledgedNormalized: totals.totalPledgedNormalized}, {
            duration: 3000,
            easing: 'swing',
            step: function() {
                $('.totalPledged').text(Math.round(this.totalPledged) + '\u20ac');
                $('.totalProgress .sr-only').text(Math.round(this.totalPledgedNormalized) + '% Complete');
                $('.totalProgress')
                    .attr('aria-valuenow', Math.round(this.totalPledgedNormalized))
                    .width(Math.round(this.totalPledgedNormalized) + '%');
            }
        });
});
